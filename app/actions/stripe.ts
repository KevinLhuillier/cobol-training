"use server";

import type Stripe from "stripe";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { stripe } from "@/utils/stripe";
import { sendSubscriptionCancellationScheduledEmail } from "@/utils/mail";
import { findActiveTrialDiscountPromotionCode } from "@/utils/stripe-trial-discount";
import { getPurchasableOffers, type OfferKind } from "@/utils/offers";
import { getEffectiveStatus } from "@/utils/subscription";

export async function createCheckoutSession(offerKind: OfferKind = "SUBSCRIPTION", promoCode?: string) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { data: profile } = await supabase
        .from("users")
        .select("email, stripe_customer_id, subscription_status, mainframe_ends_at")
        .eq("id", user.id)
        .single();

    if (!profile) throw new Error("Profile not found");

    // La page d'offres masque déjà ce qui n'est pas proposé, mais cette action est appelable
    // directement : on revérifie ici (ex. un abonné ACTIVE ne doit pas pouvoir acheter l'offre à vie).
    const status = getEffectiveStatus({
        subscription_status: profile.subscription_status,
        trial_ends_at: null,
        mainframe_ends_at: profile.mainframe_ends_at,
    });
    if (!getPurchasableOffers(status).includes(offerKind)) {
        throw new Error("This offer isn't available for your account.");
    }

    const { data: offer } = await supabase
        .from("offer_settings")
        .select("stripe_price_id")
        .eq("kind", offerKind)
        .single();

    if (!offer?.stripe_price_id) throw new Error("No offer configured");

    let customerId = profile.stripe_customer_id;

    if (!customerId) {
        const customer = await stripe.customers.create({
            email: profile.email,
            metadata: { supabase_user_id: user.id },
        });
        customerId = customer.id;

        const { error } = await supabase.rpc("set_stripe_customer_id", { p_customer_id: customerId });
        if (error) {
            console.error("Failed to persist stripe_customer_id:", error);
        }
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL;

    // offer_kind est relu par le webhook pour savoir quel statut attribuer (l'offre à vie est un
    // paiement unique, les deux autres des abonnements). Pour un abonnement il est aussi copié sur
    // la Subscription Stripe : les évènements customer.subscription.* ne portent pas les metadata
    // de la session, et le webhook doit distinguer l'offre préférentielle de l'abonnement standard.
    const metadata = { supabase_user_id: user.id, offer_kind: offerKind };

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
        mode: offerKind === "LIFETIME" ? "payment" : "subscription",
        customer: customerId,
        customer_update: { address: "auto", name: "auto" },
        billing_address_collection: "required",
        automatic_tax: { enabled: true },
        line_items: [{ price: offer.stripe_price_id, quantity: 1 }],
        success_url: `${appUrl}/dashboard?subscribed=true`,
        cancel_url: `${appUrl}/dashboard`,
        metadata,
    };

    if (offerKind === "LIFETIME") {
        // Sans cela, un paiement unique ne génère ni facture ni reçu exploitable (l'abonnement, si).
        sessionParams.invoice_creation = { enabled: true };
    } else {
        sessionParams.subscription_data = { metadata };
    }

    // Stripe interdit de combiner discounts et allow_promotion_codes sur une même session :
    // si on a un code valide à pré-appliquer, pas de champ de saisie manuelle ; sinon on
    // laisse ce champ disponible pour qu'un code puisse être entré à la main au checkout.
    // Le code de relance fin d'essai (-20%) ne concerne que l'abonnement standard.
    const promotionCode =
        promoCode && offerKind === "SUBSCRIPTION" ? await findActiveTrialDiscountPromotionCode(promoCode, customerId) : null;
    if (promotionCode) {
        sessionParams.discounts = [{ promotion_code: promotionCode.id }];
    } else {
        sessionParams.allow_promotion_codes = true;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    if (!session.url) throw new Error("Failed to create checkout session");

    return { url: session.url };
}

/**
 * Programme l'annulation de l'abonnement à la fin de la période en cours (pas immédiate).
 */
export async function cancelSubscription() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { data: profile } = await supabase
        .from("users")
        .select("email, name, stripe_subscription_id")
        .eq("id", user.id)
        .single();

    if (!profile?.stripe_subscription_id) throw new Error("No active subscription found");

    const subscription = await stripe.subscriptions.update(profile.stripe_subscription_id, {
        cancel_at_period_end: true,
    });

    const periodEndSeconds = subscription.items.data[0]?.current_period_end;
    const currentPeriodEnd = periodEndSeconds ? new Date(periodEndSeconds * 1000).toISOString() : null;

    // RLS interdit à l'utilisateur d'écrire sur ces colonnes : on utilise le client admin,
    // en le restreignant à sa propre ligne (identité déjà vérifiée par auth.getUser() ci-dessus).
    const admin = createAdminClient();
    const { error } = await admin
        .from("users")
        .update({ cancel_at_period_end: true, current_period_end: currentPeriodEnd })
        .eq("id", user.id);

    if (error) throw new Error("Failed to update subscription status");

    if (profile.email) {
        try {
            await sendSubscriptionCancellationScheduledEmail(profile.email, profile.name || "Student", currentPeriodEnd);
        } catch (mailError) {
            console.error("Cancellation scheduled email failed:", mailError);
        }
    }

    return { cancelAtPeriodEnd: true, currentPeriodEnd };
}
