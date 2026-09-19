-- ==========================================
-- PRIX BARRE DE L'OFFRE
-- Prix "avant remise" optionnel, affiché barré à côté du prix courant sur /dashboard/subscribe.
-- NULL = pas de prix barré. Comme price_cents, il est purement informatif (non branché sur Stripe).
-- Doit être strictement supérieur à price_cents pour avoir un sens (garanti côté action admin).
-- ==========================================
ALTER TABLE offer_settings ADD COLUMN original_price_cents INTEGER CHECK (original_price_cents IS NULL OR original_price_cents >= 0);
