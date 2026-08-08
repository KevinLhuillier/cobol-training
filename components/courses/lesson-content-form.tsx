"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Editor } from "@/components/editor";
import { Preview } from "@/components/preview";
import { Button } from "@/components/ui/button";
import { Pencil, X, Loader2 } from "lucide-react";
// 🟢 Import du client Supabase
import { createClient } from "@/utils/supabase/client";

interface LessonContentFormProps {
    initialData: { content: string | null };
    courseId: string;
    chapterId: string;
    lessonId: string;
}

export function LessonContentForm({ initialData, courseId, chapterId, lessonId }: LessonContentFormProps) {
    const router = useRouter();
    const supabase = createClient();
    const [isEditing, setIsEditing] = useState(false);
    const [content, setContent] = useState(initialData.content || "");
    const [isLoading, setIsLoading] = useState(false);

    const toggleEdit = () => setIsEditing((current) => !current);

    const onSubmit = async () => {
        try {
            setIsLoading(true);

            // 🟢 Mise à jour directe et sécurisée dans Supabase
            const { error } = await supabase
                .from("lessons")
                .update({ content: content || null }) // Convertit une chaîne vide en null pour la BDD
                .eq("id", lessonId)
                .eq("chapter_id", chapterId); // Sécurité

            if (error) throw error;

            toggleEdit();
            router.refresh();
        } catch (error) {
            console.error("Content update error:", error);
            alert("An error occurred while saving the lesson content.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="mt-6 bg-slate-50 border border-slate-100 rounded-2xl p-4 shadow-sm w-full">
            <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-500">Lesson Content</span>

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
                        "No content provided"
                    )}
                </div>
            )}

            {isEditing && (
                <div className="space-y-4 mt-4 w-full">
                    <Editor
                        value={content}
                        onChange={(val) => setContent(val)}
                    />
                    <div className="flex items-center gap-x-2">
                        <Button disabled={isLoading} onClick={onSubmit} className="bg-slate-900 text-white rounded-xl shadow-sm">
                            {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                            Save Content
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}