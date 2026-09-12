type SubscriptionInfo = {
    subscription_status: string | null;
    trial_ends_at: string | null;
};

/**
 * Déblocage TSO : autorisé pendant tout l'essai OU avec un abonnement actif.
 */
export function hasActiveAccess(user: SubscriptionInfo): boolean {
    if (user.subscription_status === "ACTIVE") return true;
    if (user.subscription_status === "TRIAL" && user.trial_ends_at) {
        return new Date(user.trial_ends_at) > new Date();
    }
    return false;
}

/**
 * Accès à un cours : gratuit, ou abonnement actif (l'essai seul ne suffit pas).
 */
export function hasCourseAccess(course: { isFree: boolean }, user: SubscriptionInfo): boolean {
    return course.isFree || user.subscription_status === "ACTIVE";
}

/**
 * Nombre de jours restants avant la fin de l'essai (0 si expiré ou non applicable).
 */
export function getTrialDaysLeft(trialEndsAt: string | null): number {
    if (!trialEndsAt) return 0;
    const diffMs = new Date(trialEndsAt).getTime() - Date.now();
    return diffMs > 0 ? Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24))) : 0;
}
