-- ==========================================
-- ANNULATION PROGRAMMÉE DE L'ABONNEMENT
-- Stripe reste la source de vérité ; ces colonnes ne servent qu'à afficher l'état
-- sans redemander l'API Stripe à chaque chargement de la page Settings.
-- ==========================================
ALTER TABLE users
    ADD COLUMN cancel_at_period_end BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN current_period_end TIMESTAMPTZ;

-- Self-service : l'utilisateur met à jour son propre nom affiché (colonne "name" uniquement).
CREATE OR REPLACE FUNCTION public.update_own_name(p_name TEXT)
RETURNS void AS $$
BEGIN
    IF length(trim(p_name)) = 0 THEN
        RAISE EXCEPTION 'invalid_name';
    END IF;

    UPDATE users SET name = trim(p_name) WHERE id = auth.uid();
END; $$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
GRANT EXECUTE ON FUNCTION public.update_own_name(TEXT) TO authenticated;
