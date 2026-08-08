"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";
// 🟢 Import du client Supabase
import { createClient } from "@/utils/supabase/client";

interface LessonDeleteButtonProps {
    courseId: string;
    chapterId: string;
    lessonId: string;
    lessonTitle: string;
}

export function LessonDeleteButton({ courseId, chapterId, lessonId, lessonTitle }: LessonDeleteButtonProps) {
    const router = useRouter();
    const supabase = createClient();
    const [isLoading, setIsLoading] = useState(false);

    const onDelete = async () => {
        // Traduction en anglais du message d'alerte
        if (!window.confirm(`Are you sure you want to delete the lesson "${lessonTitle}"? This action cannot be undone.`)) return;

        try {
            setIsLoading(true);

            // 1. Suppression de la leçon
            const { error: deleteError } = await supabase
                .from("lessons")
                .delete()
                .eq("id", lessonId)
                .eq("chapter_id", chapterId); // On ajoute le chapter_id par sécurité

            if (deleteError) throw deleteError;

            // 2. Récupération des leçons restantes du chapitre, triées par ancienne position
            const { data: remainingLessons, error: fetchError } = await supabase
                .from("lessons")
                .select("id, position")
                .eq("chapter_id", chapterId)
                .order("position", { ascending: true });

            if (fetchError) throw fetchError;

            // 3. Recalcul des positions
            if (remainingLessons && remainingLessons.length > 0) {
                const updatePromises = remainingLessons.map((lesson, index) => {
                    const expectedPosition = index + 1;
                    if (lesson.position !== expectedPosition) {
                        return supabase
                            .from("lessons")
                            .update({ position: expectedPosition })
                            .eq("id", lesson.id);
                    }
                    return null;
                }).filter(Boolean);

                if (updatePromises.length > 0) {
                    await Promise.all(updatePromises);
                }
            }

            router.refresh();
        } catch (error) {
            console.error("Lesson delete error:", error);
            alert("An error occurred while deleting the lesson.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={onDelete}
            disabled={isLoading}
            title="Delete Lesson"
            className="p-1.5 text-slate-400 hover:text-red-600 transition-colors rounded-md hover:bg-red-50 disabled:opacity-50 flex items-center justify-center"
        >
            {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
        </button>
    );
}