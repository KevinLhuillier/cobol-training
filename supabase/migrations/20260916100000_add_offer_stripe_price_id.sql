-- ==========================================
-- LIAISON DE L'OFFRE AU PRIX STRIPE
-- Jusqu'ici, le Price ID Stripe utilisé pour le checkout était figé dans la variable
-- d'environnement STRIPE_PRICE_ID : changer de prix nécessitait un redéploiement.
-- On le déplace dans offer_settings pour pouvoir le mettre à jour depuis l'admin
-- (/dashboard/admin/offer), sans toucher à l'environnement. price_cents reste purement
-- informatif (ce que voit l'étudiant) ; stripe_price_id est désormais la source de vérité
-- pour ce que Stripe facture réellement au checkout.
-- ==========================================
ALTER TABLE offer_settings ADD COLUMN stripe_price_id TEXT;

-- Backfill avec la valeur actuellement en dur dans STRIPE_PRICE_ID, pour continuité.
UPDATE offer_settings SET stripe_price_id = 'price_1SeKLMRoVLfRVnKcLVg9saWQ' WHERE id = 1;

ALTER TABLE offer_settings ALTER COLUMN stripe_price_id SET NOT NULL;
ALTER TABLE offer_settings ADD CONSTRAINT offer_settings_stripe_price_id_format CHECK (stripe_price_id ~ '^price_');
