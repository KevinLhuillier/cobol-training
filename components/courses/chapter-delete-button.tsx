"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";

interface ChapterDeleteButtonProps {
    courseId: string;
    chapterId: string;
    chapterTitle: string;
}

export function ChapterDeleteButton({ courseId, chapterId, chapterTitle }: ChapterDeleteButtonProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const onDelete = async () => {
        // Confirmation simple pour éviter les suppressions accidentelles
        const isConfirmed = window.confirm(
            `Êtes-vous sûr de vouloir supprimer le chapitre "${chapterTitle}" et toutes ses leçons ? Cette action est irréversible.`
        );

        if (!isConfirmed) return;

        try {
            setIsLoading(true);
            const response = await fetch(`/api/admin/courses/${courseId}/chapters/${chapterId}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error("Failed to delete chapter");
            }

            router.refresh(); // Rafraîchit la page pour faire disparaître le chapitre
        } catch (error) {
            alert("Une erreur est survenue lors de la suppression.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={onDelete}
            disabled={isLoading}
            title="Delete Chapter"
            className="p-1.5 text-slate-400 hover:text-red-600 transition-colors rounded-md hover:bg-red-50 disabled:opacity-50 flex items-center justify-center"
        >
            {isLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
                <Trash2 className="h-3.5 w-3.5" />
            )}
        </button>
    );
}