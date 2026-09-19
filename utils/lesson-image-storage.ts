"use client";

import { deletePublicImage, uploadPublicImage } from "@/utils/public-image-storage";

const LESSON_IMAGES_BUCKET = "lesson-images";

/**
 * Upload une image de bloc de leçon vers le bucket Supabase Storage "lesson-images" (public,
 * écriture réservée aux admins par RLS — cf. la migration add_lesson_content_blocks) et
 * renvoie son URL publique.
 */
export function uploadLessonImage(file: File): Promise<string> {
    return uploadPublicImage(LESSON_IMAGES_BUCKET, file);
}

/**
 * Supprime une image du bucket "lesson-images" à partir de son URL publique — appelé quand un
 * bloc image est supprimé ou son image remplacée (cf. lesson-builder.tsx), pour ne pas laisser
 * de fichiers orphelins dans le bucket.
 */
export function deleteLessonImage(url: string): Promise<void> {
    return deletePublicImage(LESSON_IMAGES_BUCKET, url);
}
