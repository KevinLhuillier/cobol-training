"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface ChapterDeleteButtonProps {
    courseId: string;
    chapterId: string;
    chapterTitle: string;
}

export function ChapterDeleteButton({ courseId, chapterId, chapterTitle }: ChapterDeleteButtonProps) {
    const router = useRouter();
    const supabase = createClient();
    const [isLoading, setIsLoading] = useState(false);

    const onDelete = async () => {
        const isConfirmed = window.confirm(
            `Are you sure you want to delete the chapter "${chapterTitle}" and all its lessons? This action cannot be undone.`
        );

        if (!isConfirmed) return;

        try {
            setIsLoading(true);

            // 1. Suppression du chapitre
            const { error: deleteError } = await supabase
                .from("chapters")
                .delete()
                .eq("id", chapterId)
                .eq("course_id", courseId);

            if (deleteError) throw deleteError;

            // 2. Récupération des chapitres restants, triés par leur ancienne position
            const { data: remainingChapters, error: fetchError } = await supabase
                .from("chapters")
                .select("id, position")
                .eq("course_id", courseId)
                .order("position", { ascending: true });

            if (fetchError) throw fetchError;

            // 3. Recalcul des positions s'il reste des chapitres
            if (remainingChapters && remainingChapters.length > 0) {
                // On prépare un tableau de requêtes d'update
                const updatePromises = remainingChapters.map((chapter, index) => {
                    const expectedPosition = index + 1;

                    // On ne fait une requête QUE si la position doit être corrigée
                    if (chapter.position !== expectedPosition) {
                        return supabase
                            .from("chapters")
                            .update({ position: expectedPosition })
                            .eq("id", chapter.id);
                    }
                    return null;
                }).filter(Boolean); // Retire les valeurs "null"

                // On exécute toutes les mises à jour en parallèle pour la rapidité
                if (updatePromises.length > 0) {
                    await Promise.all(updatePromises);
                }
            }

            // Rafraîchit l'interface utilisateur
            router.refresh();
        } catch (error) {
            console.error("Delete error:", error);
            alert("An error occurred while deleting the chapter and updating positions.");
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