"use server";

import { createClient } from "@/utils/supabase/server";
import { stripe } from "@/utils/stripe";

export async function createCheckoutSession() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { data: profile } = await supabase
        .from("users")
        .select("email, stripe_customer_id")
        .eq("id", user.id)
        .single();

    if (!profile) throw new Error("Profile not found");

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

    const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        customer: customerId,
        line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }],
        success_url: `${appUrl}/dashboard?subscribed=true`,
        cancel_url: `${appUrl}/dashboard`,
        metadata: { supabase_user_id: user.id },
    });

    if (!session.url) throw new Error("Failed to create checkout session");

    return { url: session.url };
}
