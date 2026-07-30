"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Loader2, X } from "lucide-react";

interface LessonTitleFormProps {
    initialData: {
        title: string;
        type: "VIDEO" | "EXERCISE" | "QUIZ"; // 🟢 Ajout du type dans l'interface
    };
    courseId: string;
    chapterId: string;
    lessonId: string;
}

export function LessonTitleForm({ initialData, courseId, chapterId, lessonId }: LessonTitleFormProps) {
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState(initialData.title);
    const [type, setType] = useState<"VIDEO" | "EXERCISE" | "QUIZ">(initialData.type);
    const [isLoading, setIsLoading] = useState(false);

    const toggleEdit = () => {
        setIsEditing((prev) => !prev);
        setTitle(initialData.title); // Reset if cancelled
        setType(initialData.type);   // 🟢 Reset du type avec la valeur initiale
    };

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // 🟢 On annule si le titre est vide, ou si RIEN n'a changé (ni le titre, ni le type)
        if (!title.trim() || (title === initialData.title && type === initialData.type)) {
            return toggleEdit();
        }

        try {
            setIsLoading(true);
            const response = await fetch(`/api/admin/courses/${courseId}/chapters/${chapterId}/lessons/${lessonId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, type }),
            });

            if (!response.ok) throw new Error("Something went wrong");

            toggleEdit();
            router.refresh();
        } catch (error) {
            alert("Une erreur est survenue.");
        } finally {
            setIsLoading(false);
        }
    };

    if (isEditing) {
        return (
            // 🟢 Passage en flex-wrap au cas où l'écran serait un peu petit
            <form onSubmit={onSubmit} className="flex flex-wrap items-center gap-2">
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={isLoading}
                    className="flex-1 min-w-[200px] h-9 px-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none text-slate-900 text-sm font-medium"
                    autoFocus
                />

                {/* 🟢 Le menu déroulant pour le type */}
                <select
                    value={type}
                    onChange={(e) => setType(e.target.value as "VIDEO" | "EXERCISE" | "QUIZ")}
                    disabled={isLoading}
                    className="h-9 px-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none text-slate-900 text-sm font-medium"
                >
                    <option value="VIDEO">Video</option>
                    <option value="EXERCISE">Exercise</option>
                    <option value="QUIZ">Quiz</option>
                </select>

                <div className="flex items-center gap-1">
                    <button type="button" onClick={toggleEdit} disabled={isLoading} className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
                        <X className="h-4 w-4" />
                    </button>
                    <button type="submit" disabled={isLoading || !title.trim()} className="h-9 px-4 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 disabled:opacity-50 flex items-center">
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
                    </button>
                </div>
            </form>
        );
    }

    return (
        <div className="flex items-center gap-x-3">
            <div className="flex items-center gap-2">
                <p className="text-slate-900 font-medium">{initialData.title}</p>
                {/* 🟢 Petit badge pour repérer le type de leçon d'un coup d'œil */}
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 rounded-md">
                    {initialData.type}
                </span>
            </div>
            <button onClick={toggleEdit} className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
                <Pencil className="h-4 w-4" />
            </button>
        </div>
    );
}