"use client";

import { deletePublicImage, uploadPublicImage } from "@/utils/public-image-storage";

const COURSE_IMAGES_BUCKET = "course-images";

/**
 * Upload l'image de couverture d'un cours vers le bucket Supabase Storage "course-images"
 * (public, écriture réservée aux admins par RLS — cf. la migration add_course_images_bucket)
 * et renvoie son URL publique, à stocker dans courses.image_url.
 */
export function uploadCourseImage(file: File): Promise<string> {
    return uploadPublicImage(COURSE_IMAGES_BUCKET, file);
}

/**
 * Supprime l'image de couverture d'un cours du bucket "course-images" à partir de son URL
 * publique. Sans effet pour une ancienne URL externe (non issue du bucket).
 */
export function deleteCourseImage(url: string): Promise<void> {
    return deletePublicImage(COURSE_IMAGES_BUCKET, url);
}
