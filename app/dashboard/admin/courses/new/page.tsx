"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Save, Loader2, Image as ImageIcon, Upload, X, ChevronLeft } from "lucide-react";
// 🟢 Import du client Supabase
import { createClient } from "@/utils/supabase/client";
import { deleteCourseImage, uploadCourseImage } from "@/utils/course-image-storage";
import { IMAGE_ACCEPT, validateImageFile } from "@/utils/public-image-storage";
import { COURSE_KIND_OPTIONS, type CourseKind } from "@/components/courses/course-kind";

export default function NewCoursePage() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    // Course -> menu "Courses", Project -> menu "Projects" (même structure chapitres/leçons)
    const [kind, setKind] = useState<CourseKind>("COURSE");
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
                    kind,
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
        <div className="font-sans">
            <div className="max-w-3xl mx-auto">

                {/* Header */}
                <div className="mb-8 flex items-center gap-4">
                    <div>
<Link href="/dashboard/admin/courses" className="inline-flex items-center gap-1 text-[13px] font-semibold text-ui-accent hover:underline mb-2"><ChevronLeft className="h-4 w-4" />Courses</Link>
                        <h1 className="text-2xl md:text-[26px] font-bold text-slate-900 tracking-tight">
                            Create a new course or project
                        </h1>
                        <p className="mt-1 text-sm text-ui-muted">
                            Start by choosing its type, then give it a title and a basic description.
                        </p>
                    </div>
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-xl border border-ui-line p-8">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg text-sm font-medium border border-red-100">
                            {error}
                        </div>
                    )}

                    <form onSubmit={onSubmit} className="space-y-6">
                        {/* TYPE */}
                        <div className="space-y-2">
                            <span className="text-[13px] font-semibold text-slate-900">Type</span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {COURSE_KIND_OPTIONS.map((option) => (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => setKind(option.value)}
                                        disabled={isLoading}
                                        aria-pressed={kind === option.value}
                                        className={`text-left p-4 rounded-lg border transition-all ${
                                            kind === option.value
                                                ? "border-slate-900 bg-ui-ink text-white"
                                                : "border-ui-line bg-slate-50 text-slate-900 hover:bg-slate-100"
                                        }`}
                                    >
                                        <p className="font-bold text-sm">{option.label}</p>
                                        <p className={`text-xs mt-0.5 ${kind === option.value ? "text-slate-300" : "text-slate-500"}`}>
                                            {option.description}
                                        </p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* TITLE */}
                        <div className="space-y-2">
                            <label htmlFor="title" className="text-[13px] font-semibold text-slate-900">
                                Title <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="title"
                                name="title"
                                type="text"
                                required
                                placeholder="e.g., Advanced COBOL Debugging"
                                className="text-slate-900 w-full h-11 px-4 rounded-lg border border-ui-line-strong bg-white focus:ring-2 focus:ring-ui-accent/30 focus:border-ui-accent transition-all outline-none"
                            />
                        </div>

                        {/* DESCRIPTION */}
                        <div className="space-y-2">
                            <label htmlFor="description" className="text-[13px] font-semibold text-slate-900">
                                Description
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                rows={4}
                                placeholder="What will the students learn in this course?"
                                className="text-slate-900 w-full p-4 rounded-lg border border-ui-line-strong bg-white focus:ring-2 focus:ring-ui-accent/30 focus:border-ui-accent transition-all outline-none resize-none"
                            />
                        </div>

                        {/* COVER IMAGE */}
                        <div className="space-y-2">
                            <span className="text-[13px] font-semibold text-slate-900">Cover Image</span>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept={IMAGE_ACCEPT}
                                onChange={onFileSelected}
                                className="hidden"
                            />
                            {previewUrl ? (
                                <div className="relative aspect-video w-full max-w-md rounded-lg overflow-hidden bg-slate-100 border border-ui-line">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={previewUrl} alt="Cover preview" className="w-full h-full object-cover" />
                                    <div className="absolute top-2 right-2 flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={isLoading}
                                            className="h-8 px-3 rounded-lg bg-white/90 backdrop-blur text-xs font-bold text-slate-700 hover:bg-white flex items-center gap-1.5 disabled:opacity-60"
                                        >
                                            <Upload className="h-3.5 w-3.5" />
                                            Replace
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setImageFile(null)}
                                            disabled={isLoading}
                                            title="Remove image"
                                            className="h-8 w-8 rounded-lg bg-white/90 backdrop-blur text-slate-500 hover:text-red-600 hover:bg-white flex items-center justify-center disabled:opacity-60"
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
                                    className="aspect-video w-full max-w-md rounded-lg bg-slate-50 border-2 border-dashed border-ui-line hover:bg-slate-100 hover:border-slate-300 transition-colors flex flex-col items-center justify-center text-slate-400 disabled:opacity-60"
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
                        <div className="pt-4 flex items-center justify-end gap-3 border-t border-ui-line">
                            <Link
                                href="/dashboard/admin/courses"
                                className="px-6 h-12 rounded-lg font-bold text-slate-600 hover:bg-slate-100 transition-colors flex items-center justify-center"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="px-6 h-12 rounded-lg font-bold text-white bg-ui-ink hover:bg-ui-ink-hover transition-colors flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <>
                                        <Save className="h-4 w-4 mr-2" />
                                        {kind === "PROJECT" ? "Create Project" : "Create Course"}
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