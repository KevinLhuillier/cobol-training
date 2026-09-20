type SubscriptionInfo = {
    subscription_status: string | null;
    trial_ends_at: string | null;
    /** Fin de la fenêtre mainframe + feedback incluse dans l'offre à vie (statut LIFETIME). */
    mainframe_ends_at?: string | null;
};

/** Statuts de l'offre à vie : modules accessibles à vie, quels que soient mainframe/feedback. */
const LIFETIME_STATUSES = ["LIFETIME", "LIFETIME_EXPIRED", "LIFETIME_ADDON"];

export function isLifetimeStatus(status: string | null): boolean {
    return status !== null && LIFETIME_STATUSES.includes(status);
}

/**
 * Statut à utiliser pour décider de ce qu'on propose/autorise. Le cron ne bascule LIFETIME en
 * LIFETIME_EXPIRED qu'une fois par jour : entre la fin de la fenêtre mainframe et ce passage,
 * le statut stocké est en retard. Ici on applique la date tout de suite.
 */
export function getEffectiveStatus(user: SubscriptionInfo): string | null {
    if (user.subscription_status === "LIFETIME" && !hasActiveAccess(user)) return "LIFETIME_EXPIRED";
    return user.subscription_status;
}

/**
 * Déblocage TSO : autorisé pendant tout l'essai, avec un abonnement actif, avec l'offre
 * préférentielle mainframe + feedback, ou avec l'offre à vie tant que sa fenêtre mainframe court.
 * (Miroir de la fonction SQL has_active_access(), qui reste la garde côté base.)
 */
export function hasActiveAccess(user: SubscriptionInfo): boolean {
    if (user.subscription_status === "ACTIVE" || user.subscription_status === "LIFETIME_ADDON") return true;
    if (user.subscription_status === "TRIAL" && user.trial_ends_at) {
        return new Date(user.trial_ends_at) > new Date();
    }
    if (user.subscription_status === "LIFETIME" && user.mainframe_ends_at) {
        return new Date(user.mainframe_ends_at) > new Date();
    }
    return false;
}

/**
 * Accès à un cours : gratuit, abonnement actif, ou offre à vie (quel que soit son stade —
 * l'expiration de la fenêtre mainframe ne retire jamais l'accès aux modules).
 * L'essai seul ne suffit pas.
 */
export function hasCourseAccess(course: { isFree: boolean }, user: SubscriptionInfo): boolean {
    return course.isFree || user.subscription_status === "ACTIVE" || isLifetimeStatus(user.subscription_status);
}

/**
 * Droit de soumettre un exercice pour correction. Perdu à la fin de l'essai (EXPIRED), en cas
 * d'échec de paiement (UNPAID) et à la fin de la période de feedback de l'offre à vie ; les autres
 * statuts gardent leur comportement historique (miroir de feedback_access_revoked()).
 */
export function hasFeedbackAccess(user: SubscriptionInfo): boolean {
    if (
        user.subscription_status === "EXPIRED" ||
        user.subscription_status === "UNPAID" ||
        user.subscription_status === "LIFETIME_EXPIRED"
    ) {
        return false;
    }
    if (user.subscription_status === "LIFETIME") {
        return !!user.mainframe_ends_at && new Date(user.mainframe_ends_at) > new Date();
    }
    return true;
}

/**
 * Nombre de jours restants avant une date de fin (0 si passée ou absente) : fin d'essai ou
 * fin de la fenêtre mainframe + feedback de l'offre à vie.
 */
export function getDaysLeft(endsAt: string | null): number {
    if (!endsAt) return 0;
    const diffMs = new Date(endsAt).getTime() - Date.now();
    return diffMs > 0 ? Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24))) : 0;
}

export function getTrialDaysLeft(trialEndsAt: string | null): number {
    return getDaysLeft(trialEndsAt);
}
