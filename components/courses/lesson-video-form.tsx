"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Loader2, X, PlusCircle, Video } from "lucide-react";

interface LessonVideoFormProps {
    initialData: { vimeoUrl: string | null };
    courseId: string;
    chapterId: string;
    lessonId: string;
}

export function LessonVideoForm({ initialData, courseId, chapterId, lessonId }: LessonVideoFormProps) {
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [vimeoUrl, setVimeoUrl] = useState(initialData.vimeoUrl || "");
    const [isLoading, setIsLoading] = useState(false);

    const toggleEdit = () => {
        setIsEditing((prev) => !prev);
        setVimeoUrl(initialData.vimeoUrl || "");
    };

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (vimeoUrl === initialData.vimeoUrl) return toggleEdit();

        try {
            setIsLoading(true);
            const response = await fetch(`/api/admin/courses/${courseId}/chapters/${chapterId}/lessons/${lessonId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                // On envoie le champ videoUrl à l'API
                body: JSON.stringify({ vimeoUrl: vimeoUrl.trim() || null }),
            });

            if (!response.ok) throw new Error("Something went wrong");

            toggleEdit();
            router.refresh();
        } catch (error) {
            alert("Une erreur est survenue lors de l'enregistrement de la vidéo.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="mt-6 border border-slate-200 bg-slate-50 rounded-xl p-4">
            <div className="font-medium flex items-center justify-between mb-4 text-slate-900">
                Video URL (YouTube, Vimeo, etc.)
                <button onClick={toggleEdit} className="text-slate-500 hover:text-slate-900 flex items-center text-sm font-medium transition-colors">
                    {isEditing ? (
                        <>Cancel</>
                    ) : !initialData.vimeoUrl ? (
                        <><PlusCircle className="h-4 w-4 mr-2" /> Add a video</>
                    ) : (
                        <><Pencil className="h-4 w-4 mr-2" /> Edit video</>
                    )}
                </button>
            </div>

            {isEditing && (
                <form onSubmit={onSubmit} className="flex items-center gap-2">
                    <input
                        type="url"
                        placeholder="https://..."
                        value={vimeoUrl}
                        onChange={(e) => setVimeoUrl(e.target.value)}
                        disabled={isLoading}
                        className="text-slate-900 flex-1 h-9 px-3 rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-slate-900 outline-none text-sm"
                    />
                    <button type="submit" disabled={isLoading} className="h-9 px-4 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 disabled:opacity-50">
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
                    </button>
                </form>
            )}

            {!isEditing && (
                !initialData.vimeoUrl ? (
                    <div className="flex items-center justify-center h-40 bg-slate-100 rounded-lg border-2 border-dashed border-slate-200">
                        <Video className="h-8 w-8 text-slate-400" />
                    </div>
                ) : (
                    <div className="relative aspect-video mt-2">
                        <div className="w-full h-full bg-slate-900 rounded-lg flex items-center justify-center text-white text-sm">
                            Player Preview (Requires iFrame setup later)
                        </div>
                        <p className="text-xs text-slate-500 mt-2 break-all p-2 bg-white rounded-md border border-slate-200">
                            {initialData.vimeoUrl}
                        </p>
                    </div>
                )
            )}
        </div>
    );
}