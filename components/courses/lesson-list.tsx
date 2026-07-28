"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Pencil, ChevronUp, ChevronDown, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { LessonDeleteButton } from "./lesson-delete-button";

interface LessonListProps {
    courseId: string;
    chapterId: string;
    items: {
        id: string;
        title: string;
        position: number;
        isFreePreview?: boolean;
    }[];
}

export function LessonList({ courseId, chapterId, items }: LessonListProps) {
    const router = useRouter();
    const [isUpdating, setIsUpdating] = useState(false);

    const onMove = async (currentIndex: number, direction: "up" | "down") => {
        if (direction === "up" && currentIndex === 0) return;
        if (direction === "down" && currentIndex === items.length - 1) return;

        const itemToMove = items[currentIndex];
        const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
        const targetItem = items[targetIndex];

        const bulkUpdateData = [
            { id: itemToMove.id, position: targetItem.position },
            { id: targetItem.id, position: itemToMove.position }
        ];

        try {
            setIsUpdating(true);
            const response = await fetch(`/api/admin/courses/${courseId}/chapters/${chapterId}/lessons/reorder`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ list: bulkUpdateData })
            });

            if (!response.ok) throw new Error("Failed to reorder");
            router.refresh();
        } catch (error) {
            alert("Erreur lors de la réorganisation.");
        } finally {
            setIsUpdating(false);
        }
    };

    if (items.length === 0) {
        return (
            <p className="text-sm text-slate-500 italic text-center py-6">
                No lessons yet. Add a video or text lesson to get started.
            </p>
        );
    }

    return (
        <div className="space-y-3 mt-4 relative">
            {isUpdating && (
                <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center rounded-xl">
                    <Loader2 className="h-6 w-6 animate-spin text-slate-900" />
                </div>
            )}

            {items.map((lesson, index) => (
                <div key={lesson.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 group">
                    <div className="flex items-center gap-3">
                        <div className="flex flex-col gap-0.5">
                            <button onClick={() => onMove(index, "up")} disabled={index === 0 || isUpdating} className="p-0.5 text-slate-400 hover:text-slate-900 disabled:opacity-30 disabled:hover:text-slate-400 transition-colors rounded-sm hover:bg-slate-200">
                                <ChevronUp className="h-4 w-4" />
                            </button>
                            <button onClick={() => onMove(index, "down")} disabled={index === items.length - 1 || isUpdating} className="p-0.5 text-slate-400 hover:text-slate-900 disabled:opacity-30 disabled:hover:text-slate-400 transition-colors rounded-sm hover:bg-slate-200">
                                <ChevronDown className="h-4 w-4" />
                            </button>
                        </div>
                        <span className="font-bold text-slate-900 text-sm">{lesson.title}</span>
                    </div>

                    <div className="flex items-center gap-3">
                        {lesson.isFreePreview && (
                            <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 border-none">Free Preview</Badge>
                        )}
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Link href={`/admin/courses/${courseId}/chapters/${chapterId}/lessons/${lesson.id}`} className="p-1.5 text-slate-400 hover:text-slate-900 transition-colors rounded-md hover:bg-slate-200" title="Edit Lesson">
                                <Pencil className="h-3.5 w-3.5" />
                            </Link>
                            <LessonDeleteButton courseId={courseId} chapterId={chapterId} lessonId={lesson.id} lessonTitle={lesson.title} />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}