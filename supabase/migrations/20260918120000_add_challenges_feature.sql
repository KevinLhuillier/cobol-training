-- ==========================================
-- CHALLENGES HEBDOMADAIRES
-- Un défi de code (COBOL, JCL, ...) envoyé chaque semaine dans la newsletter. Le "challenge de la
-- semaine" n'est pas une colonne : c'est simplement le challenge visible le plus récent
-- (starts_at le plus grand). Les précédents constituent l'historique affiché en dessous.
--
-- Un challenge est visible des étudiants quand il est publié ET que sa date de début est atteinte :
-- l'admin peut donc préparer le suivant à l'avance (is_published = true, starts_at futur) et il
-- apparaît tout seul le jour venu. Brouillon par défaut, comme courses/chapters/lessons.
-- starts_at est une DATE comparée à current_date (UTC côté Supabase).
-- ==========================================
CREATE TABLE challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,                                -- HTML produit par l'éditeur riche (components/editor.tsx)
    language TEXT NOT NULL DEFAULT 'COBOL',          -- COBOL, JCL, REXX, ... (libellé d'affichage)
    starts_at DATE NOT NULL DEFAULT current_date,
    is_published BOOLEAN NOT NULL DEFAULT false,

    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE TRIGGER set_updated_at BEFORE UPDATE ON challenges FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE INDEX challenges_starts_at_idx ON challenges (starts_at DESC);

-- ==========================================
-- SOLUTIONS SOUMISES
-- Une seule ligne par étudiant et par challenge : soumettre à nouveau met la solution à jour
-- (upsert côté client, cf. components/challenges/challenge-submission-form.tsx).
-- ==========================================
CREATE TABLE challenge_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challenge_id UUID NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    solution TEXT NOT NULL CHECK (char_length(solution) <= 50000),

    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),

    UNIQUE(challenge_id, user_id)
);
CREATE TRIGGER set_updated_at BEFORE UPDATE ON challenge_submissions FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- ==========================================
-- RLS
-- ==========================================
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_submissions ENABLE ROW LEVEL SECURITY;

-- Les étudiants ne voient que les challenges publiés dont la date est atteinte. Les admins
-- gardent l'accès complet (brouillons et challenges programmés compris) via leur policy FOR ALL.
CREATE POLICY "Challenges visibles en lecture" ON challenges FOR SELECT
    USING (is_published AND starts_at <= current_date);
CREATE POLICY "Admins full access challenges" ON challenges FOR ALL USING (public.is_admin());

-- Un étudiant ne peut soumettre (ou modifier) que sa propre solution, et uniquement pour un
-- challenge qu'il peut voir. Pas de DELETE côté étudiant.
CREATE POLICY "Etudiants voient leurs solutions" ON challenge_submissions FOR SELECT
    USING (auth.uid() = user_id);
CREATE POLICY "Etudiants soumettent leur solution" ON challenge_submissions FOR INSERT
    WITH CHECK (
        auth.uid() = user_id
        AND EXISTS (SELECT 1 FROM challenges c WHERE c.id = challenge_id AND c.is_published AND c.starts_at <= current_date)
    );
CREATE POLICY "Etudiants modifient leur solution" ON challenge_submissions FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (
        auth.uid() = user_id
        AND EXISTS (SELECT 1 FROM challenges c WHERE c.id = challenge_id AND c.is_published AND c.starts_at <= current_date)
    );
CREATE POLICY "Admins full access challenge_submissions" ON challenge_submissions FOR ALL USING (public.is_admin());

-- GRANT explicites obligatoires en plus du RLS (cf. add_table_grants.sql).
GRANT SELECT ON challenges TO authenticated;
GRANT INSERT, UPDATE, DELETE ON challenges TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON challenge_submissions TO authenticated;
