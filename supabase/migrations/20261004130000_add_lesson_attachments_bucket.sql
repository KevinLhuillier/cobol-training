-- ==========================================
-- STORAGE : bucket pour les fichiers des blocs "attachments" de leçon
-- Même mécanisme que le bucket "lesson-images" : PUBLIC en lecture (lien de téléchargement
-- direct, sans URL signée à régénérer), écriture / suppression réservées aux admins.
-- Tout type de fichier est accepté (sources COBOL/JCL, jeux de données, PDF, archives...),
-- 50 Mo maximum par fichier (contrôlé aussi côté client, cf. utils/lesson-attachment-storage.ts).
-- ==========================================
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('lesson-attachments', 'lesson-attachments', true, 52428800)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Upload pièces jointes de leçon" ON storage.objects FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'lesson-attachments' AND public.is_admin());

CREATE POLICY "Lecture publique pièces jointes de leçon" ON storage.objects FOR SELECT
    USING (bucket_id = 'lesson-attachments');

CREATE POLICY "Suppression pièces jointes de leçon" ON storage.objects FOR DELETE TO authenticated
    USING (bucket_id = 'lesson-attachments' AND public.is_admin());
