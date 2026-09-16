"use client";

import { createClient } from "@/utils/supabase/client";

const LESSON_IMAGES_BUCKET = "lesson-images";
const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8MB
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];

/**
 * Upload une image de bloc de leçon vers le bucket Supabase Storage "lesson-images" (public,
 * écriture réservée aux admins par RLS — cf. la migration add_lesson_content_blocks) et
 * renvoie son URL publique.
 */
export async function uploadLessonImage(file: File): Promise<string> {
    if (!ALLOWED_TYPES.includes(file.type)) {
        throw new Error("Unsupported image format. Use PNG, JPEG, WEBP or GIF.");
    }
    if (file.size > MAX_FILE_SIZE) {
        throw new Error("Image is too large (8MB max).");
    }

    const supabase = createClient();
    const extension = file.name.split(".").pop()?.toLowerCase() || "png";
    const path = `${crypto.randomUUID()}.${extension}`;

    const { error } = await supabase.storage
        .from(LESSON_IMAGES_BUCKET)
        .upload(path, file, { contentType: file.type });

    if (error) throw error;

    const { data } = supabase.storage.from(LESSON_IMAGES_BUCKET).getPublicUrl(path);
    return data.publicUrl;
}

/**
 * Supprime une image du bucket "lesson-images" à partir de son URL publique — appelé quand un
 * bloc image est supprimé ou son image remplacée (cf. lesson-builder.tsx), pour ne pas laisser
 * de fichiers orphelins dans le bucket.
 */
export async function deleteLessonImage(url: string): Promise<void> {
    const marker = `/object/public/${LESSON_IMAGES_BUCKET}/`;
    const markerIndex = url.indexOf(marker);
    if (markerIndex === -1) return; // URL inattendue (pas issue de ce bucket) : on ne tente rien.

    const path = decodeURIComponent(url.slice(markerIndex + marker.length));
    const supabase = createClient();
    const { error } = await supabase.storage.from(LESSON_IMAGES_BUCKET).remove([path]);
    if (error) throw error;
}
