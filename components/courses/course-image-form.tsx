"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2, Upload, Image as ImageIcon } from "lucide-react";
// 🟢 Import du client Supabase
import { createClient } from "@/utils/supabase/client";
import { deleteCourseImage, uploadCourseImage } from "@/utils/course-image-storage";
import { IMAGE_ACCEPT } from "@/utils/public-image-storage";

interface CourseImageFormProps {
    initialData: { imageUrl: string | null };
    courseId: string;
}

export function CourseImageForm({ initialData, courseId }: CourseImageFormProps) {
    const router = useRouter();
    const supabase = createClient();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(initialData.imageUrl || null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const saveImageUrl = async (newUrl: string | null) => {
        const { error: updateError } = await supabase
            .from("courses")
            .update({ image_url: newUrl })
            .eq("id", courseId);
        if (updateError) throw updateError;
    };

    // Un échec de nettoyage ne doit jamais bloquer l'admin : le fichier est juste orphelin.
    const discardFile = (url: string) => {
        deleteCourseImage(url).catch((err) => console.error("Course image cleanup failed:", err));
    };

    const onFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        e.target.value = ""; // permet de re-sélectionner le même fichier juste après une erreur
        if (!file) return;

        setIsLoading(true);
        setError(null);
        try {
            // 1. Upload dans le bucket S3 "course-images" (le fichier précédent reste en place)
            const newUrl = await uploadCourseImage(file);

            // 2. Référence dans la base — si elle échoue, on retire le fichier tout juste envoyé
            try {
                await saveImageUrl(newUrl);
            } catch (err) {
                discardFile(newUrl);
                throw err;
            }

            // 3. Seulement maintenant, on supprime l'ancien fichier (ignoré si c'était une URL externe)
            if (imageUrl) discardFile(imageUrl);

            setImageUrl(newUrl);
            router.refresh();
        } catch (err) {
            console.error("Course image upload error:", err);
            setError(err instanceof Error ? err.message : "Something went wrong while uploading the image.");
        } finally {
            setIsLoading(false);
        }
    };

    const onRemove = async () => {
        if (!imageUrl || !window.confirm("Remove the course image?")) return;

        setIsLoading(true);
        setError(null);
        try {
            await saveImageUrl(null);
            discardFile(imageUrl);
            setImageUrl(null);
            router.refresh();
        } catch (err) {
            console.error("Course image removal error:", err);
            setError("An error occurred while removing the course image.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-lg">
                    <div className="h-8 w-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                        <ImageIcon className="h-4 w-4" />
                    </div>
                    Course Image
                </div>
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept={IMAGE_ACCEPT}
                onChange={onFileSelected}
                className="hidden"
            />

            {imageUrl ? (
                <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imageUrl} alt="Course cover" className="w-full h-full object-cover" />

                    <div className="absolute top-2 right-2 flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isLoading}
                            className="h-8 px-3 rounded-lg bg-white/90 backdrop-blur text-xs font-bold text-slate-700 hover:bg-white shadow-sm flex items-center gap-1.5 disabled:opacity-60"
                        >
                            <Upload className="h-3.5 w-3.5" />
                            Replace
                        </button>
                        <button
                            type="button"
                            onClick={onRemove}
                            disabled={isLoading}
                            title="Remove image"
                            className="h-8 w-8 rounded-lg bg-white/90 backdrop-blur text-slate-500 hover:text-red-600 hover:bg-white shadow-sm flex items-center justify-center disabled:opacity-60"
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                        </button>
                    </div>

                    {isLoading && (
                        <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                            <Loader2 className="h-6 w-6 text-slate-500 animate-spin" />
                        </div>
                    )}
                </div>
            ) : (
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading}
                    className="aspect-video w-full rounded-xl bg-slate-50 border-2 border-dashed border-slate-200 hover:bg-slate-100 hover:border-slate-300 transition-colors flex flex-col items-center justify-center text-slate-400 disabled:opacity-60"
                >
                    {isLoading ? (
                        <Loader2 className="h-8 w-8 animate-spin" />
                    ) : (
                        <>
                            <ImageIcon className="h-8 w-8 mb-2 opacity-50" />
                            <p className="text-sm font-medium text-slate-500">Click to upload an image</p>
                            <p className="text-xs mt-1">PNG, JPEG, WEBP or GIF — 8MB max</p>
                        </>
                    )}
                </button>
            )}

            {error && <p className="text-xs text-red-500 font-medium mt-3">{error}</p>}
        </div>
    );
}
