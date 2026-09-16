-- ==========================================
-- COUPON DE RELANCE FIN D'ESSAI
-- Un code promo Stripe (-20%, valable 48h, usage unique, restreint au customer) est généré
-- automatiquement lors de l'envoi du mail de fin de trial (cron expire-trials) pour inciter
-- à s'abonner. Stocké ici uniquement pour affichage/traçabilité côté app ; l'expiration et
-- l'usage unique sont appliqués par Stripe lui-même (PromotionCode.expires_at /
-- max_redemptions), ces colonnes ne font que refléter ce que Stripe a émis.
-- ==========================================
ALTER TABLE users
    ADD COLUMN trial_discount_code TEXT,
    ADD COLUMN trial_discount_expires_at TIMESTAMPTZ;
