export type OfferKind = "SUBSCRIPTION" | "LIFETIME" | "LIFETIME_ADDON";

/** Ligne de la table offer_settings (lisible publiquement : landing + /dashboard/subscribe). */
export interface OfferRow {
    kind: OfferKind;
    title: string;
    price_cents: number;
    original_price_cents: number | null;
    features: string[];
    stripe_price_id: string | null;
    mainframe_months: number | null;
}

/** Texte de secours de l'abonnement standard tant que sa ligne offer_settings est introuvable. */
export const DEFAULT_SUBSCRIPTION_OFFER = {
    title: "Cobol Training subscription",
    priceCents: 1500,
    features: [
        "Access to all modules",
        "Quizzes, exercises, and a final project",
        "Mainframe Access",
        "Personalized feedback on exercises",
        "Support on Teams with the instructor",
    ],
};

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

/**
 * Tarif mensuel préférentiel "Mainframe + Feedback" rappelé sur la carte de l'offre à vie (landing et
 * /dashboard/subscribe). Lu directement sur l'offre LIFETIME_ADDON : ce que voit l'acheteur est exactement
 * ce qu'il paiera plus tard. Omis (null) tant que cette offre n'est pas configurée/achetable.
 */
export function getAddonRenewalPrice(addonOffer: OfferRow | undefined): string | null {
    return addonOffer?.stripe_price_id && addonOffer.price_cents > 0 ? formatOfferPrice(addonOffer.price_cents) : null;
}

export function formatOfferPrice(cents: number): string {
    return (cents / 100).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}
