"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
// 🟢 Import du client Supabase
import { createClient } from "@/utils/supabase/client";

interface CourseProgressButtonProps {
    courseId: string;
    chapterId: string;
    lessonId: string;
    isCompleted: boolean;
    nextLessonId?: string;
}

export function CourseProgressButton({ courseId, chapterId, lessonId, isCompleted, nextLessonId }: CourseProgressButtonProps) {
    const router = useRouter();
    const supabase = createClient();
    const [isLoading, setIsLoading] = useState(false);

    const onClick = async () => {
        try {
            setIsLoading(true);

            // 1. Récupérer l'utilisateur connecté
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                throw new Error("You must be logged in to update progress.");
            }

            // 2. Upsert (Insertion ou Mise à jour) dans la table lesson_progress
            const { error: upsertError } = await supabase
                .from("lesson_progress")
                .upsert({
                    lesson_id: lessonId,
                    user_id: user.id,
                    is_completed: !isCompleted // Bascule le statut actuel
                }, {
                    onConflict: "user_id, lesson_id" // Clé unique composant la contrainte
                });

            if (upsertError) {
                console.error("Progress update error:", upsertError);
                throw new Error("Failed to update lesson progress.");
            }

            // 3. Navigation
            if (!isCompleted && nextLessonId) {
                // Si on vient de valider et qu'il y a une suite -> Leçon suivante
                router.push(`/dashboard/courses/${courseId}?lessonId=${nextLessonId}`);
            } else {
                // Sinon (on a annulé, ou c'est la toute dernière leçon) -> Rafraîchissement
                router.refresh();
            }
        } catch (error) {
            console.error("Progress error:", error);
            alert("An error occurred while updating your progress.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button
            onClick={onClick}
            disabled={isLoading}
            size="lg"
            className={`shrink-0 rounded-xl shadow-md transition-colors ${
                isCompleted
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                    : "bg-slate-900 hover:bg-slate-800 text-white"
            }`}
        >
            {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : isCompleted ? (
                <X className="mr-2 h-4 w-4" />
            ) : (
                <Check className="mr-2 h-4 w-4" />
            )}
            {isCompleted ? "Mark as uncompleted" : "Complete Lesson"}
        </Button>
    );
}