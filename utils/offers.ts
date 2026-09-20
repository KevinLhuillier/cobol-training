export type OfferKind = "SUBSCRIPTION" | "LIFETIME" | "LIFETIME_ADDON";

/**
 * Offres qu'un utilisateur a le droit de souscrire, selon son statut. Source unique utilisée
 * par la page /dashboard/subscribe (ce qui est affiché) ET par createCheckoutSession (ce qui
 * est réellement accepté) : masquer une offre dans l'UI ne suffit pas à empêcher un appel direct.
 *
 * - LIFETIME_EXPIRED : uniquement l'offre préférentielle mainframe + feedback.
 * - ACTIVE : uniquement l'offre à vie (passer de l'abonnement au paiement unique) ; le webhook
 *   programme alors l'arrêt de l'abonnement mensuel pour éviter la double facturation.
 * - LIFETIME / LIFETIME_ADDON : rien à acheter (déjà couverts).
 * - Tous les autres (essai, expiré, annulé, impayé, sans statut) : abonnement ou offre à vie.
 */
export function getPurchasableOffers(status: string | null): OfferKind[] {
    switch (status) {
        case "LIFETIME_EXPIRED":
            return ["LIFETIME_ADDON"];
        case "ACTIVE":
            return ["LIFETIME"];
        case "LIFETIME":
        case "LIFETIME_ADDON":
            return [];
        default:
            return ["SUBSCRIPTION", "LIFETIME"];
    }
}

export function formatOfferPrice(cents: number): string {
    return (cents / 100).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}
