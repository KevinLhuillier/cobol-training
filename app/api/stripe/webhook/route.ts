import Stripe from "stripe";
import { stripe } from "@/utils/stripe";
import { createAdminClient } from "@/utils/supabase/admin";
import {
    sendSubscriptionActivatedEmail,
    sendSubscriptionCanceledEmail,
    sendAdminNewSubscriptionEmail,
    sendAdminSubscriptionCanceledEmail,
    sendPaymentFailedEmail,
    sendAdminPaymentFailedEmail,
} from "@/utils/mail";

export const runtime = "nodejs";

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
        case "checkout.session.completed": {
            const session = event.data.object as Stripe.Checkout.Session;
            const userId = session.metadata?.supabase_user_id;

            if (userId && session.subscription) {
                const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
                const periodEndSeconds = subscription.items.data[0]?.current_period_end;

                const { data: updatedUser, error } = await supabase
                    .from("users")
                    .update({
                        subscription_status: "ACTIVE",
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
            const periodEndSeconds = subscription.items.data[0]?.current_period_end;
            const isUnpaid = subscription.status === "past_due" || subscription.status === "unpaid";

            const { data: owner, error: fetchError } = await supabase
                .from("users")
                .select("id, email, name, subscription_status")
                .eq("stripe_customer_id", customerId)
                .maybeSingle();

            if (fetchError || !owner) {
                console.error("Failed to load user for subscription update:", fetchError);
                break;
            }

            const wasUnpaid = owner.subscription_status === "UNPAID";
            // Une fois débloqué manuellement (CANCELED/EXPIRED), on ne réactive l'accès que si le
            // paiement était en échec (UNPAID) et vient de repasser à jour — jamais dans les autres cas.
            const nextStatus = isUnpaid ? "UNPAID" : wasUnpaid && subscription.status === "active" ? "ACTIVE" : owner.subscription_status;

            const { error } = await supabase
                .from("users")
                .update({
                    subscription_status: nextStatus,
                    cancel_at_period_end: subscription.cancel_at_period_end,
                    current_period_end: periodEndSeconds ? new Date(periodEndSeconds * 1000).toISOString() : null,
                })
                .eq("id", owner.id);

            if (error) console.error("Failed to sync subscription update:", error);

            if (isUnpaid && !wasUnpaid) {
                const { error: blockError } = await supabase
                    .from("tso_users")
                    .update({ status: "BLOCKED" })
                    .eq("assigned_to_user_id", owner.id)
                    .eq("status", "ASSIGNED");

                if (blockError) console.error("Failed to block TSO account on payment failure:", blockError);

                if (owner.email) {
                    try {
                        await sendPaymentFailedEmail(owner.email, owner.name || "Student");
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

            const { data: owner, error: fetchError } = await supabase
                .from("users")
                .update({ subscription_status: "CANCELED", cancel_at_period_end: false, current_period_end: null })
                .eq("stripe_customer_id", customerId)
                .select("id, email, name")
                .maybeSingle();

            if (fetchError) console.error("Failed to cancel subscription:", fetchError);

            if (owner?.email) {
                try {
                    await sendSubscriptionCanceledEmail(owner.email, owner.name || "Student");
                } catch (mailError) {
                    console.error("Subscription canceled email failed:", mailError);
                }

                try {
                    await sendAdminSubscriptionCanceledEmail(owner.name || "Student", owner.email);
                } catch (mailError) {
                    console.error("Admin subscription canceled email failed:", mailError);
                }
            }

            if (owner) {
                const { error: blockError } = await supabase
                    .from("tso_users")
                    .update({ status: "BLOCKED" })
                    .eq("assigned_to_user_id", owner.id)
                    .eq("status", "ASSIGNED");

                if (blockError) console.error("Failed to block TSO account on cancellation:", blockError);
            }
            break;
        }

        default:
            break;
    }

    return Response.json({ received: true });
}
