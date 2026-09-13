"use server";

import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { sendWelcomeEmail, sendPasswordResetEmail, sendAdminNewRegistrationEmail } from "@/utils/mail";

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

/**
 * Envoie un email de réinitialisation de mot de passe si le compte existe.
 * Renvoie toujours un succès générique (anti-énumération : on ne révèle jamais si l'email existe).
 */
export async function requestPasswordReset(email: string) {
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
        return { error: "Please enter your email address." };
    }

    try {
        const admin = createAdminClient();

        // Un lien généré via l'API Admin redirige avec la session dans le fragment d'URL
        // (#access_token=...&type=recovery), pas avec un ?code= PKCE : il n'y a pas de code_verifier
        // côté navigateur puisque ce n'est pas ce navigateur qui a initié le flow. On pointe donc
        // directement vers reset-password (le fragment n'atteint jamais le serveur, donc passer par
        // /auth/callback ne servirait à rien ici — ce n'est utile que pour les flows PKCE initiés
        // côté client, comme la confirmation d'inscription).
        const { data, error } = await admin.auth.admin.generateLink({
            type: "recovery",
            email: trimmedEmail,
            options: {
                redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
            },
        });

        if (error || !data?.properties?.action_link) {
            // Compte inexistant ou autre souci : on ne le révèle jamais à l'appelant.
            console.error("generateLink (recovery) failed:", error);
            return { success: true };
        }

        const studentName = (data.user?.user_metadata?.name as string | undefined) || "Student";

        try {
            await sendPasswordResetEmail(trimmedEmail, studentName, data.properties.action_link);
        } catch (mailError) {
            console.error("Password reset email failed:", mailError);
        }

        return { success: true };
    } catch (globalError) {
        console.error("requestPasswordReset failed:", globalError);
        return { success: true };
    }
}

/**
 * Notifie l'administrateur qu'une nouvelle inscription vient d'avoir lieu (appelé juste après un
 * signUp réussi côté client). On relit le nom/email en base plutôt que de faire confiance aux
 * valeurs passées par l'appelant, pour ne notifier que sur une inscription réellement créée.
 */
export async function notifyAdminNewRegistration(email: string) {
    try {
        const admin = createAdminClient();
        const { data: newUser } = await admin
            .from("users")
            .select("name, email")
            .eq("email", email.trim().toLowerCase())
            .single();

        if (!newUser) {
            return { success: true };
        }

        await sendAdminNewRegistrationEmail(newUser.name || "Student", newUser.email);
        return { success: true };
    } catch (mailError) {
        console.error("Admin new registration email failed:", mailError);
        return { success: true };
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