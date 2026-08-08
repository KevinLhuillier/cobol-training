"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Loader2, X, PlusCircle, Video } from "lucide-react";
// 🟢 Import du client Supabase
import { createClient } from "@/utils/supabase/client";

interface LessonVideoFormProps {
    // Dans Supabase, cette colonne s'appelle probablement videoUrl d'après l'alias que nous avons créé sur la page
    initialData: { videoUrl: string | null };
    courseId: string;
    chapterId: string;
    lessonId: string;
}

const getVimeoEmbedUrl = (url: string) => {
    if (!url) return null;
    const match = url.match(/(?:vimeo\.com\/|video\/|channels\/.+\/|groups\/.+\/videos\/|album\/.+\/video\/)(\d+)/);
    const videoId = match ? match[1] : url.split("/").pop();
    if (!videoId || isNaN(Number(videoId))) return null;
    return `https://player.vimeo.com/video/${videoId}`;
};

export function LessonVideoForm({ initialData, courseId, chapterId, lessonId }: LessonVideoFormProps) {
    const router = useRouter();
    const supabase = createClient();
    const [isEditing, setIsEditing] = useState(false);
    // Utilisation de videoUrl
    const [videoUrl, setVideoUrl] = useState(initialData.videoUrl || "");
    const [isLoading, setIsLoading] = useState(false);

    const toggleEdit = () => {
        setIsEditing((prev) => !prev);
        setVideoUrl(initialData.videoUrl || "");
    };

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (videoUrl === initialData.videoUrl) return toggleEdit();

        try {
            setIsLoading(true);

            // 🟢 Mise à jour directe dans Supabase (Attention, le nom exact de la colonne dans ta base de données est probablement video_url)
            const { error } = await supabase
                .from("lessons")
                .update({ vimeo_url: videoUrl.trim() || null })
                .eq("id", lessonId)
                .eq("chapter_id", chapterId);

            if (error) throw error;

            toggleEdit();
            router.refresh();
        } catch (error) {
            console.error("Video update error:", error);
            alert("An error occurred while saving the video URL.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="mt-6 border border-slate-200 bg-slate-50 rounded-xl p-4">
            <div className="font-medium flex items-center justify-between mb-4 text-slate-900">
                Video URL
                <button onClick={toggleEdit} className="text-slate-500 hover:text-slate-900 flex items-center text-sm font-medium transition-colors">
                    {isEditing ? (
                        <>Cancel</>
                    ) : !initialData.videoUrl ? (
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
                            value={videoUrl}
                            onChange={(e) => setVideoUrl(e.target.value)}
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
                !initialData.videoUrl ? (
                    <div className="flex items-center justify-center h-40 bg-slate-100 rounded-lg border-2 border-dashed border-slate-200">
                        <Video className="h-8 w-8 text-slate-400" />
                    </div>
                ) : (
                    <div className="mt-2 relative aspect-video w-full rounded-lg overflow-hidden bg-slate-900">
                        {getVimeoEmbedUrl(initialData.videoUrl) ? (
                            <iframe
                                src={getVimeoEmbedUrl(initialData.videoUrl)!}
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