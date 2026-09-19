"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface ChallengeDeleteButtonProps {
    challengeId: string;
    challengeTitle: string;
}

export function ChallengeDeleteButton({ challengeId, challengeTitle }: ChallengeDeleteButtonProps) {
    const router = useRouter();
    const supabase = createClient();
    const [isLoading, setIsLoading] = useState(false);

    const onDelete = async () => {
        const isConfirmed = window.confirm(
            `Are you sure you want to delete the challenge "${challengeTitle}" and all its submitted solutions? This action cannot be undone.`
        );

        if (!isConfirmed) return;

        try {
            setIsLoading(true);

            // Les solutions soumises sont supprimées en cascade (ON DELETE CASCADE)
            const { error } = await supabase
                .from("challenges")
                .delete()
                .eq("id", challengeId);

            if (error) throw error;

            router.push("/dashboard/admin/challenges");
            router.refresh();
        } catch (error) {
            console.error("Delete error:", error);
            alert("An error occurred while deleting the challenge.");
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={onDelete}
            disabled={isLoading}
            title="Delete Challenge"
            className="h-10 w-10 flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors shadow-sm disabled:opacity-50"
        >
            {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
                <Trash2 className="h-4 w-4" />
            )}
        </button>
    );
}
