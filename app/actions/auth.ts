"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { sendWelcomeEmail, sendPasswordResetEmail, sendAdminNewRegistrationEmail, sendAdminRegistrationBlockedEmail, sendInviteEmail } from "@/utils/mail";
import { generateTempPassword } from "@/utils/password";
import { getClientIpAndCountry } from "@/utils/request-info";

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
 * Enregistre la connexion de l'utilisateur (IP, pays, horodatage) dans la table de
 * traçabilité (idempotent : dédupliqué sur signed_in_at = auth.users.last_sign_in_at,
 * donc sans effet si ce composant serveur est rendu plusieurs fois pour la même session
 * — cf. le commentaire sur ensureTrialStarted).
 */
export async function recordLoginEvent() {
    try {
        const supabase = await createClient();

        const { data: { user } } = await supabase.auth.getUser();
        if (!user?.last_sign_in_at) {
            return { error: "Unauthorized" };
        }

        const { ip, country } = await getClientIpAndCountry();
        if (!ip) {
            return { error: "Unable to determine IP address." };
        }

        const { error } = await supabase.from("login_events").insert({
            user_id: user.id,
            ip_address: ip,
            country,
            signed_in_at: user.last_sign_in_at,
        });

        // 23505 = violation de contrainte unique : déjà enregistrée pour cette connexion.
        if (error && error.code !== "23505") {
            return { error: error.message };
        }

        return { success: true };
    } catch (globalError) {
        return { error: "Internal Server Error" };
    }
}

/**
 * Vérifie, avant inscription, que l'IP du visiteur n'a jamais servi à se connecter à un
 * compte existant (anti multi-comptes / multi-essais gratuits avec des emails différents).
 * En cas de doute (IP indéterminable, erreur base) on laisse passer plutôt que de bloquer
 * une inscription légitime. En cas de blocage, prévient l'admin par email (best-effort, sans
 * jamais inclure le mot de passe saisi) pour qu'il soit informé de la tentative.
 */
export async function checkRegistrationAllowed(name: string, email: string) {
    try {
        const { ip, country } = await getClientIpAndCountry();
        if (!ip) {
            return { allowed: true };
        }

        const admin = createAdminClient();
        const { data, error } = await admin
            .from("login_events")
            .select("id")
            .eq("ip_address", ip)
            .limit(1)
            .maybeSingle();

        if (error) {
            console.error("checkRegistrationAllowed failed:", error);
            return { allowed: true };
        }

        const allowed = !data;

        if (!allowed) {
            try {
                await sendAdminRegistrationBlockedEmail(name.trim(), email.trim().toLowerCase(), ip, country);
            } catch (mailError) {
                console.error("Admin registration-blocked email failed:", mailError);
            }
        }

        return { allowed };
    } catch (globalError) {
        console.error("checkRegistrationAllowed failed:", globalError);
        return { allowed: true };
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

/**
 * Invite un nouvel étudiant depuis /dashboard/admin/users : crée son compte avec un mot
 * de passe auto-généré et lui envoie ses identifiants par email. Le compte est marqué
 * INVITE_PENDING (start_trial() le fera automatiquement basculer vers TRIAL, et l'email
 * de bienvenue partira normalement, dès sa toute première connexion).
 */
export async function inviteUser(name: string, email: string) {
    try {
        const trimmedName = name.trim();
        const trimmedEmail = email.trim().toLowerCase();

        if (!trimmedName) {
            return { error: "Please enter a name." };
        }
        if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
            return { error: "Please enter a valid email address." };
        }

        // Sécurité : seul un admin authentifié peut inviter un utilisateur.
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return { error: "Unauthorized" };
        }

        const { data: profile } = await supabase
            .from("users")
            .select("role")
            .eq("id", user.id)
            .single();

        if (!profile || profile.role !== "ADMIN") {
            return { error: "Forbidden" };
        }

        const admin = createAdminClient();
        const tempPassword = generateTempPassword();

        // email_confirm: true — pas de flow de confirmation pour un compte créé par un admin.
        const { data: created, error: createError } = await admin.auth.admin.createUser({
            email: trimmedEmail,
            password: tempPassword,
            email_confirm: true,
            user_metadata: { name: trimmedName },
        });

        if (createError || !created?.user) {
            if (createError?.message?.toLowerCase().includes("already been registered") ||
                createError?.message?.toLowerCase().includes("already registered")) {
                return { error: "This email address is already in use." };
            }
            console.error("inviteUser createUser failed:", createError);
            return { error: createError?.message || "Unable to create the account." };
        }

        // Le trigger on_auth_user_created a déjà inséré la ligne public.users (role USER,
        // subscription_status NULL) : on la marque explicitement comme invitation en attente.
        const { error: statusError } = await admin
            .from("users")
            .update({ subscription_status: "INVITE_PENDING" })
            .eq("id", created.user.id);

        if (statusError) {
            console.error("inviteUser status update failed:", statusError);
        }

        const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/login`;

        try {
            await sendInviteEmail(trimmedEmail, trimmedName, tempPassword, loginUrl);
        } catch (mailError) {
            console.error("Invite email failed:", mailError);
            return { error: "Account created, but the invitation email failed to send." };
        }

        revalidatePath("/dashboard/admin/users");
        return { success: true };
    } catch (globalError) {
        console.error("inviteUser failed:", globalError);
        return { error: "Internal Server Error" };
    }
}