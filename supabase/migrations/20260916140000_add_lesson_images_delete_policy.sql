-- ==========================================
-- Politique manquante : la migration précédente (add_lesson_content_blocks) autorisait
-- l'upload (INSERT) et la lecture (SELECT) sur le bucket "lesson-images", mais pas la
-- suppression — nécessaire pour nettoyer les images orphelines quand un bloc image est
-- supprimé ou son image remplacée (cf. components/courses/lesson-builder.tsx).
-- ==========================================
CREATE POLICY "Suppression images de leçon" ON storage.objects FOR DELETE TO authenticated
    USING (bucket_id = 'lesson-images' AND public.is_admin());
