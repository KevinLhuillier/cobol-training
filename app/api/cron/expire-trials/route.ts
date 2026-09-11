import { createAdminClient } from "@/utils/supabase/admin";

export const runtime = "nodejs";

export async function GET(request: Request) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new Response("Unauthorized", { status: 401 });
    }

    const supabase = createAdminClient();

    // 1. Marque les essais expirés.
    const { error: expireError } = await supabase
        .from("users")
        .update({ subscription_status: "EXPIRED" })
        .eq("subscription_status", "TRIAL")
        .lt("trial_ends_at", new Date().toISOString());

    if (expireError) {
        console.error("Failed to expire trials:", expireError);
        return new Response("Failed to expire trials", { status: 500 });
    }

    // 2. Bloque les comptes TSO des utilisateurs qui n'ont plus d'accès actif.
    const { data: lockedOutUsers, error: lockedOutError } = await supabase
        .from("users")
        .select("id")
        .in("subscription_status", ["EXPIRED", "CANCELED"]);

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
