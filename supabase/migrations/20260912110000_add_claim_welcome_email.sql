-- ==========================================
-- ENVOI DE L'EMAIL DE BIENVENUE : CLAIM ATOMIQUE
-- Le "check (welcome_email_sent) puis send puis update" côté application n'est pas atomique :
-- dashboard/page.tsx peut être rendu deux fois en quasi-simultané pour la même première visite
-- (ex: requête de prefetch + requête de navigation de Next.js), et les deux appels lisaient
-- welcome_email_sent = false avant qu'aucun des deux n'ait eu le temps de le repasser à true,
-- d'où l'email envoyé deux fois. Cette fonction fait du flip false -> true un UPDATE unique :
-- Postgres sérialise les deux UPDATE concurrents sur la même ligne, un seul peut "gagner".
-- ==========================================
CREATE OR REPLACE FUNCTION public.claim_welcome_email()
RETURNS users AS $$
DECLARE v_user users;
BEGIN
    UPDATE users SET welcome_email_sent = true
    WHERE id = auth.uid() AND welcome_email_sent = false
    RETURNING * INTO v_user;

    -- v_user reste à NULL (tous les champs) si déjà envoyé, ou si l'appel a perdu la course :
    -- c'est le signal pour l'appelant de ne PAS renvoyer l'email.
    RETURN v_user;
END; $$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
GRANT EXECUTE ON FUNCTION public.claim_welcome_email() TO authenticated;
