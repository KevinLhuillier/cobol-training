"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Loader2 } from "lucide-react";

export function ChapterForm({ courseId }: { courseId: string }) {
    const router = useRouter();
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
            const response = await fetch(`/api/admin/courses/${courseId}/chapters`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title }),
            });

            if (!response.ok) {
                throw new Error("Failed to create chapter");
            }

            toggleCreating();
            router.refresh();
        } catch (error) {
            console.error(error);
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