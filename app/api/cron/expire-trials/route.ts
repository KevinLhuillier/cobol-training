import { createAdminClient } from "@/utils/supabase/admin";
import { sendTrialExpiredEmail, sendAdminTrialExpiredEmail, sendTrialEndingSoonEmail } from "@/utils/mail";

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
        .select("email, name");

    if (expireError) {
        console.error("Failed to expire trials:", expireError);
        return new Response("Failed to expire trials", { status: 500 });
    }

    for (const expiredUser of expiredUsers || []) {
        if (!expiredUser.email) continue;
        try {
            await sendTrialExpiredEmail(expiredUser.email, expiredUser.name || "Student");
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

    // 3. Bloque les comptes TSO des utilisateurs qui n'ont plus d'accès actif.
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
