"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
// 🟢 Import du client Supabase
import { createClient } from "@/utils/supabase/client";

interface CoursePublishButtonProps {
    courseId: string;
    isPublished: boolean;
}

export function CoursePublishButton({ courseId, isPublished }: CoursePublishButtonProps) {
    const router = useRouter();
    const supabase = createClient();
    const [isLoading, setIsLoading] = useState(false);

    const onClick = async () => {
        try {
            setIsLoading(true);

            // 🟢 Bascule (toggle) du statut de publication directement dans Supabase
            const { error } = await supabase
                .from("courses")
                .update({ is_published: !isPublished })
                .eq("id", courseId);

            if (error) {
                throw error;
            }

            // Met à jour l'interface (rafraîchit le badge Draft/Published de la page parente)
            router.refresh();
        } catch (error) {
            console.error("Publish toggle error:", error);
            alert("An error occurred while changing the publication status.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={onClick}
            disabled={isLoading}
            className="h-10 px-4 flex items-center justify-center rounded-xl font-bold text-white bg-slate-900 hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-50 min-w-[100px]"
        >
            {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : isPublished ? (
                "Unpublish"
            ) : (
                "Publish"
            )}
        </button>
    );
}