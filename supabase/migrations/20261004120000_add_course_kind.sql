-- ==========================================
-- COURS / PROJETS
-- Un projet est un cours comme un autre (chapitres, leçons, lecteur, progression, badge,
-- gratuit/payant) : seul son type change l'endroit où il est listé côté étudiant —
-- menu "Courses" (/dashboard) pour COURSE, menu "Projects" (/dashboard/projects) pour PROJECT.
-- Les cours existants restent des COURSE.
-- ==========================================
-- Table "projects" d'une première itération jamais livrée : supprimée si elle a été créée en local.
DROP TABLE IF EXISTS projects;

ALTER TABLE courses ADD COLUMN kind TEXT NOT NULL DEFAULT 'COURSE'
    CHECK (kind IN ('COURSE', 'PROJECT'));
