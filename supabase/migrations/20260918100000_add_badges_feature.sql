-- ==========================================
-- BADGES : un badge optionnel par cours, débloqué automatiquement lorsqu'un étudiant
-- termine toutes les leçons publiées du cours (lessons, quiz et exercices confondus,
-- puisque tous les types de leçons se traduisent par lesson_progress.is_completed = true).
-- ==========================================
CREATE TABLE badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL UNIQUE REFERENCES courses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT NOT NULL DEFAULT 'Award',

    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE TRIGGER set_updated_at BEFORE UPDATE ON badges FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- ==========================================
-- BADGES DÉBLOQUÉS PAR ÉTUDIANT
-- seen_at reste NULL jusqu'à ce que l'étudiant ferme la pop-up de déblocage sur le dashboard
-- (cf. components/badges/new-badge-dialog.tsx) : c'est ce qui permet de ne montrer la pop-up
-- qu'une seule fois par badge, à son prochain retour sur /dashboard.
-- ==========================================
CREATE TABLE user_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMPTZ DEFAULT now(),
    seen_at TIMESTAMPTZ,

    UNIQUE(user_id, badge_id)
);
CREATE INDEX user_badges_user_idx ON user_badges(user_id);

-- ==========================================
-- ATTRIBUTION AUTOMATIQUE
-- Se déclenche à chaque upsert de lesson_progress (bouton "Complete Lesson", validation
-- d'exercice côté étudiant OU approbation admin via processReviewAction, quiz réussi) : dès que
-- la leçon vient d'être marquée complétée, on vérifie si TOUTES les leçons du cours associé le
-- sont désormais pour cet utilisateur, et si un badge est configuré sur ce cours.
-- SECURITY DEFINER : nécessaire pour lire toutes les lesson_progress du cours (pas seulement
-- celles de l'utilisateur courant, filtrées par RLS) et pour insérer dans user_badges sans
-- donner aux étudiants de droit d'écriture direct sur cette table (cf. policies ci-dessous).
-- ==========================================
CREATE OR REPLACE FUNCTION public.award_course_badge()
RETURNS TRIGGER AS $$
DECLARE
    v_course_id UUID;
    v_badge_id UUID;
    v_total_lessons INTEGER;
    v_completed_lessons INTEGER;
BEGIN
    IF NEW.is_completed IS DISTINCT FROM TRUE THEN
        RETURN NEW;
    END IF;

    SELECT ch.course_id INTO v_course_id
    FROM lessons le
    JOIN chapters ch ON ch.id = le.chapter_id
    WHERE le.id = NEW.lesson_id;

    SELECT id INTO v_badge_id FROM badges WHERE course_id = v_course_id;
    IF v_badge_id IS NULL THEN
        RETURN NEW;
    END IF;

    SELECT count(*) INTO v_total_lessons
    FROM lessons le
    JOIN chapters ch ON ch.id = le.chapter_id
    WHERE ch.course_id = v_course_id;

    SELECT count(*) INTO v_completed_lessons
    FROM lesson_progress lp
    JOIN lessons le ON le.id = lp.lesson_id
    JOIN chapters ch ON ch.id = le.chapter_id
    WHERE ch.course_id = v_course_id
      AND lp.user_id = NEW.user_id
      AND lp.is_completed = true;

    IF v_total_lessons > 0 AND v_completed_lessons >= v_total_lessons THEN
        INSERT INTO user_badges (user_id, badge_id)
        VALUES (NEW.user_id, v_badge_id)
        ON CONFLICT (user_id, badge_id) DO NOTHING;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trg_award_course_badge
    AFTER INSERT OR UPDATE ON lesson_progress
    FOR EACH ROW EXECUTE PROCEDURE public.award_course_badge();

-- ==========================================
-- RLS
-- ==========================================
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

-- Catalogue de badges en lecture libre (même logique que courses/chapters/lessons), édition
-- réservée aux admins depuis la fiche cours.
CREATE POLICY "Badges en lecture libre" ON badges FOR SELECT USING (true);
CREATE POLICY "Admins full access badges" ON badges FOR ALL USING (public.is_admin());

-- Un étudiant voit ses propres badges débloqués et peut uniquement les marquer comme vus
-- (fermeture de la pop-up) : aucune policy INSERT/DELETE pour lui, l'attribution ne passe que
-- par le trigger SECURITY DEFINER ci-dessus.
CREATE POLICY "Etudiants voient leurs badges" ON user_badges FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Etudiants marquent leurs badges vus" ON user_badges FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins full access user_badges" ON user_badges FOR ALL USING (public.is_admin());

GRANT SELECT ON badges TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON badges TO authenticated;
GRANT SELECT, UPDATE ON user_badges TO authenticated;
