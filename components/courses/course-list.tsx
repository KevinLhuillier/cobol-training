"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Layers, Pencil, ChevronUp, ChevronDown, Loader2 } from "lucide-react";
// 🟢 Import du client Supabase
import { createClient } from "@/utils/supabase/client";
import { CourseDeleteButton } from "@/components/courses/course-delete-button";

interface CourseListProps {
    items: {
        id: string;
        title: string;
        is_published: boolean;
        is_free: boolean;
        kind: "COURSE" | "PROJECT";
        image_url: string | null;
        updated_at: string;
        position: number;
        chaptersCount: number;
        lessonsCount: number;
    }[];
}

export function CourseList({ items }: CourseListProps) {
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
                supabase.from("courses").update({ position: targetItem.position }).eq("id", itemToMove.id),
                supabase.from("courses").update({ position: itemToMove.position }).eq("id", targetItem.id)
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
            <div className="p-8 text-center text-sm text-ui-muted">
                No courses found. Click &quot;New Course&quot; to create one.
            </div>
        );
    }

    const chip = "px-2 py-0.5 rounded-md text-xs font-semibold";

    return (
        <div className="relative">
            {isUpdating && (
                <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-slate-900" />
                </div>
            )}

            <ul className="divide-y divide-ui-line">
                {items.map((course, index) => (
                    <li key={course.id} className="flex flex-wrap items-center gap-x-4 gap-y-3 px-4 py-3.5 hover:bg-ui-page/50 transition-colors">
                        {/* Réordonnancement */}
                        <div className="flex flex-col gap-0.5 shrink-0">
                            <button
                                onClick={() => onMove(index, "up")}
                                disabled={index === 0 || isUpdating}
                                title="Move up"
                                aria-label={`Move ${course.title} up`}
                                className="p-0.5 text-slate-400 hover:text-slate-900 disabled:opacity-30 disabled:hover:text-slate-400 transition-colors rounded-sm hover:bg-slate-100"
                            >
                                <ChevronUp className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => onMove(index, "down")}
                                disabled={index === items.length - 1 || isUpdating}
                                title="Move down"
                                aria-label={`Move ${course.title} down`}
                                className="p-0.5 text-slate-400 hover:text-slate-900 disabled:opacity-30 disabled:hover:text-slate-400 transition-colors rounded-sm hover:bg-slate-100"
                            >
                                <ChevronDown className="h-4 w-4" />
                            </button>
                        </div>

                        {/* Vignette */}
                        <div className="h-11 w-16 rounded-md overflow-hidden bg-ui-accent-soft shrink-0 flex items-center justify-center">
                            {course.image_url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={course.image_url} alt="" className="h-full w-full object-cover" />
                            ) : (
                                <Layers className="h-4 w-4 text-ui-accent/60" />
                            )}
                        </div>

                        {/* Titre + structure */}
                        <div className="flex-1 min-w-[200px]">
                            <Link href={`/dashboard/admin/courses/${course.id}`} className="font-semibold text-slate-900 hover:underline">
                                {course.title}
                            </Link>
                            <p className="mt-0.5 text-[13px] text-ui-muted">
                                {course.chaptersCount} chapter{course.chaptersCount !== 1 ? "s" : ""} · {course.lessonsCount} lesson{course.lessonsCount !== 1 ? "s" : ""}
                                {" · "}Updated {new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(course.updated_at))}
                            </p>
                        </div>

                        {/* Statuts */}
                        <div className="flex items-center gap-1.5">
                            {course.kind === "PROJECT" && <span className={`${chip} bg-rose-50 text-rose-800`}>Project</span>}
                            {course.is_free && <span className={`${chip} bg-ui-accent-soft text-ui-accent`}>Free</span>}
                            <span className={`${chip} ${course.is_published ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800"}`}>
                                {course.is_published ? "Published" : "Draft"}
                            </span>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 shrink-0">
                            <Link
                                href={`/dashboard/admin/courses/${course.id}`}
                                className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-md text-[13px] font-semibold text-ui-accent hover:bg-ui-accent-soft transition-colors"
                            >
                                <Pencil className="h-3.5 w-3.5" />
                                Edit
                            </Link>
                            <CourseDeleteButton courseId={course.id} courseTitle={course.title} imageUrl={course.image_url} />
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
