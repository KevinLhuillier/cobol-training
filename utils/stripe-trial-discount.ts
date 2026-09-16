import { stripe } from "@/utils/stripe";

// Coupon partagé, réutilisé pour tout le monde : c'est le Promotion Code (unique par
// utilisateur, cf. createTrialDiscountPromotionCode) qui porte l'expiration 48h, la
// restriction au customer et l'usage unique — pas le Coupon lui-même.
const TRIAL_DISCOUNT_COUPON_ID = "TRIAL_ENDING_20_OFF";
const DISCOUNT_VALIDITY_SECONDS = 48 * 60 * 60;

function isMissingResourceError(err: unknown): boolean {
    return typeof err === "object" && err !== null && "code" in err && (err as { code?: string }).code === "resource_missing";
}

async function ensureTrialDiscountCoupon(): Promise<void> {
    try {
        await stripe.coupons.retrieve(TRIAL_DISCOUNT_COUPON_ID);
    } catch (err) {
        if (!isMissingResourceError(err)) throw err;
        await stripe.coupons.create({
            id: TRIAL_DISCOUNT_COUPON_ID,
            percent_off: 20,
            duration: "forever",
            name: "Trial ending discount (-20%)",
        });
    }
}

/**
 * Génère un Promotion Code Stripe individuel (-20% à vie sur l'abonnement, valable 48h,
 * utilisable une seule fois, restreint à ce customer) pour relancer un utilisateur dont
 * l'essai vient d'expirer.
 */
export async function createTrialDiscountPromotionCode(customerId: string): Promise<{ code: string; expiresAt: string }> {
    await ensureTrialDiscountCoupon();

    const expiresAtSeconds = Math.floor(Date.now() / 1000) + DISCOUNT_VALIDITY_SECONDS;

    const promotionCode = await stripe.promotionCodes.create({
        promotion: { type: "coupon", coupon: TRIAL_DISCOUNT_COUPON_ID },
        customer: customerId,
        expires_at: expiresAtSeconds,
        max_redemptions: 1,
    });

    return { code: promotionCode.code, expiresAt: new Date(expiresAtSeconds * 1000).toISOString() };
}

/**
 * Retrouve un Promotion Code encore valide pour ce customer précis, à partir du code
 * saisi/transmis au checkout. `active` couvre déjà l'expiration et l'épuisement des
 * redemptions côté Stripe ; on revérifie le customer pour empêcher qu'un code deviné
 * soit utilisé par quelqu'un d'autre que son destinataire.
 */
export async function findActiveTrialDiscountPromotionCode(code: string, customerId: string) {
    const { data } = await stripe.promotionCodes.list({ code, active: true, limit: 1 });
    const promotionCode = data[0];
    if (!promotionCode || promotionCode.customer !== customerId) return null;
    return promotionCode;
}
