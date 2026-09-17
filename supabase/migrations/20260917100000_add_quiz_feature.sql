-- ==========================================
-- QUIZ : questions/réponses en JSONB sur lessons (même approche que content_blocks,
-- cf. 20260916130000_add_lesson_content_blocks.sql) + taux de réussite paramétrable.
-- Une leçon de type QUIZ n'utilise pas content_blocks : QuizBuilder gère quiz_questions
-- à la place du builder classique (cf. components/courses/quiz/quiz-builder.tsx).
-- ==========================================
ALTER TABLE lessons ADD COLUMN quiz_questions JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE lessons ADD COLUMN quiz_pass_rate INTEGER NOT NULL DEFAULT 70
    CHECK (quiz_pass_rate BETWEEN 0 AND 100);

-- ==========================================
-- HISTORIQUE DES TENTATIVES DE QUIZ
-- Contrairement à lesson_progress (un seul état courant par leçon), un étudiant peut
-- recommencer un quiz autant de fois qu'il le souhaite : on garde une ligne par tentative.
-- lesson_progress.is_completed reste mis à jour (reflète la dernière tentative) pour que le
-- reste du parcours (sidebar, bouton "Complete Lesson") continue de fonctionner à l'identique.
-- ==========================================
CREATE TABLE quiz_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    score INTEGER NOT NULL,
    total INTEGER NOT NULL,
    passed BOOLEAN NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX quiz_attempts_lesson_user_idx ON quiz_attempts(lesson_id, user_id);

ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;

-- Historique en lecture seule côté étudiant : uniquement le droit de créer une tentative et de
-- consulter les siennes, jamais de les modifier ou de les supprimer (intégrité de l'historique).
CREATE POLICY "Etudiants créent leurs tentatives de quiz" ON quiz_attempts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Etudiants voient leurs tentatives de quiz" ON quiz_attempts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins full access quiz_attempts" ON quiz_attempts FOR ALL USING (public.is_admin());

GRANT SELECT, INSERT, UPDATE, DELETE ON quiz_attempts TO authenticated;
