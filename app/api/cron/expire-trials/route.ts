import { createAdminClient } from "@/utils/supabase/admin";
import { sendTrialExpiredEmail, sendAdminTrialExpiredEmail, sendTrialEndingSoonEmail, sendTrialCheckInEmail, type TrialDiscount } from "@/utils/mail";
import { stripe } from "@/utils/stripe";
import { createTrialDiscountPromotionCode } from "@/utils/stripe-trial-discount";

export const runtime = "nodejs";

export async function GET(request: Request) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new Response("Unauthorized", { status: 401 });
    }

    const supabase = createAdminClient();

    // 1. Marque les essais expirés et récupère les utilisateurs concernés pour les notifier par mail.
    const { data: expiredUsers, error: expireError } = await supabase
        .from("users")
        .update({ subscription_status: "EXPIRED" })
        .eq("subscription_status", "TRIAL")
        .lt("trial_ends_at", new Date().toISOString())
        .select("id, email, name, stripe_customer_id");

    if (expireError) {
        console.error("Failed to expire trials:", expireError);
        return new Response("Failed to expire trials", { status: 500 });
    }

    for (const expiredUser of expiredUsers || []) {
        if (!expiredUser.email) continue;

        // Génère un code -20%/48h pour relancer l'utilisateur (cf. utils/stripe-trial-discount.ts).
        // Ne doit jamais empêcher l'envoi du mail : en cas d'échec Stripe, on retombe sur un CTA
        // générique dans sendTrialExpiredEmail plutôt que de sauter cet utilisateur.
        let discount: TrialDiscount | null = null;
        try {
            let customerId = expiredUser.stripe_customer_id;
            if (!customerId) {
                const customer = await stripe.customers.create({
                    email: expiredUser.email,
                    metadata: { supabase_user_id: expiredUser.id },
                });
                customerId = customer.id;
                await supabase.from("users").update({ stripe_customer_id: customerId }).eq("id", expiredUser.id);
            }

            discount = await createTrialDiscountPromotionCode(customerId);
            await supabase
                .from("users")
                .update({ trial_discount_code: discount.code, trial_discount_expires_at: discount.expiresAt })
                .eq("id", expiredUser.id);
        } catch (couponError) {
            console.error("Failed to generate trial discount coupon:", couponError);
        }

        try {
            await sendTrialExpiredEmail(expiredUser.email, expiredUser.name || "Student", discount);
        } catch (mailError) {
            console.error("Trial expired email failed:", mailError);
        }
        try {
            await sendAdminTrialExpiredEmail(expiredUser.name || "Student", expiredUser.email);
        } catch (mailError) {
            console.error("Admin trial expired email failed:", mailError);
        }
    }

    // 2. Prévient les utilisateurs dont l'essai se termine demain (fenêtre de 24h à 48h,
    // trial_reminder_sent_at évite un second envoi si un run ultérieur retombe dans la fenêtre).
    const { data: endingSoonUsers, error: endingSoonError } = await supabase
        .from("users")
        .select("id, email, name, trial_ends_at")
        .eq("subscription_status", "TRIAL")
        .is("trial_reminder_sent_at", null)
        .gt("trial_ends_at", new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString())
        .lte("trial_ends_at", new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString());

    if (endingSoonError) {
        console.error("Failed to fetch users with trial ending soon:", endingSoonError);
        return new Response("Failed to fetch users with trial ending soon", { status: 500 });
    }

    for (const endingSoonUser of endingSoonUsers || []) {
        if (!endingSoonUser.email || !endingSoonUser.trial_ends_at) continue;
        try {
            await sendTrialEndingSoonEmail(endingSoonUser.email, endingSoonUser.name || "Student", endingSoonUser.trial_ends_at);
            await supabase
                .from("users")
                .update({ trial_reminder_sent_at: new Date().toISOString() })
                .eq("id", endingSoonUser.id);
        } catch (mailError) {
            console.error("Trial ending soon email failed:", mailError);
        }
    }

    // 3. Envoie un message personnel de suivi aux utilisateurs dont l'essai a démarré il y a 3 jours
    // (fenêtre de J+3 à J+4, trial_checkin_sent_at évite un second envoi).
    const { data: checkInUsers, error: checkInError } = await supabase
        .from("users")
        .select("id, email, name")
        .eq("subscription_status", "TRIAL")
        .is("trial_checkin_sent_at", null)
        .gt("trial_ends_at", new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString())
        .lte("trial_ends_at", new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString());

    if (checkInError) {
        console.error("Failed to fetch users for trial check-in:", checkInError);
        return new Response("Failed to fetch users for trial check-in", { status: 500 });
    }

    for (const checkInUser of checkInUsers || []) {
        if (!checkInUser.email) continue;
        try {
            await sendTrialCheckInEmail(checkInUser.email, checkInUser.name || "Student");
            await supabase
                .from("users")
                .update({ trial_checkin_sent_at: new Date().toISOString() })
                .eq("id", checkInUser.id);
        } catch (mailError) {
            console.error("Trial check-in email failed:", mailError);
        }
    }

    // 4. Bloque les comptes TSO des utilisateurs qui n'ont plus d'accès actif.
    const { data: lockedOutUsers, error: lockedOutError } = await supabase
        .from("users")
        .select("id")
        .in("subscription_status", ["EXPIRED", "CANCELED", "UNPAID"]);

    if (lockedOutError) {
        console.error("Failed to fetch locked-out users:", lockedOutError);
        return new Response("Failed to fetch locked-out users", { status: 500 });
    }

    const lockedOutIds = (lockedOutUsers || []).map((u) => u.id);

    if (lockedOutIds.length > 0) {
        const { error: blockError } = await supabase
            .from("tso_users")
            .update({ status: "BLOCKED" })
            .in("assigned_to_user_id", lockedOutIds)
            .eq("status", "ASSIGNED");

        if (blockError) {
            console.error("Failed to block TSO accounts:", blockError);
            return new Response("Failed to block TSO accounts", { status: 500 });
        }
    }

    return Response.json({ ok: true });
}
