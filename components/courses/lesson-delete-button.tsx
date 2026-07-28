"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";

interface LessonDeleteButtonProps {
    courseId: string;
    chapterId: string;
    lessonId: string;
    lessonTitle: string;
}

export function LessonDeleteButton({ courseId, chapterId, lessonId, lessonTitle }: LessonDeleteButtonProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const onDelete = async () => {
        if (!window.confirm(`Supprimer la leçon "${lessonTitle}" ? Action irréversible.`)) return;

        try {
            setIsLoading(true);
            const response = await fetch(`/api/admin/courses/${courseId}/chapters/${chapterId}/lessons/${lessonId}`, {
                method: "DELETE",
            });

            if (!response.ok) throw new Error("Failed to delete lesson");

            router.refresh();
        } catch (error) {
            alert("Une erreur est survenue.");
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