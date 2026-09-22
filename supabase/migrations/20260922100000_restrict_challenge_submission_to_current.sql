-- ==========================================
-- CHALLENGES : SOUMISSION RÉSERVÉE AU CHALLENGE EN COURS
-- Un étudiant ne peut désormais soumettre (ou modifier) une solution que pour le "challenge de la
-- semaine" : le challenge publié et démarré le plus récent — même définition que côté client
-- (cf. app/dashboard/challenges/page.tsx, order by starts_at desc puis created_at desc, premier
-- élément = "featured" dans components/challenges/challenge-board.tsx).
-- Les solutions déjà envoyées pour un challenge devenu "précédent" restent visibles (SELECT
-- inchangé) et ne sont pas supprimées : seul un nouvel envoi ou une modification est refusé.
-- ==========================================
DROP POLICY IF EXISTS "Etudiants soumettent leur solution" ON challenge_submissions;
DROP POLICY IF EXISTS "Etudiants modifient leur solution" ON challenge_submissions;

CREATE POLICY "Etudiants soumettent leur solution" ON challenge_submissions FOR INSERT
    WITH CHECK (
        auth.uid() = user_id
        AND challenge_id = (
            SELECT id FROM challenges
            WHERE is_published AND starts_at <= current_date
            ORDER BY starts_at DESC, created_at DESC
            LIMIT 1
        )
    );
CREATE POLICY "Etudiants modifient leur solution" ON challenge_submissions FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (
        auth.uid() = user_id
        AND challenge_id = (
            SELECT id FROM challenges
            WHERE is_published AND starts_at <= current_date
            ORDER BY starts_at DESC, created_at DESC
            LIMIT 1
        )
    );
