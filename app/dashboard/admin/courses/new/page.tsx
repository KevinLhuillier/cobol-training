"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Loader2, Image as ImageIcon, Upload, X } from "lucide-react";
// 🟢 Import du client Supabase
import { createClient } from "@/utils/supabase/client";
import { deleteCourseImage, uploadCourseImage } from "@/utils/course-image-storage";
import { IMAGE_ACCEPT, validateImageFile } from "@/utils/public-image-storage";

export default function NewCoursePage() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    // L'image n'est envoyée sur S3 qu'à la soumission (pas de fichier orphelin si l'admin abandonne)
    const [imageFile, setImageFile] = useState<File | null>(null);
    const previewUrl = useMemo(() => (imageFile ? URL.createObjectURL(imageFile) : null), [imageFile]);

    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
        };
    }, [previewUrl]);

    // Initialisation du client Supabase
    const supabase = createClient();

    function onFileSelected(event: React.ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        event.target.value = ""; // permet de re-sélectionner le même fichier juste après une erreur
        if (!file) return;

        try {
            validateImageFile(file);
            setError("");
            setImageFile(file);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Invalid image");
        }
    }

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsLoading(true);
        setError("");

        const formData = new FormData(event.currentTarget);
        const title = formData.get("title") as string;
        const description = formData.get("description") as string;
        let imageUrl: string | null = null;

        try {
            // 0. Upload de l'image de couverture (si fournie) dans le bucket S3 "course-images"
            if (imageFile) {
                imageUrl = await uploadCourseImage(imageFile);
            }

            // 1. Trouver la position du dernier cours pour placer le nouveau à la fin
            const { data: lastCourse } = await supabase
                .from("courses")
                .select("position")
                .order("position", { ascending: false })
                .limit(1)
                .single();

            const newPosition = lastCourse ? lastCourse.position + 1 : 0;

            // 2. 🟢 Insertion directe et sécurisée dans Supabase
            // Le RLS vérifie automatiquement si l'utilisateur est Admin
            const { error: insertError } = await supabase
                .from("courses")
                .insert({
                    title,
                    description: description || null, // Gestion des champs vides
                    image_url: imageUrl,              // Conversion en snake_case pour Postgres
                    is_published: false,              // Brouillon par défaut
                    position: newPosition
                });

            if (insertError) {
                console.error("Supabase Insert Error:", insertError);
                throw new Error(insertError.message || "Failed to create course");
            }

            // Redirection vers la liste des cours après succès
            router.push("/dashboard/admin/courses");
            router.refresh(); // Force le rafraîchissement des données

        } catch (err) {
            // Le cours n'a pas été créé : on ne laisse pas l'image envoyée traîner dans le bucket
            if (imageUrl) {
                deleteCourseImage(imageUrl).catch((cleanupErr) =>
                    console.error("Course image cleanup failed:", cleanupErr)
                );
            }
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("An unknown error occurred");
            }
            setIsLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans p-4 md:p-6 lg:p-8">
            <div className="max-w-3xl mx-auto">

                {/* Header */}
                <div className="mb-8 flex items-center gap-4">
                    <Link
                        href="/dashboard/admin/courses"
                        className="h-10 w-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-sm"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                            Create a new course
                        </h1>
                        <p className="text-sm text-slate-500">
                            Start by giving your course a title and a basic description.
                        </p>
                    </div>
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100">
                            {error}
                        </div>
                    )}

                    <form onSubmit={onSubmit} className="space-y-6">
                        {/* TITLE */}
                        <div className="space-y-2">
                            <label htmlFor="title" className="text-sm font-bold text-slate-900">
                                Course Title <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="title"
                                name="title"
                                type="text"
                                required
                                placeholder="e.g., Advanced COBOL Debugging"
                                className="text-slate-900 w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all outline-none"
                            />
                        </div>

                        {/* DESCRIPTION */}
                        <div className="space-y-2">
                            <label htmlFor="description" className="text-sm font-bold text-slate-900">
                                Description
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                rows={4}
                                placeholder="What will the students learn in this course?"
                                className="text-slate-900 w-full p-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all outline-none resize-none"
                            />
                        </div>

                        {/* COVER IMAGE */}
                        <div className="space-y-2">
                            <span className="text-sm font-bold text-slate-900">Cover Image</span>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept={IMAGE_ACCEPT}
                                onChange={onFileSelected}
                                className="hidden"
                            />
                            {previewUrl ? (
                                <div className="relative aspect-video w-full max-w-md rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={previewUrl} alt="Cover preview" className="w-full h-full object-cover" />
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
                                            onClick={() => setImageFile(null)}
                                            disabled={isLoading}
                                            title="Remove image"
                                            className="h-8 w-8 rounded-lg bg-white/90 backdrop-blur text-slate-500 hover:text-red-600 hover:bg-white shadow-sm flex items-center justify-center disabled:opacity-60"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isLoading}
                                    className="aspect-video w-full max-w-md rounded-xl bg-slate-50 border-2 border-dashed border-slate-200 hover:bg-slate-100 hover:border-slate-300 transition-colors flex flex-col items-center justify-center text-slate-400 disabled:opacity-60"
                                >
                                    <ImageIcon className="h-8 w-8 mb-2 opacity-50" />
                                    <p className="text-sm font-medium text-slate-500">Click to upload an image</p>
                                    <p className="text-xs mt-1">PNG, JPEG, WEBP or GIF — 8MB max</p>
                                </button>
                            )}
                            <p className="text-xs text-slate-500 font-medium">
                                You can leave this blank for now and add an image later.
                            </p>
                        </div>

                        {/* SUBMIT BUTTON */}
                        <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                            <Link
                                href="/dashboard/admin/courses"
                                className="px-6 h-12 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors flex items-center justify-center"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="px-6 h-12 rounded-xl font-bold text-white bg-slate-900 hover:bg-slate-800 transition-colors flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
                            >
                                {isLoading ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <>
                                        <Save className="h-4 w-4 mr-2" />
                                        Create Course
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

            </div>
        </div>
    );
}