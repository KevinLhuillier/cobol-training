"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface CoursePublishButtonProps {
    courseId: string;
    isPublished: boolean;
}

export function CoursePublishButton({ courseId, isPublished }: CoursePublishButtonProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const onClick = async () => {
        try {
            setIsLoading(true);
            const response = await fetch(`/api/admin/courses/${courseId}/publish`, {
                method: "PATCH",
            });

            if (!response.ok) {
                throw new Error("Failed to update publication status");
            }

            router.refresh(); // Met à jour l'interface (badge Draft/Published)
        } catch (error) {
            alert("Une erreur est survenue lors du changement de statut.");
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