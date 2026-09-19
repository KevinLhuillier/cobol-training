"use client";

import { createClient } from "@/utils/supabase/client";

const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8MB
export const IMAGE_ACCEPT = "image/png,image/jpeg,image/webp,image/gif";
const ALLOWED_TYPES = IMAGE_ACCEPT.split(",");

/** Lève une erreur au message affichable si le fichier n'est pas une image acceptée. */
export function validateImageFile(file: File): void {
    if (!ALLOWED_TYPES.includes(file.type)) {
        throw new Error("Unsupported image format. Use PNG, JPEG, WEBP or GIF.");
    }
    if (file.size > MAX_FILE_SIZE) {
        throw new Error("Image is too large (8MB max).");
    }
}

/**
 * Valide puis upload une image vers un bucket Supabase Storage PUBLIC (écriture réservée aux
 * admins par RLS) et renvoie son URL publique. Mutualisé entre les images de leçon
 * (utils/lesson-image-storage.ts) et de couverture de cours (utils/course-image-storage.ts).
 */
export async function uploadPublicImage(bucket: string, file: File): Promise<string> {
    validateImageFile(file);

    const supabase = createClient();
    const extension = file.name.split(".").pop()?.toLowerCase() || "png";
    const path = `${crypto.randomUUID()}.${extension}`;

    const { error } = await supabase.storage.from(bucket).upload(path, file, { contentType: file.type });
    if (error) throw error;

    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
}

/**
 * Supprime une image d'un bucket à partir de son URL publique. Sans effet si l'URL n'est pas
 * issue de ce bucket (ex. une ancienne URL externe collée à la main) : on ne tente rien.
 */
export async function deletePublicImage(bucket: string, url: string): Promise<void> {
    const marker = `/object/public/${bucket}/`;
    const markerIndex = url.indexOf(marker);
    if (markerIndex === -1) return;

    const path = decodeURIComponent(url.slice(markerIndex + marker.length));
    const supabase = createClient();
    const { error } = await supabase.storage.from(bucket).remove([path]);
    if (error) throw error;
}
