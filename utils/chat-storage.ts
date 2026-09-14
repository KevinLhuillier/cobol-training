"use client";

import { createClient } from "@/utils/supabase/client";

const CHAT_IMAGES_BUCKET = "chat-images";

/**
 * Upload une image collée dans le chat vers le dossier de l'étudiant concerné
 * (convention de chemin imposée par les policies RLS de storage.objects).
 */
export async function uploadChatImage(file: File, studentId: string): Promise<string> {
    const supabase = createClient();
    const extension = file.name.split(".").pop() || "png";
    const path = `${studentId}/${crypto.randomUUID()}.${extension}`;

    const { error } = await supabase.storage
        .from(CHAT_IMAGES_BUCKET)
        .upload(path, file, { contentType: file.type });

    if (error) throw error;

    return path;
}

/**
 * Génère une URL signée pour afficher une image du chat (bucket privé).
 */
export async function getChatImageSignedUrl(path: string): Promise<string> {
    const supabase = createClient();
    const { data, error } = await supabase.storage
        .from(CHAT_IMAGES_BUCKET)
        .createSignedUrl(path, 60 * 60);

    if (error) throw error;

    return data.signedUrl;
}
