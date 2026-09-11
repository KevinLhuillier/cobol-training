"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Loader2, X, Image as ImageIcon } from "lucide-react";
// 🟢 Import du client Supabase
import { createClient } from "@/utils/supabase/client";

interface CourseImageFormProps {
    initialData: { imageUrl: string | null };
    courseId: string;
}

export function CourseImageForm({ initialData, courseId }: CourseImageFormProps) {
    const router = useRouter();
    const supabase = createClient();
    const [isEditing, setIsEditing] = useState(false);
    const [imageUrl, setImageUrl] = useState(initialData.imageUrl || "");
    const [isLoading, setIsLoading] = useState(false);

    const toggleEdit = () => {
        setIsEditing((prev) => !prev);
        setImageUrl(initialData.imageUrl || "");
    };

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (imageUrl === (initialData.imageUrl || "")) return toggleEdit();

        try {
            setIsLoading(true);

            // 🟢 Mise à jour directe et sécurisée dans Supabase
            const { error } = await supabase
                .from("courses")
                .update({ image_url: imageUrl.trim() || null })
                .eq("id", courseId);

            if (error) throw error;

            setIsEditing(false);
            router.refresh();
        } catch (error) {
            console.error("Course image update error:", error);
            alert("An error occurred while updating the course image.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-lg">
                    <div className="h-8 w-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                        <ImageIcon className="h-4 w-4" />
                    </div>
                    Course Image
                </div>
                {!isEditing && (
                    <button
                        onClick={toggleEdit}
                        className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
                    >
                        <Pencil className="h-4 w-4" />
                    </button>
                )}
            </div>

            {isEditing && (
                <form onSubmit={onSubmit} className="space-y-3 mb-4">
                    <input
                        type="url"
                        placeholder="https://example.com/image.png"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        disabled={isLoading}
                        className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none text-slate-900 text-sm"
                        autoFocus
                    />
                    <div className="flex items-center justify-end gap-2">
                        <button
                            type="button"
                            onClick={toggleEdit}
                            disabled={isLoading}
                            className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="h-9 px-4 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 disabled:opacity-50 flex items-center"
                        >
                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
                        </button>
                    </div>
                </form>
            )}

            {imageUrl.trim() ? (
                <div className="aspect-video w-full rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imageUrl} alt="Course cover" className="w-full h-full object-cover" />
                </div>
            ) : (
                <div className="aspect-video w-full rounded-xl bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400">
                    <ImageIcon className="h-8 w-8 mb-2 opacity-50" />
                    <p className="text-sm font-medium">No image uploaded</p>
                </div>
            )}
        </div>
    );
}
