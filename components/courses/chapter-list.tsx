"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Pencil, ChevronUp, ChevronDown, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ChapterDeleteButton } from "./chapter-delete-button";
// 🟢 Import du client Supabase
import { createClient } from "@/utils/supabase/client";

interface ChapterListProps {
    courseId: string;
    items: {
        id: string;
        title: string;
        position: number;
        isFreePreview?: boolean;
    }[];
}

export function ChapterList({ courseId, items }: ChapterListProps) {
    const router = useRouter();
    const supabase = createClient();
    const [isUpdating, setIsUpdating] = useState(false);

    const onMove = async (currentIndex: number, direction: "up" | "down") => {
        if (direction === "up" && currentIndex === 0) return;
        if (direction === "down" && currentIndex === items.length - 1) return;

        const itemToMove = items[currentIndex];
        const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
        const targetItem = items[targetIndex];

        try {
            setIsUpdating(true);

            // 🟢 L'API JS de Supabase ne fait pas de Bulk Update facilement.
            // On lance donc les deux mises à jour en parallèle.
            const [res1, res2] = await Promise.all([
                supabase.from("chapters").update({ position: targetItem.position }).eq("id", itemToMove.id),
                supabase.from("chapters").update({ position: itemToMove.position }).eq("id", targetItem.id)
            ]);

            if (res1.error) throw res1.error;
            if (res2.error) throw res2.error;

            router.refresh();
        } catch (error) {
            console.error("Erreur de réorganisation:", error);
            alert("Une erreur est survenue lors de la réorganisation.");
        } finally {
            setIsUpdating(false);
        }
    };

    if (items.length === 0) {
        return (
            <p className="text-sm text-slate-500 italic text-center py-6">
                No chapters yet. Add your first chapter to structure your course.
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

            {items.map((chapter, index) => (
                <div
                    key={chapter.id}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 group"
                >
                    <div className="flex items-center gap-3">
                        <div className="flex flex-col gap-0.5">
                            <button
                                onClick={() => onMove(index, "up")}
                                disabled={index === 0 || isUpdating}
                                className="p-0.5 text-slate-400 hover:text-slate-900 disabled:opacity-30 disabled:hover:text-slate-400 transition-colors rounded-sm hover:bg-slate-200"
                            >
                                <ChevronUp className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => onMove(index, "down")}
                                disabled={index === items.length - 1 || isUpdating}
                                className="p-0.5 text-slate-400 hover:text-slate-900 disabled:opacity-30 disabled:hover:text-slate-400 transition-colors rounded-sm hover:bg-slate-200"
                            >
                                <ChevronDown className="h-4 w-4" />
                            </button>
                        </div>

                        <span className="font-bold text-slate-900 text-sm">{chapter.title}</span>
                    </div>

                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {/* 🟢 Le lien pointe maintenant vers /dashboard/admin/... */}
                        <Link
                            href={`/dashboard/admin/courses/${courseId}/chapters/${chapter.id}`}
                            className="p-1.5 text-slate-400 hover:text-slate-900 transition-colors rounded-md hover:bg-slate-200"
                            title="Edit Chapter"
                        >
                            <Pencil className="h-3.5 w-3.5" />
                        </Link>

                        <ChapterDeleteButton
                            courseId={courseId}
                            chapterId={chapter.id}
                            chapterTitle={chapter.title}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
}