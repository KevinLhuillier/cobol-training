"use server";

import { revalidatePath } from "next/cache";
import type Stripe from "stripe";
import { createClient } from "@/utils/supabase/server";
import { stripe } from "@/utils/stripe";

interface UpdateOfferSettingsInput {
    title: string;
    priceCents: number;
    features: string[];
    stripePriceId: string;
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

    const title = input.title.trim();
    if (!title) throw new Error("Please enter a title.");

    if (!Number.isFinite(input.priceCents) || input.priceCents < 0) {
        throw new Error("Please enter a valid price.");
    }

    const features = input.features.map((f) => f.trim()).filter(Boolean);
    if (features.length === 0) throw new Error("Please add at least one feature.");

    const stripePriceId = input.stripePriceId.trim();
    if (!stripePriceId) throw new Error("Please enter a Stripe Price ID.");

    // On vérifie que le Price ID existe bien côté Stripe et qu'il est utilisable pour un
    // abonnement avant de l'enregistrer : une faute de frappe ici casse le checkout pour
    // tout le monde immédiatement, contrairement à une variable d'environnement.
    let price: Stripe.Price;
    try {
        price = await stripe.prices.retrieve(stripePriceId);
    } catch {
        throw new Error("This Stripe Price ID does not exist.");
    }
    if (!price.active) throw new Error("This Stripe price is archived/inactive in Stripe.");
    if (!price.recurring) throw new Error("This Stripe price is not a recurring subscription price.");

    const { error } = await supabase
        .from("offer_settings")
        .update({
            title,
            price_cents: Math.round(input.priceCents),
            features,
            stripe_price_id: stripePriceId,
        })
        .eq("id", 1);

    if (error) throw new Error("Failed to update offer settings.");

    revalidatePath("/dashboard/admin/offer");
    revalidatePath("/dashboard/subscribe");

    return { title, priceCents: input.priceCents, features, stripePriceId };
}
