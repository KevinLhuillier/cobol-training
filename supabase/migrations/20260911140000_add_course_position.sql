-- ==========================================
-- POSITION DES COURS (ordre d'affichage)
-- ==========================================
ALTER TABLE courses ADD COLUMN position INTEGER;

-- Backfill : on conserve l'ordre actuel (le plus ancien en premier)
WITH ordered AS (
    SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC) - 1 AS rn
    FROM courses
)
UPDATE courses
SET position = ordered.rn
FROM ordered
WHERE courses.id = ordered.id;

ALTER TABLE courses ALTER COLUMN position SET DEFAULT 0;
ALTER TABLE courses ALTER COLUMN position SET NOT NULL;
