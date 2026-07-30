"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Editor } from "@/components/editor";
import { Preview } from "@/components/preview";
import { Button } from "@/components/ui/button";
import { Pencil, X } from "lucide-react"; // 🟢 Ajout de la croix (X)

interface LessonDescriptionFormProps {
    initialData: { content: string | null };
    courseId: string;
    chapterId: string;
    lessonId: string;
}

export function LessonDescriptionForm({ initialData, courseId, chapterId, lessonId }: LessonDescriptionFormProps) {
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [content, setContent] = useState(initialData.content || "");
    const [isLoading, setIsLoading] = useState(false);

    const toggleEdit = () => setIsEditing((current) => !current);

    const onSubmit = async () => {
        try {
            setIsLoading(true);
            const response = await fetch(`/api/admin/courses/${courseId}/chapters/${chapterId}/lessons/${lessonId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content }),
            });

            if (!response.ok) throw new Error("Erreur lors de la sauvegarde");

            toggleEdit();
            router.refresh();
        } catch {
            alert("Une erreur est survenue.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        // Alignement parfait avec les autres éléments de ton interface
        <div className="mt-6 bg-slate-50 border border-slate-100 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-500">Lesson Description</span>

                {/* 🟢 Bouton "Icon" pour correspondre aux autres champs */}
                <Button
                    onClick={toggleEdit}
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-slate-500 hover:text-slate-900 hover:bg-slate-200/50 rounded-lg transition-colors"
                >
                    {isEditing ? (
                        <X className="h-4 w-4" />
                    ) : (
                        <Pencil className="h-4 w-4" />
                    )}
                </Button>
            </div>

            {!isEditing && (
                <div className={`text-sm mt-4 text-slate-900 ${!initialData.content && "text-slate-500 italic"}`}>
                    {initialData.content ? (
                        <Preview value={initialData.content} />
                    ) : (
                        "Aucune description fournie"
                    )}
                </div>
            )}

            {isEditing && (
                <div className="space-y-4 mt-4">
                    <Editor
                        value={content}
                        onChange={(val) => setContent(val)}
                    />
                    <div className="flex items-center gap-x-2">
                        <Button disabled={isLoading} onClick={onSubmit} className="bg-slate-900 text-white rounded-xl shadow-sm">
                            Sauvegarder
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}