-- ==========================================
-- BLOCS DE CONTENU DE CHALLENGE (mêmes composants que le builder de leçon)
-- Remplace le champ `description` (un unique bloc de texte riche) par une liste ordonnée de
-- blocs typés (texte, image, code, ..., et désormais "solution"), au même format JSONB que
-- lessons.content_blocks (cf. 20260916130000_add_lesson_content_blocks.sql) et rendue par le
-- même composant LessonBlocksView. Éditée depuis l'admin par components/admin/challenge-builder.tsx.
--
-- Le contenu existant est repris comme premier bloc texte pour ne rien perdre, puis la colonne
-- legacy est supprimée (même séquence que pour lessons, faite en une seule migration ici faute
-- de données réelles à risque sur cette table récente).
-- ==========================================
ALTER TABLE challenges ADD COLUMN content_blocks JSONB NOT NULL DEFAULT '[]'::jsonb;

UPDATE challenges
SET content_blocks = jsonb_build_array(
    jsonb_build_object(
        'id', gen_random_uuid()::text,
        'type', 'text',
        'data', jsonb_build_object('html', description)
    )
)
WHERE description IS NOT NULL AND btrim(description) <> '';

ALTER TABLE challenges DROP COLUMN description;
