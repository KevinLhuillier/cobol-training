-- ==========================================
-- ABONNEMENT IMPAYÉ (échec de paiement Stripe)
-- Distinct de CANCELED/EXPIRED : la souscription existe toujours côté Stripe
-- (past_due/unpaid) mais l'accès est suspendu jusqu'à régularisation.
-- ==========================================
ALTER TYPE subscription_status ADD VALUE 'UNPAID';
