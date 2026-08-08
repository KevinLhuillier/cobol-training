"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Loader2 } from "lucide-react";
// 🟢 Import du client Supabase
import { createClient } from "@/utils/supabase/client";

export function ChapterForm({ courseId }: { courseId: string }) {
    const router = useRouter();
    const supabase = createClient();

    const [isCreating, setIsCreating] = useState(false);
    const [title, setTitle] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const toggleCreating = () => {
        setIsCreating((prev) => !prev);
        setTitle("");
    };

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        try {
            setIsLoading(true);

            // 1. Trouver la position du dernier chapitre
            const { data: lastChapter } = await supabase
                .from("chapters")
                .select("position")
                .eq("course_id", courseId)
                .order("position", { ascending: false })
                .limit(1)
                .single();

            const newPosition = lastChapter ? lastChapter.position + 1 : 1;

            // 2. Insérer le nouveau chapitre
            const { error: insertError } = await supabase
                .from("chapters")
                .insert({
                    title: title.trim(),
                    course_id: courseId,
                    position: newPosition
                });

            if (insertError) {
                throw insertError;
            }

            toggleCreating();
            router.refresh();
        } catch (error) {
            console.error("Erreur création chapitre:", error);
            alert("Something went wrong while creating the chapter.");
        } finally {
            setIsLoading(false);
        }
    };

    if (isCreating) {
        return (
            <form onSubmit={onSubmit} className="flex items-center gap-2 w-full justify-end">
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={isLoading}
                    placeholder="e.g. Introduction to DB2"
                    className="flex-1 max-w-[250px] h-9 px-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none text-slate-900 text-sm font-medium"
                    autoFocus
                />
                <button
                    type="button"
                    onClick={toggleCreating}
                    disabled={isLoading}
                    className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors shrink-0"
                >
                    <X className="h-4 w-4" />
                </button>
                <button
                    type="submit"
                    disabled={isLoading || !title.trim()}
                    className="h-9 px-4 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 disabled:opacity-50 transition-colors flex items-center shrink-0"
                >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
                </button>
            </form>
        );
    }

    return (
        <button
            onClick={toggleCreating}
            className="inline-flex items-center justify-center bg-slate-50 hover:bg-slate-100 text-slate-900 rounded-xl h-9 px-4 text-sm font-bold transition-colors shrink-0"
        >
            <Plus className="mr-2 h-4 w-4" />
            Add Chapter
        </button>
    );
}