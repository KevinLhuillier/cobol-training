-- ==========================================
-- STORAGE : bucket pour les images de couverture des cours (courses.image_url)
-- Jusqu'ici l'admin devait coller une URL externe. Même mécanisme que le bucket "lesson-images"
-- (Supabase Storage est backé par S3) : PUBLIC en lecture, car ces images sont affichées en boucle
-- sur le dashboard de tous les étudiants (une URL publique directe évite de régénérer une URL
-- signée à chaque affichage). Écriture / suppression réservées aux admins.
-- ==========================================
INSERT INTO storage.buckets (id, name, public) VALUES ('course-images', 'course-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Upload images de cours" ON storage.objects FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'course-images' AND public.is_admin());

CREATE POLICY "Lecture publique images de cours" ON storage.objects FOR SELECT
    USING (bucket_id = 'course-images');

CREATE POLICY "Suppression images de cours" ON storage.objects FOR DELETE TO authenticated
    USING (bucket_id = 'course-images' AND public.is_admin());
