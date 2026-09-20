import Stripe from "stripe";
import { stripe } from "@/utils/stripe";
import { createAdminClient } from "@/utils/supabase/admin";
import { isLifetimeStatus } from "@/utils/subscription";
import type { OfferKind } from "@/utils/offers";
import {
    sendSubscriptionActivatedEmail,
    sendSubscriptionCanceledEmail,
    sendAdminNewSubscriptionEmail,
    sendAdminSubscriptionCanceledEmail,
    sendPaymentFailedEmail,
    sendAdminPaymentFailedEmail,
    sendLifetimeActivatedEmail,
    sendAdminNewLifetimeEmail,
    sendLifetimeMainframeEndedEmail,
} from "@/utils/mail";

export const runtime = "nodejs";

/**
 * Type d'offre porté par les metadata posées à la création du checkout (cf. createCheckoutSession).
 * Absent = abonnement standard : c'est le cas de toutes les souscriptions créées avant l'offre à vie.
 */
function offerKindOf(metadata: Stripe.Metadata | null | undefined): OfferKind {
    const kind = metadata?.offer_kind;
    return kind === "LIFETIME" || kind === "LIFETIME_ADDON" ? kind : "SUBSCRIPTION";
}

/**
 * Attribue le statut LIFETIME après le paiement unique de l'offre à vie : modules à vie, plus
 * mainframe + feedback pendant `mainframe_months` mois (durée lue dans offer_settings au moment
 * de l'achat, pour que modifier le réglage n'affecte pas les achats passés).
 * Idempotent : Stripe peut rejouer l'évènement, et une seconde exécution ne doit ni repousser la
 * date de fin ni renvoyer les emails.
 */
async function activateLifetime(supabase: ReturnType<typeof createAdminClient>, session: Stripe.Checkout.Session) {
    const userId = session.metadata?.supabase_user_id;
    if (!userId) return;

    const { data: offer } = await supabase
        .from("offer_settings")
        .select("mainframe_months")
        .eq("kind", "LIFETIME")
        .single();

    const mainframeEndsAt = new Date();
    mainframeEndsAt.setUTCMonth(mainframeEndsAt.getUTCMonth() + (offer?.mainframe_months ?? 3));

    // Un abonné (ACTIVE) ou un impayé (UNPAID) qui passe à l'offre à vie a encore une souscription
    // Stripe : on la relève AVANT que l'update ci-dessous n'efface son id, pour l'arrêter ensuite.
    const { data: previous } = await supabase
        .from("users")
        .select("subscription_status, stripe_subscription_id")
        .eq("id", userId)
        .maybeSingle();

    const { data: updatedUser, error } = await supabase
        .from("users")
        .update({
            subscription_status: "LIFETIME",
            mainframe_ends_at: mainframeEndsAt.toISOString(),
            stripe_customer_id: session.customer as string,
            // Un éventuel ancien abonnement (impayé/annulé) ne doit plus être piloté depuis ce profil.
            stripe_subscription_id: null,
            cancel_at_period_end: false,
            current_period_end: null,
        })
        .eq("id", userId)
        .or("subscription_status.is.null,subscription_status.not.in.(LIFETIME,LIFETIME_EXPIRED,LIFETIME_ADDON)")
        .select("email, name")
        .maybeSingle();

    if (error) {
        console.error("Failed to activate lifetime access:", error);
        return;
    }
    // Aucune ligne modifiée : l'évènement a déjà été traité.
    if (!updatedUser?.email) return;

    // Arrêt de l'ancien abonnement mensuel pour ne pas facturer deux fois. ACTIVE : il court jusqu'à
    // la fin de la période déjà payée (l'utilisateur a l'accès à vie de toute façon) puis s'arrête.
    // UNPAID : il est en cours de relances de paiement, on l'annule tout de suite. Les évènements
    // Stripe qui en découlent sont ignorés par les gardes "statut lifetime" plus bas, donc ils
    // n'écrasent pas le nouveau statut.
    let replacedSubscription = false;
    if (previous?.stripe_subscription_id && (previous.subscription_status === "ACTIVE" || previous.subscription_status === "UNPAID")) {
        try {
            if (previous.subscription_status === "ACTIVE") {
                await stripe.subscriptions.update(previous.stripe_subscription_id, { cancel_at_period_end: true });
                replacedSubscription = true;
            } else {
                await stripe.subscriptions.cancel(previous.stripe_subscription_id);
            }
        } catch (stripeError) {
            // À traiter à la main dans Stripe : l'accès à vie est déjà attribué, mais l'abonnement
            // pourrait continuer à facturer.
            console.error("Failed to stop previous subscription after lifetime purchase:", previous.stripe_subscription_id, stripeError);
        }
    }

    try {
        await sendLifetimeActivatedEmail(updatedUser.email, updatedUser.name || "Student", mainframeEndsAt.toISOString(), replacedSubscription);
    } catch (mailError) {
        console.error("Lifetime activated email failed:", mailError);
    }

    try {
        await sendAdminNewLifetimeEmail(updatedUser.name || "Student", updatedUser.email);
    } catch (mailError) {
        console.error("Admin new lifetime email failed:", mailError);
    }
}

export async function POST(request: Request) {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
        return new Response("Missing stripe-signature header", { status: 400 });
    }

    let event: Stripe.Event;
    try {
        event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
    } catch (err) {
        console.error("Stripe webhook signature verification failed:", err);
        return new Response(`Webhook Error: ${err instanceof Error ? err.message : "invalid signature"}`, { status: 400 });
    }

    const supabase = createAdminClient();

    switch (event.type) {
        case "checkout.session.completed":
        case "checkout.session.async_payment_succeeded": {
            const session = event.data.object as Stripe.Checkout.Session;
            const userId = session.metadata?.supabase_user_id;
            const offerKind = offerKindOf(session.metadata);

            // Offre à vie = paiement unique. Un moyen de paiement asynchrone (ex. SEPA) termine la
            // session avec payment_status "unpaid" : l'accès n'est donné qu'à l'évènement
            // async_payment_succeeded, jamais sur une simple session complétée mais non payée.
            if (offerKind === "LIFETIME") {
                if (session.payment_status === "paid") {
                    await activateLifetime(supabase, session);
                }
                break;
            }

            if (userId && session.subscription) {
                const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
                const periodEndSeconds = subscription.items.data[0]?.current_period_end;

                const { data: updatedUser, error } = await supabase
                    .from("users")
                    .update({
                        subscription_status: offerKind === "LIFETIME_ADDON" ? "LIFETIME_ADDON" : "ACTIVE",
                        stripe_customer_id: session.customer as string,
                        stripe_subscription_id: session.subscription as string,
                        cancel_at_period_end: false,
                        current_period_end: periodEndSeconds ? new Date(periodEndSeconds * 1000).toISOString() : null,
                    })
                    .eq("id", userId)
                    .select("email, name")
                    .single();

                if (error) {
                    console.error("Failed to activate subscription:", error);
                } else if (updatedUser?.email) {
                    try {
                        await sendSubscriptionActivatedEmail(updatedUser.email, updatedUser.name || "Student");
                    } catch (mailError) {
                        console.error("Subscription activated email failed:", mailError);
                    }

                    try {
                        await sendAdminNewSubscriptionEmail(updatedUser.name || "Student", updatedUser.email);
                    } catch (mailError) {
                        console.error("Admin new subscription email failed:", mailError);
                    }
                }
            }
            break;
        }

        case "customer.subscription.updated": {
            const subscription = event.data.object as Stripe.Subscription;
            const customerId = subscription.customer as string;
            const offerKind = offerKindOf(subscription.metadata);
            const isAddon = offerKind === "LIFETIME_ADDON";
            const periodEndSeconds = subscription.items.data[0]?.current_period_end;
            const isUnpaid = subscription.status === "past_due" || subscription.status === "unpaid";

            const { data: owner, error: fetchError } = await supabase
                .from("users")
                .select("id, email, name, subscription_status, stripe_subscription_id")
                .eq("stripe_customer_id", customerId)
                .maybeSingle();

            if (fetchError || !owner) {
                console.error("Failed to load user for subscription update:", fetchError);
                break;
            }

            // Un évènement d'un ancien abonnement standard ne doit jamais modifier un profil passé à
            // l'offre à vie (et inversement) : ce serait écraser son statut par celui d'une autre offre.
            if (isLifetimeStatus(owner.subscription_status) !== isAddon) break;

            // Abonnement standard : impayé => UNPAID (accès suspendu), rétabli => ACTIVE.
            // Offre préférentielle : impayé => retour LIFETIME_EXPIRED (les modules restent acquis, seuls
            // mainframe/feedback sont suspendus), rétabli => LIFETIME_ADDON. Pour elle, on s'assure que
            // l'évènement concerne bien LA souscription enregistrée (un évènement peut précéder
            // checkout.session.completed, qui est ce qui enregistre son id).
            const suspendedStatus = isAddon ? "LIFETIME_EXPIRED" : "UNPAID";
            const activeStatus = isAddon ? "LIFETIME_ADDON" : "ACTIVE";
            const isRegisteredSubscription = !isAddon || owner.stripe_subscription_id === subscription.id;

            const wasSuspended = owner.subscription_status === suspendedStatus && isRegisteredSubscription;
            // Une fois débloqué manuellement (CANCELED/EXPIRED), on ne réactive l'accès que si le
            // paiement était en échec (suspendu) et vient de repasser à jour — jamais dans les autres cas.
            const shouldSuspend = isUnpaid && (isAddon ? owner.subscription_status === "LIFETIME_ADDON" : true);
            const nextStatus = shouldSuspend
                ? suspendedStatus
                : wasSuspended && subscription.status === "active"
                    ? activeStatus
                    : owner.subscription_status;

            const { error } = await supabase
                .from("users")
                .update({
                    subscription_status: nextStatus,
                    cancel_at_period_end: subscription.cancel_at_period_end,
                    current_period_end: periodEndSeconds ? new Date(periodEndSeconds * 1000).toISOString() : null,
                })
                .eq("id", owner.id);

            if (error) console.error("Failed to sync subscription update:", error);

            if (shouldSuspend && !wasSuspended) {
                const { error: blockError } = await supabase
                    .from("tso_users")
                    .update({ status: "BLOCKED" })
                    .eq("assigned_to_user_id", owner.id)
                    .eq("status", "ASSIGNED");

                if (blockError) console.error("Failed to block TSO account on payment failure:", blockError);

                if (owner.email) {
                    try {
                        if (isAddon) {
                            await sendLifetimeMainframeEndedEmail(owner.email, owner.name || "Student", "addon_payment_failed");
                        } else {
                            await sendPaymentFailedEmail(owner.email, owner.name || "Student");
                        }
                    } catch (mailError) {
                        console.error("Payment failed email failed:", mailError);
                    }

                    try {
                        await sendAdminPaymentFailedEmail(owner.name || "Student", owner.email);
                    } catch (mailError) {
                        console.error("Admin payment failed email failed:", mailError);
                    }
                }
            }
            break;
        }

        case "customer.subscription.deleted": {
            const subscription = event.data.object as Stripe.Subscription;
            const customerId = subscription.customer as string;
            const isAddon = offerKindOf(subscription.metadata) === "LIFETIME_ADDON";

            const { data: owner, error: fetchError } = await supabase
                .from("users")
                .select("id, email, name, subscription_status")
                .eq("stripe_customer_id", customerId)
                .maybeSingle();

            if (fetchError) console.error("Failed to load user for subscription deletion:", fetchError);
            if (!owner) break;

            // Même garde que ci-dessus : la fin d'un ancien abonnement standard ne doit pas faire
            // perdre son statut à un utilisateur de l'offre à vie (ni l'inverse).
            if (isLifetimeStatus(owner.subscription_status) !== isAddon) break;

            // Fin de l'offre préférentielle => retour LIFETIME_EXPIRED (modules conservés).
            // Si elle était déjà suspendue pour impayé, le statut est déjà LIFETIME_EXPIRED.
            const { error } = await supabase
                .from("users")
                .update({
                    subscription_status: isAddon ? "LIFETIME_EXPIRED" : "CANCELED",
                    cancel_at_period_end: false,
                    current_period_end: null,
                })
                .eq("id", owner.id);

            if (error) console.error("Failed to cancel subscription:", error);

            if (owner.email) {
                try {
                    if (isAddon) {
                        await sendLifetimeMainframeEndedEmail(owner.email, owner.name || "Student", "addon_ended");
                    } else {
                        await sendSubscriptionCanceledEmail(owner.email, owner.name || "Student");
                    }
                } catch (mailError) {
                    console.error("Subscription canceled email failed:", mailError);
                }

                try {
                    await sendAdminSubscriptionCanceledEmail(owner.name || "Student", owner.email);
                } catch (mailError) {
                    console.error("Admin subscription canceled email failed:", mailError);
                }
            }

            const { error: blockError } = await supabase
                .from("tso_users")
                .update({ status: "BLOCKED" })
                .eq("assigned_to_user_id", owner.id)
                .eq("status", "ASSIGNED");

            if (blockError) console.error("Failed to block TSO account on cancellation:", blockError);
            break;
        }

        default:
            break;
    }

    return Response.json({ received: true });
}
