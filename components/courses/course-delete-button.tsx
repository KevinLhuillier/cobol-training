"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface CourseDeleteButtonProps {
    courseId: string;
    courseTitle: string;
}

export function CourseDeleteButton({ courseId, courseTitle }: CourseDeleteButtonProps) {
    const router = useRouter();
    const supabase = createClient();
    const [isLoading, setIsLoading] = useState(false);

    const onDelete = async () => {
        const isConfirmed = window.confirm(
            `Are you sure you want to delete the course "${courseTitle}" and all its chapters and lessons? This action cannot be undone.`
        );

        if (!isConfirmed) return;

        try {
            setIsLoading(true);

            // 1. Suppression du cours (chapitres, leçons et progressions supprimés en cascade — ON DELETE CASCADE)
            const { error: deleteError } = await supabase
                .from("courses")
                .delete()
                .eq("id", courseId);

            if (deleteError) throw deleteError;

            // 2. Récupération des cours restants, triés par leur ancienne position
            const { data: remainingCourses, error: fetchError } = await supabase
                .from("courses")
                .select("id, position")
                .order("position", { ascending: true });

            if (fetchError) throw fetchError;

            // 3. Recalcul des positions (0-based, comme posé par le seed) s'il reste des cours
            if (remainingCourses && remainingCourses.length > 0) {
                const updatePromises = remainingCourses
                    .map((course, index) => {
                        if (course.position !== index) {
                            return supabase.from("courses").update({ position: index }).eq("id", course.id);
                        }
                        return null;
                    })
                    .filter(Boolean);

                if (updatePromises.length > 0) {
                    await Promise.all(updatePromises);
                }
            }

            router.refresh();
        } catch (error) {
            console.error("Delete error:", error);
            alert("An error occurred while deleting the course.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={onDelete}
            disabled={isLoading}
            title="Delete course"
            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
        >
            {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
                <Trash2 className="h-4 w-4" />
            )}
        </button>
    );
}
