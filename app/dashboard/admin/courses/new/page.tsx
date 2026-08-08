"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
// 🟢 Import du client Supabase
import { createClient } from "@/utils/supabase/client";

export default function NewCoursePage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    // Initialisation du client Supabase
    const supabase = createClient();

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsLoading(true);
        setError("");

        const formData = new FormData(event.currentTarget);
        const title = formData.get("title") as string;
        const description = formData.get("description") as string;
        const imageUrl = formData.get("imageUrl") as string;

        try {
            // 🟢 Insertion directe et sécurisée dans Supabase
            // Le RLS vérifie automatiquement si l'utilisateur est Admin
            const { error: insertError } = await supabase
                .from("courses")
                .insert({
                    title,
                    description: description || null, // Gestion des champs vides
                    image_url: imageUrl || null,      // Conversion en snake_case pour Postgres
                    is_published: false               // Brouillon par défaut
                });

            if (insertError) {
                console.error("Supabase Insert Error:", insertError);
                throw new Error(insertError.message || "Failed to create course");
            }

            // Redirection vers le dashboard admin après succès
            router.push("/dashboard/admin");
            router.refresh(); // Force le rafraîchissement des données

        } catch (err) {
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
                        href="/dashboard/admin"
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

                        {/* IMAGE URL */}
                        <div className="space-y-2">
                            <label htmlFor="imageUrl" className="text-sm font-bold text-slate-900">
                                Cover Image URL
                            </label>
                            <input
                                id="imageUrl"
                                name="imageUrl"
                                type="url"
                                placeholder="https://example.com/image.png"
                                className="text-slate-900 w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all outline-none"
                            />
                            <p className="text-xs text-slate-500 font-medium">
                                You can leave this blank for now and add an image later.
                            </p>
                        </div>

                        {/* SUBMIT BUTTON */}
                        <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                            <Link
                                href="/dashboard/admin"
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