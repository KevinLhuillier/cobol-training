-- ==========================================
-- MESSAGERIE ETUDIANT <-> FORMATEUR
-- Pas de table "conversations" séparée : une conversation = toutes les lignes
-- messages partageant le même student_id (un seul formateur, tous les admins
-- partagent la même boîte de réception).
-- ==========================================
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- identifie la conversation (toujours l'étudiant)
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,  -- qui a écrit ce message (étudiant OU admin)
    content TEXT,
    image_path TEXT,        -- chemin dans le bucket "chat-images", nullable
    read_at TIMESTAMPTZ,    -- lu par le destinataire (le tiers qui n'est pas sender_id)
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT messages_content_or_image CHECK (content IS NOT NULL OR image_path IS NOT NULL)
);

CREATE INDEX messages_student_id_created_at_idx ON messages (student_id, created_at);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Voir sa conversation" ON messages FOR SELECT
    USING (auth.uid() = student_id OR public.is_admin());
CREATE POLICY "Ecrire dans sa conversation" ON messages FOR INSERT
    WITH CHECK (sender_id = auth.uid() AND (student_id = auth.uid() OR public.is_admin()));
CREATE POLICY "Marquer comme lu" ON messages FOR UPDATE
    USING (auth.uid() = student_id OR public.is_admin())
    WITH CHECK (auth.uid() = student_id OR public.is_admin());

-- GRANT explicite obligatoire en plus du RLS (cf. add_table_grants.sql) : sans lui,
-- toute requête échoue avec "permission denied" même si les policies sont correctes.
GRANT SELECT, INSERT, UPDATE ON messages TO authenticated;

-- Active le temps réel (Supabase Realtime) sur cette table.
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- Fonction utilitaire pour le badge "non lus" de la sidebar (même pattern que has_active_access()) :
-- côté étudiant -> messages non lus dans SA conversation envoyés par l'admin ;
-- côté admin -> messages non lus dans TOUTES les conversations envoyés par un étudiant.
CREATE OR REPLACE FUNCTION public.unread_messages_count()
RETURNS INTEGER AS $$
    SELECT COUNT(*)::INTEGER FROM messages
    WHERE read_at IS NULL
      AND sender_id != auth.uid()
      AND (student_id = auth.uid() OR public.is_admin());
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;
GRANT EXECUTE ON FUNCTION public.unread_messages_count() TO authenticated;

-- ==========================================
-- STORAGE : bucket privé pour les images collées dans le chat
-- Convention de chemin : {student_id}/{uuid}.{ext} — un étudiant ne peut écrire/lire
-- que dans son propre dossier, un admin peut écrire/lire dans tous les dossiers.
-- ==========================================
INSERT INTO storage.buckets (id, name, public) VALUES ('chat-images', 'chat-images', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Upload images chat" ON storage.objects FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'chat-images' AND ((storage.foldername(name))[1] = auth.uid()::text OR public.is_admin()));
CREATE POLICY "Lecture images chat" ON storage.objects FOR SELECT TO authenticated
    USING (bucket_id = 'chat-images' AND ((storage.foldername(name))[1] = auth.uid()::text OR public.is_admin()));
