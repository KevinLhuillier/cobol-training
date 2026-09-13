"use server";

import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { sendTsoUnlockEmail, sendAdminLowTsoAvailabilityEmail, type TsoAccessInfo } from "@/utils/mail";

const LOW_TSO_AVAILABILITY_THRESHOLD = 10;

const ERROR_MESSAGES: Record<string, string> = {
    already_assigned: "You already have an active TSO account.",
    no_active_access: "Your trial has ended. Please subscribe to unlock a TSO account.",
    no_account_available: "No TSO account is available right now. Please contact your instructor.",
};

export async function unlockTsoAccount() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { data: account, error } = await supabase.rpc("claim_tso_account");

    if (error) {
        const key = Object.keys(ERROR_MESSAGES).find((k) => error.message.includes(k));
        throw new Error(key ? ERROR_MESSAGES[key] : "Something went wrong while unlocking your TSO account.");
    }

    const { data: profile } = await supabase
        .from("users")
        .select("email, name, subscription_status, trial_ends_at")
        .eq("id", user.id)
        .single();

    const access: TsoAccessInfo =
        profile?.subscription_status === "ACTIVE"
            ? { type: "subscription" }
            : { type: "trial", endsAt: profile?.trial_ends_at ?? new Date().toISOString() };

    if (profile?.email && account) {
        try {
            await sendTsoUnlockEmail(
                profile.email,
                profile.name || "Student",
                account.username,
                account.password,
                account.host,
                account.port,
                access
            );
        } catch (mailError) {
            console.error("TSO unlock email failed:", mailError);
        }

        // La claim a pu faire passer le nombre de comptes AVAILABLE sous le seuil d'alerte.
        // Comptage via le client admin : RLS ne laisse un étudiant voir que son propre compte TSO.
        try {
            const admin = createAdminClient();
            const { count, error: countError } = await admin
                .from("tso_users")
                .select("id", { count: "exact", head: true })
                .eq("status", "AVAILABLE");

            if (!countError && count !== null && count < LOW_TSO_AVAILABILITY_THRESHOLD) {
                await sendAdminLowTsoAvailabilityEmail(count);
            }
        } catch (mailError) {
            console.error("Admin low TSO availability email failed:", mailError);
        }
    }

    // 🟢 Pas de revalidatePath ici : le client rafraîchit lui-même la page à la fermeture
    // de la popup de confirmation (sinon Next.js remonte le composant — et referme la popup —
    // dès que revalidatePath s'exécute, avant même que l'utilisateur ait pu la voir).
    return { account, access };
}
