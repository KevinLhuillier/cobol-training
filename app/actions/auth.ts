"use server";

import { createClient } from "@/utils/supabase/server";
import { sendWelcomeEmail } from "@/utils/mail";

/**
 * Démarre l'essai de 7 jours de l'utilisateur connecté (idempotent : no-op s'il a déjà démarré).
 */
export async function ensureTrialStarted() {
    try {
        const supabase = await createClient();

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return { error: "Unauthorized" };
        }

        const { error } = await supabase.rpc("start_trial");
        if (error) {
            return { error: error.message };
        }

        return { success: true };
    } catch (globalError) {
        return { error: "Internal Server Error" };
    }
}

export async function triggerWelcomeEmailAction() {
    try {
        const supabase = await createClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError) {
            return { error: "Auth Error" };
        }

        if (!user) {
            return { error: "Unauthorized" };
        }

        const { data: profile, error: dbError } = await supabase
            .from("users")
            .select("name, email, welcome_email_sent")
            .eq("id", user.id)
            .single();

        if (dbError) {
            return { error: "Database Error" };
        }

        if (!profile) {
            return { error: "Profile not found" };
        }

        if (profile.welcome_email_sent) {
            return { success: true, message: "Already sent" };
        }

        const studentName = profile.name || "Student";
        const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`;

        try {
            await sendWelcomeEmail(profile.email, studentName, dashboardUrl);
        } catch (mailError) {
            return { error: "Email provider error" };
        }

        const { error: updateError } = await supabase
            .from("users")
            .update({ welcome_email_sent: true })
            .eq("id", user.id);

        if (updateError) {
            return { error: "Update Error" };
        }

        return { success: true };

    } catch (globalError) {
        return { error: "Internal Server Error" };
    }
}