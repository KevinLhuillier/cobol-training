"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Layers, PlayCircle, Pencil, Trash2, ChevronUp, ChevronDown, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
// 🟢 Import du client Supabase
import { createClient } from "@/utils/supabase/client";

interface CourseListProps {
    items: {
        id: string;
        title: string;
        is_published: boolean;
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
            <div className="p-8 text-center text-slate-500">
                No courses found. Click &quot;New Course&quot; to create one.
            </div>
        );
    }

    return (
        <div className="overflow-x-auto relative">
            {isUpdating && (
                <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-slate-900" />
                </div>
            )}

            <table className="w-full text-left border-collapse">
                <thead>
                <tr className="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-wider">
                    <th className="p-4 font-bold w-10"></th>
                    <th className="p-4 font-bold">Course Title</th>
                    <th className="p-4 font-bold">Status</th>
                    <th className="p-4 font-bold text-center">Structure</th>
                    <th className="p-4 font-bold text-right">Actions</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                {items.map((course, index) => (
                    <tr key={course.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4">
                            <div className="flex flex-col gap-0.5">
                                <button
                                    onClick={() => onMove(index, "up")}
                                    disabled={index === 0 || isUpdating}
                                    title="Move up"
                                    className="p-0.5 text-slate-400 hover:text-slate-900 disabled:opacity-30 disabled:hover:text-slate-400 transition-colors rounded-sm hover:bg-slate-200"
                                >
                                    <ChevronUp className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => onMove(index, "down")}
                                    disabled={index === items.length - 1 || isUpdating}
                                    title="Move down"
                                    className="p-0.5 text-slate-400 hover:text-slate-900 disabled:opacity-30 disabled:hover:text-slate-400 transition-colors rounded-sm hover:bg-slate-200"
                                >
                                    <ChevronDown className="h-4 w-4" />
                                </button>
                            </div>
                        </td>
                        <td className="p-4">
                            <p className="font-bold text-slate-900">{course.title}</p>
                            <p className="text-xs text-slate-500 mt-1">
                                Updated: {new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date(course.updated_at))}
                            </p>
                        </td>
                        <td className="p-4">
                            <Badge
                                className={`border-none ${
                                    course.is_published
                                        ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                                        : "bg-amber-100 text-amber-700 hover:bg-amber-100"
                                }`}
                            >
                                {course.is_published ? "Published" : "Draft"}
                            </Badge>
                        </td>
                        <td className="p-4">
                            <div className="flex items-center justify-center gap-4 text-sm text-slate-600 font-medium">
                                <span className="flex items-center gap-1" title="Chapters">
                                    <Layers className="h-4 w-4 text-slate-400" />
                                    {course.chaptersCount}
                                </span>
                                <span className="flex items-center gap-1" title="Lessons">
                                    <PlayCircle className="h-4 w-4 text-slate-400" />
                                    {course.lessonsCount}
                                </span>
                            </div>
                        </td>
                        <td className="p-4">
                            <div className="flex items-center justify-end gap-2">
                                <Link
                                    href={`/dashboard/admin/courses/${course.id}`}
                                    className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                                    title="Edit course"
                                >
                                    <Pencil className="h-4 w-4" />
                                </Link>
                                {/* Le bouton supprimer nécessitera un composant client plus tard, on le garde en UI pour le moment */}
                                <button
                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Delete"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}
