-- ==========================================
-- PUBLICATION DES CHAPITRES ET DES LEÇONS
-- Permet à l'admin de construire un nouveau contenu en brouillon sans l'exposer aux étudiants
-- (même logique que courses.is_published). Un chapitre ou une leçon non publié(e) est invisible
-- côté étudiant ; une leçon n'est visible que si son chapitre l'est aussi.
-- ==========================================

-- 1. Le contenu existant doit rester visible : on ajoute les colonnes avec DEFAULT true pour que
--    toutes les lignes déjà présentes soient publiées, puis on bascule le DEFAULT à false pour
--    que tout chapitre/leçon créé ensuite soit un brouillon.
ALTER TABLE chapters ADD COLUMN is_published BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE chapters ALTER COLUMN is_published SET DEFAULT false;

ALTER TABLE lessons ADD COLUMN is_published BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE lessons ALTER COLUMN is_published SET DEFAULT false;

-- 2. Lecture étudiante limitée au contenu publié. Les admins conservent l'accès complet via leur
--    policy "Admins full access ..." (FOR ALL), les policies permissives étant combinées en OR.
DROP POLICY "Chapitres en lecture libre" ON chapters;
CREATE POLICY "Chapitres publiés en lecture libre" ON chapters FOR SELECT USING (is_published);

DROP POLICY "Leçons en lecture libre" ON lessons;
CREATE POLICY "Leçons publiées en lecture libre" ON lessons FOR SELECT USING (
    is_published
    AND EXISTS (SELECT 1 FROM chapters WHERE chapters.id = lessons.chapter_id AND chapters.is_published)
);

-- 3. Badge : le cours est "terminé" quand toutes les leçons PUBLIÉES sont complétées. Le trigger
--    est SECURITY DEFINER (il contourne donc le RLS ci-dessus) : le filtre doit être explicite.
--    Sans lui, une leçon en brouillon empêcherait indéfiniment l'obtention du badge.
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
    WHERE ch.course_id = v_course_id
      AND ch.is_published
      AND le.is_published;

    SELECT count(*) INTO v_completed_lessons
    FROM lesson_progress lp
    JOIN lessons le ON le.id = lp.lesson_id
    JOIN chapters ch ON ch.id = le.chapter_id
    WHERE ch.course_id = v_course_id
      AND ch.is_published
      AND le.is_published
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
