-- ==========================================
-- ENVOI D'EXERCICES : BLOQUE AUSSI LE STATUT "EXPIRED"
-- Un utilisateur dont l'essai est terminé (EXPIRED) ne peut plus soumettre d'exercice à la
-- correction, comme les membres de l'offre à vie dont la période de feedback est écoulée.
-- Le trigger enforce_feedback_access (add_lifetime_offer.sql) appelle cette fonction : il suffit
-- de la redéfinir. Les soumissions déjà envoyées (PENDING_REVIEW) ne sont pas touchées, seul un
-- nouvel envoi ou une modification de la réponse est refusé.
-- CANCELED et UNPAID restent volontairement inchangés.
-- ==========================================
CREATE OR REPLACE FUNCTION public.feedback_access_revoked()
RETURNS BOOLEAN AS $$
SELECT EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
      AND (
          subscription_status IN ('EXPIRED', 'LIFETIME_EXPIRED')
          OR (subscription_status = 'LIFETIME' AND mainframe_ends_at <= now())
      )
);
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;
