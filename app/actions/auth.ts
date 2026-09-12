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

/**
 * Met à jour le nom affiché de l'utilisateur connecté.
 */
export async function updateName(name: string) {
    try {
        const trimmed = name.trim();
        if (!trimmed) {
            return { error: "Name cannot be empty." };
        }
        if (trimmed.length > 100) {
            return { error: "Name is too long." };
        }

        const supabase = await createClient();

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return { error: "Unauthorized" };
        }

        const { error } = await supabase.rpc("update_own_name", { p_name: trimmed });
        if (error) {
            return { error: error.message };
        }

        return { success: true };
    } catch (globalError) {
        return { error: "Internal Server Error" };
    }
}

/**
 * Change le mot de passe de l'utilisateur connecté, après vérification de son mot de passe actuel.
 */
export async function changePassword(currentPassword: string, newPassword: string) {
    try {
        if (newPassword.length < 8) {
            return { error: "New password must be at least 8 characters long." };
        }

        const supabase = await createClient();

        const { data: { user } } = await supabase.auth.getUser();
        if (!user?.email) {
            return { error: "Unauthorized" };
        }

        const { error: signInError } = await supabase.auth.signInWithPassword({
            email: user.email,
            password: currentPassword,
        });
        if (signInError) {
            return { error: "Current password is incorrect." };
        }

        const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
        if (updateError) {
            return { error: updateError.message };
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

        // Claim atomique (flip welcome_email_sent false -> true en un seul UPDATE) : cette page peut
        // être rendue deux fois en quasi-simultané pour la même première visite (prefetch + navigation
        // côté Next.js), donc un "check puis send puis update" en 2 requêtes séparées n'est pas
        // suffisant pour empêcher un double envoi. Ici, une seule des deux requêtes concurrentes peut
        // gagner l'UPDATE ; l'autre reçoit une ligne entièrement à null et ne renvoie pas l'email.
        const { data, error: claimError } = await supabase.rpc("claim_welcome_email").single();

        if (claimError) {
            return { error: claimError.message };
        }

        const claimedUser = data as { id: string; name: string | null; email: string } | null;

        if (!claimedUser?.id) {
            return { success: true, message: "Already sent" };
        }

        const studentName = claimedUser.name || "Student";
        const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`;

        try {
            await sendWelcomeEmail(claimedUser.email, studentName, dashboardUrl);
        } catch (mailError) {
            return { error: "Email provider error" };
        }

        return { success: true };

    } catch (globalError) {
        return { error: "Internal Server Error" };
    }
}