"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Loader2, X } from "lucide-react";
// 🟢 Import du client Supabase
import { createClient } from "@/utils/supabase/client";

interface CourseDetailsFormProps {
    initialData: {
        title: string;
        description: string | null;
    };
    courseId: string;
}

export function CourseDetailsForm({ initialData, courseId }: CourseDetailsFormProps) {
    const router = useRouter();
    const supabase = createClient();
    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState(initialData.title);
    const [description, setDescription] = useState(initialData.description || "");
    const [isLoading, setIsLoading] = useState(false);

    const toggleEdit = () => {
        setIsEditing((prev) => !prev);
        setTitle(initialData.title); // Réinitialise si on annule
        setDescription(initialData.description || "");
    };

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        if (title === initialData.title && description === (initialData.description || "")) {
            return toggleEdit();
        }

        try {
            setIsLoading(true);

            // 🟢 Mise à jour directe et sécurisée dans Supabase
            const { error } = await supabase
                .from("courses")
                .update({
                    title: title.trim(),
                    description: description.trim() || null
                })
                .eq("id", courseId);

            if (error) throw error;

            setIsEditing(false);
            router.refresh();
        } catch (error) {
            console.error("Course details update error:", error);
            alert("An error occurred while updating the course details.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-lg">
                    <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                        <Pencil className="h-4 w-4" />
                    </div>
                    Customize your course
                </div>
                {!isEditing && (
                    <button
                        onClick={toggleEdit}
                        className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
                    >
                        <Pencil className="h-4 w-4" />
                    </button>
                )}
            </div>

            {isEditing ? (
                <form onSubmit={onSubmit} className="space-y-4">
                    <div className="space-y-1">
                        <label htmlFor="course-title" className="text-sm font-bold text-slate-500">
                            Course Title
                        </label>
                        <input
                            id="course-title"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            disabled={isLoading}
                            className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none text-slate-900 text-sm font-medium"
                            autoFocus
                        />
                    </div>

                    <div className="space-y-1">
                        <label htmlFor="course-description" className="text-sm font-bold text-slate-500">
                            Description
                        </label>
                        <textarea
                            id="course-description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            disabled={isLoading}
                            rows={4}
                            className="w-full p-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none text-slate-900 text-sm resize-none"
                        />
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2">
                        <button
                            type="button"
                            onClick={toggleEdit}
                            disabled={isLoading}
                            className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading || !title.trim()}
                            className="h-9 px-4 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 disabled:opacity-50 flex items-center"
                        >
                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
                        </button>
                    </div>
                </form>
            ) : (
                <div className="space-y-4">
                    <div>
                        <p className="text-sm font-bold text-slate-500 mb-1">Course Title</p>
                        <p className="text-slate-900 font-medium">{initialData.title}</p>
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-500 mb-1">Description</p>
                        <p className="text-slate-700 text-sm leading-relaxed">
                            {initialData.description || <span className="text-slate-400 italic">No description provided.</span>}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
