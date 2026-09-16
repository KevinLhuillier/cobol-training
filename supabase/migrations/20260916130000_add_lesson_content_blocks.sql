-- ==========================================
-- BLOCS DE CONTENU DE LEÇON (éditeur façon Teachizy)
-- Remplace progressivement le champ `content` (un unique bloc de texte riche) par une liste
-- ordonnée de blocs typés (texte, image, vidéo, ...), ajoutés au fur et à mesure — on ne
-- construit ici que le support des blocs "texte" et "image". Le contenu existant n'est pas
-- migré en base : LessonBuilder le reprend à la volée comme premier bloc texte tant que
-- content_blocks est vide (cf. components/courses/lesson-builder.tsx), donc rien n'est perdu
-- à l'ouverture.
-- ==========================================
ALTER TABLE lessons ADD COLUMN content_blocks JSONB NOT NULL DEFAULT '[]'::jsonb;

-- ==========================================
-- STORAGE : bucket pour les images des blocs "image" de leçon
-- Même mécanisme S3 que le bucket "chat-images" (Supabase Storage est backé par S3), mais
-- PUBLIC en lecture cette fois : ce sont des images de contenu de cours vues en boucle par
-- tous les étudiants, une URL publique directe évite d'avoir à régénérer une URL signée à
-- chaque affichage. Écriture réservée aux admins.
-- ==========================================
INSERT INTO storage.buckets (id, name, public) VALUES ('lesson-images', 'lesson-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Upload images de leçon" ON storage.objects FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'lesson-images' AND public.is_admin());

CREATE POLICY "Lecture publique images de leçon" ON storage.objects FOR SELECT
    USING (bucket_id = 'lesson-images');
