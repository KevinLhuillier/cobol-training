"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";
// 🟢 Import du client Supabase
import { createClient } from "@/utils/supabase/client";

interface LessonFormProps {
    courseId: string;
    chapterId: string;
}

export default function LessonForm({ courseId, chapterId }: LessonFormProps) {
    const router = useRouter();
    const supabase = createClient();
    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const toggleEdit = () => setIsEditing((prev) => !prev);

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim()) return;

        try {
            setIsLoading(true);

            // 1. Trouver la position de la dernière leçon du chapitre
            const { data: lastLesson } = await supabase
                .from("lessons")
                .select("position")
                .eq("chapter_id", chapterId)
                .order("position", { ascending: false })
                .limit(1)
                .single();

            const newPosition = lastLesson ? lastLesson.position + 1 : 1;

            // 2. Insérer la nouvelle leçon avec Supabase
            const { error: insertError } = await supabase
                .from("lessons")
                .insert({
                    title: title.trim(),
                    chapter_id: chapterId,
                    position: newPosition,
                    is_free_preview: false
                });

            if (insertError) throw insertError;

            // Réinitialisation et fermeture du formulaire
            setTitle("");
            toggleEdit();

            // Force Next.js à rafraîchir les données du serveur
            router.refresh();
        } catch (error) {
            console.error("Error creating lesson:", error);
            alert("An error occurred while creating the lesson.");
        } finally {
            setIsLoading(false);
        }
    };

    if (isEditing) {
        return (
            <form onSubmit={onSubmit} className="space-y-4 mt-4 w-full">
                <input
                    disabled={isLoading}
                    type="text"
                    placeholder="e.g. 'Introduction to the course'"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 disabled:opacity-50"
                    required
                />
                <div className="flex items-center gap-x-2">
                    <button
                        disabled={isLoading || !title.trim()}
                        type="submit"
                        className="inline-flex items-center justify-center bg-slate-900 hover:bg-slate-800 text-white rounded-xl h-9 px-4 text-sm font-bold transition-colors disabled:opacity-50"
                    >
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create"}
                    </button>
                    <button
                        disabled={isLoading}
                        type="button"
                        onClick={toggleEdit}
                        className="inline-flex items-center justify-center bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl h-9 px-4 text-sm font-medium transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        );
    }

    return (
        <button
            onClick={toggleEdit}
            className="inline-flex items-center justify-center bg-slate-50 hover:bg-slate-100 text-slate-900 rounded-xl h-9 px-4 text-sm font-bold transition-colors shrink-0"
        >
            <Plus className="mr-2 h-4 w-4" />
            Add Lesson
        </button>
    );
}