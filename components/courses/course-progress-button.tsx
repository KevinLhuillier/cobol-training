"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CourseProgressButtonProps {
    courseId: string;
    chapterId: string;
    lessonId: string;
    isCompleted: boolean;
    nextLessonId?: string;
}

export function CourseProgressButton({ courseId, chapterId, lessonId, isCompleted, nextLessonId }: CourseProgressButtonProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const onClick = async () => {
        try {
            setIsLoading(true);

            const response = await fetch(`/api/courses/${courseId}/chapters/${chapterId}/lessons/${lessonId}/progress`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isCompleted: !isCompleted })
            });

            if (!response.ok) throw new Error("Erreur de mise à jour");

            if (!isCompleted && nextLessonId) {
                router.push(`/dashboard/courses/${courseId}?lessonId=${nextLessonId}`);
            } else {
                // Sinon (on a annulé, ou c'est la toute dernière leçon du cours)
                router.refresh();
            }
        } catch (error) {
            alert("Une erreur est survenue.");
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
            {isCompleted ? "Marquer comme non terminé" : "Valider la leçon"}
        </Button>
    );
}