"use client";

import { createClient } from "@/utils/supabase/client";
import { createBlockId } from "@/components/courses/lesson-blocks/create-block-id";
import type { AttachmentFile } from "@/components/courses/lesson-blocks/types";

const LESSON_ATTACHMENTS_BUCKET = "lesson-attachments";
// Aligné sur le file_size_limit du bucket (cf. migration add_lesson_attachments_bucket)
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

/**
 * Upload un fichier de bloc "attachments" vers le bucket Supabase Storage "lesson-attachments"
 * (public, écriture réservée aux admins par RLS) et renvoie sa description à stocker dans le bloc.
 * Rangé dans un dossier unique pour garder le nom d'origine dans l'URL sans risque de collision.
 */
export async function uploadLessonAttachment(file: File): Promise<AttachmentFile> {
    if (file.size > MAX_FILE_SIZE) {
        throw new Error(`"${file.name}" is too large (50MB max).`);
    }

    // Les clés Storage n'acceptent pas tous les caractères : le nom affiché garde l'original
    const safeName = file.name.replace(/[^A-Za-z0-9._-]+/g, "_") || "file";
    const path = `${crypto.randomUUID()}/${safeName}`;

    const supabase = createClient();
    const { error } = await supabase.storage
        .from(LESSON_ATTACHMENTS_BUCKET)
        .upload(path, file, { contentType: file.type || "application/octet-stream" });
    if (error) throw error;

    const { data } = supabase.storage.from(LESSON_ATTACHMENTS_BUCKET).getPublicUrl(path);
    return { id: createBlockId(), url: data.publicUrl, name: file.name, size: file.size };
}

/**
 * Supprime un fichier du bucket "lesson-attachments" à partir de son URL publique — appelé quand
 * un fichier est retiré d'un bloc (cf. lesson-builder.tsx). Sans effet pour une URL étrangère.
 */
export async function deleteLessonAttachment(url: string): Promise<void> {
    const marker = `/object/public/${LESSON_ATTACHMENTS_BUCKET}/`;
    const markerIndex = url.indexOf(marker);
    if (markerIndex === -1) return;

    const path = decodeURIComponent(url.slice(markerIndex + marker.length));
    const supabase = createClient();
    const { error } = await supabase.storage.from(LESSON_ATTACHMENTS_BUCKET).remove([path]);
    if (error) throw error;
}
