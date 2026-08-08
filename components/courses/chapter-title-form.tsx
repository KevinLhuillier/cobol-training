"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Loader2, X } from "lucide-react";
// 🟢 Import du client Supabase
import { createClient } from "@/utils/supabase/client";

interface ChapterTitleFormProps {
    initialData: { title: string };
    courseId: string;
    chapterId: string;
}

export function ChapterTitleForm({ initialData, courseId, chapterId }: ChapterTitleFormProps) {
    const router = useRouter();
    const supabase = createClient();
    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState(initialData.title);
    const [isLoading, setIsLoading] = useState(false);

    const toggleEdit = () => {
        setIsEditing((prev) => !prev);
        setTitle(initialData.title); // Réinitialise si on annule
    };

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || title === initialData.title) return toggleEdit();

        try {
            setIsLoading(true);

            // 🟢 Mise à jour directe et sécurisée dans Supabase
            const { error } = await supabase
                .from("chapters")
                .update({ title: title.trim() })
                .eq("id", chapterId)
                .eq("course_id", courseId); // Sécurité supplémentaire

            if (error) {
                throw error;
            }

            toggleEdit();
            router.refresh();
        } catch (error) {
            console.error("Title update error:", error);
            alert("An error occurred while updating the chapter title.");
        } finally {
            setIsLoading(false);
        }
    };

    if (isEditing) {
        return (
            <form onSubmit={onSubmit} className="flex items-center gap-2 mt-1">
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={isLoading}
                    className="flex-1 max-w-[300px] h-9 px-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none text-slate-900 text-sm font-medium"
                    autoFocus
                />
                <button type="button" onClick={toggleEdit} disabled={isLoading} className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
                    <X className="h-4 w-4" />
                </button>
                <button type="submit" disabled={isLoading || !title.trim()} className="h-9 px-4 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 disabled:opacity-50 flex items-center">
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
                </button>
            </form>
        );
    }

    return (
        <div className="flex items-center gap-x-3 mt-1">
            <p className="text-slate-900 font-medium">{initialData.title}</p>
            <button onClick={toggleEdit} className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
                <Pencil className="h-4 w-4" />
            </button>
        </div>
    );
}