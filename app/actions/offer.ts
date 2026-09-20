"use server";

import { revalidatePath } from "next/cache";
import type Stripe from "stripe";
import { createClient } from "@/utils/supabase/server";
import { stripe } from "@/utils/stripe";
import type { OfferKind } from "@/utils/offers";

interface UpdateOfferSettingsInput {
    kind: OfferKind;
    title: string;
    priceCents: number;
    originalPriceCents: number | null;
    features: string[];
    stripePriceId: string;
    /** Durée d'accès mainframe + feedback incluse (offre à vie uniquement). */
    mainframeMonths: number | null;
}

export async function updateOfferSettings(input: UpdateOfferSettingsInput) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { data: profile } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();

    if (!profile || profile.role !== "ADMIN") throw new Error("Forbidden");

    const kind = input.kind;
    if (kind !== "SUBSCRIPTION" && kind !== "LIFETIME" && kind !== "LIFETIME_ADDON") {
        throw new Error("Unknown offer.");
    }

    const title = input.title.trim();
    if (!title) throw new Error("Please enter a title.");

    if (!Number.isFinite(input.priceCents) || input.priceCents < 0) {
        throw new Error("Please enter a valid price.");
    }

    // Prix barré facultatif : s'il est renseigné, il doit être supérieur au prix courant, sinon
    // l'étudiant verrait une "remise" absurde (prix barré ≤ prix affiché).
    const originalPriceCents = input.originalPriceCents === null ? null : Math.round(input.originalPriceCents);
    if (originalPriceCents !== null) {
        if (!Number.isFinite(originalPriceCents) || originalPriceCents < 0) {
            throw new Error("Please enter a valid original price.");
        }
        if (originalPriceCents <= Math.round(input.priceCents)) {
            throw new Error("The original price must be higher than the current price.");
        }
    }

    const features = input.features.map((f) => f.trim()).filter(Boolean);
    if (features.length === 0) throw new Error("Please add at least one feature.");

    // La durée mainframe n'a de sens que pour l'offre à vie ; ailleurs elle reste NULL.
    let mainframeMonths: number | null = null;
    if (kind === "LIFETIME") {
        mainframeMonths = input.mainframeMonths === null ? NaN : Math.round(input.mainframeMonths);
        if (!Number.isInteger(mainframeMonths) || mainframeMonths < 1) {
            throw new Error("Please enter a valid number of months (1 or more).");
        }
    }

    // L'abonnement standard ne peut pas exister sans prix Stripe. Les deux nouvelles offres, elles,
    // sont livrées sans prix : les laisser vides les masque aux étudiants tant qu'elles ne sont pas prêtes.
    const trimmedPriceId = input.stripePriceId.trim();
    if (!trimmedPriceId && kind === "SUBSCRIPTION") throw new Error("Please enter a Stripe Price ID.");
    const stripePriceId = trimmedPriceId || null;

    // On vérifie que le Price ID existe bien côté Stripe et qu'il correspond au type d'offre avant de
    // l'enregistrer : une faute de frappe ici casse le checkout pour tout le monde immédiatement,
    // contrairement à une variable d'environnement.
    if (stripePriceId) {
        let price: Stripe.Price;
        try {
            price = await stripe.prices.retrieve(stripePriceId);
        } catch {
            throw new Error("This Stripe Price ID does not exist.");
        }
        if (!price.active) throw new Error("This Stripe price is archived/inactive in Stripe.");
        if (kind === "LIFETIME") {
            if (price.recurring) throw new Error("This Stripe price is a recurring price — the lifetime offer needs a one-time price.");
        } else if (!price.recurring) {
            throw new Error("This Stripe price is not a recurring subscription price.");
        }
    }

    const { error } = await supabase
        .from("offer_settings")
        .update({
            title,
            price_cents: Math.round(input.priceCents),
            original_price_cents: originalPriceCents,
            features,
            stripe_price_id: stripePriceId,
            mainframe_months: mainframeMonths,
        })
        .eq("kind", kind);

    if (error) throw new Error("Failed to update offer settings.");

    revalidatePath("/dashboard/admin/offer");
    revalidatePath("/dashboard/subscribe");

    return { kind, title, priceCents: input.priceCents, originalPriceCents, features, stripePriceId, mainframeMonths };
}
