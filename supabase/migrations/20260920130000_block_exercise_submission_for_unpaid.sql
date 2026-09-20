-- ==========================================
-- ENVOI D'EXERCICES : BLOQUE AUSSI LE STATUT "UNPAID"
-- Un utilisateur dont le paiement a échoué (UNPAID) ne peut plus soumettre d'exercice à la
-- correction, comme pour EXPIRED et l'offre à vie terminée (cf. block_exercise_submission_for_expired.sql).
-- Redéfinit feedback_access_revoked() appelée par le trigger enforce_feedback_access.
-- Les soumissions déjà envoyées ne sont pas touchées. CANCELED reste inchangé.
-- ==========================================
CREATE OR REPLACE FUNCTION public.feedback_access_revoked()
RETURNS BOOLEAN AS $$
SELECT EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
      AND (
          subscription_status IN ('EXPIRED', 'UNPAID', 'LIFETIME_EXPIRED')
          OR (subscription_status = 'LIFETIME' AND mainframe_ends_at <= now())
      )
);
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;
