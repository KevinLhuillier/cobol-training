"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Loader2, X, PlusCircle, Video } from "lucide-react";


interface LessonVideoFormProps {
    initialData: { vimeoUrl: string | null }; // Adapté à ton schéma Prisma
    courseId: string;
    chapterId: string;
    lessonId: string;
}

// Extrait l'ID d'une URL Vimeo proprement
const getVimeoEmbedUrl = (url: string) => {
    if (!url) return null;

    // Si c'est déjà un iframe ou un format bizarre, ou extraction classique par regex
    const match = url.match(/(?:vimeo\.com\/|video\/|channels\/.+\/|groups\/.+\/videos\/|album\/.+\/video\/)(\d+)/);
    const videoId = match ? match[1] : url.split("/").pop();

    if (!videoId || isNaN(Number(videoId))) return null;

    // On retourne l'URL d'intégration officielle de Vimeo
    return `https://player.vimeo.com/video/${videoId}`;
};

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
                // Adapté au nom de ta colonne en base
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

    // Plus besoin de "if (!isMounted)", le composant est beaucoup plus propre !

    return (
        <div className="mt-6 border border-slate-200 bg-slate-50 rounded-xl p-4">
            <div className="font-medium flex items-center justify-between mb-4 text-slate-900">
                Video URL
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
                <form onSubmit={onSubmit} className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                        <input
                            type="url"
                            placeholder="e.g. 'https://vimeo.com/...'"
                            value={vimeoUrl}
                            onChange={(e) => setVimeoUrl(e.target.value)}
                            disabled={isLoading}
                            className="text-slate-900 flex-1 h-9 px-3 rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-slate-900 outline-none text-sm"
                        />
                        <button type="submit" disabled={isLoading} className="h-9 px-4 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 disabled:opacity-50 flex items-center">
                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
                        </button>
                    </div>
                </form>
            )}

            {!isEditing && (
                !initialData.vimeoUrl ? (
                    <div className="flex items-center justify-center h-40 bg-slate-100 rounded-lg border-2 border-dashed border-slate-200">
                        <Video className="h-8 w-8 text-slate-400" />
                    </div>
                ) : (
                    <div className="mt-2 relative aspect-video w-full rounded-lg overflow-hidden bg-slate-900">
                        {getVimeoEmbedUrl(initialData.vimeoUrl) ? (
                            <iframe
                                src={getVimeoEmbedUrl(initialData.vimeoUrl)!}
                                className="absolute top-0 left-0 w-full h-full border-0"
                                allow="autoplay; fullscreen; picture-in-picture"
                                allowFullScreen
                            />
                        ) : (
                            <div className="flex items-center justify-center h-full text-white text-sm">
                                Invalid Vimeo URL
                            </div>
                        )}
                    </div>
                )
            )}
        </div>
    );
}