import Stripe from "stripe";
import { stripe } from "@/utils/stripe";
import { createAdminClient } from "@/utils/supabase/admin";

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

            if (userId) {
                const { error } = await supabase
                    .from("users")
                    .update({
                        subscription_status: "ACTIVE",
                        stripe_customer_id: session.customer as string,
                        stripe_subscription_id: session.subscription as string,
                    })
                    .eq("id", userId);

                if (error) console.error("Failed to activate subscription:", error);
            }
            break;
        }

        case "customer.subscription.deleted": {
            const subscription = event.data.object as Stripe.Subscription;
            const customerId = subscription.customer as string;

            const { data: owner, error: fetchError } = await supabase
                .from("users")
                .update({ subscription_status: "CANCELED" })
                .eq("stripe_customer_id", customerId)
                .select("id")
                .maybeSingle();

            if (fetchError) console.error("Failed to cancel subscription:", fetchError);

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
