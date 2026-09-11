"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
// 🟢 Import du client Supabase
import { createClient } from "@/utils/supabase/client";

interface CourseFreeToggleButtonProps {
    courseId: string;
    isFree: boolean;
}

export function CourseFreeToggleButton({ courseId, isFree }: CourseFreeToggleButtonProps) {
    const router = useRouter();
    const supabase = createClient();
    const [isLoading, setIsLoading] = useState(false);

    const onClick = async () => {
        try {
            setIsLoading(true);

            const { error } = await supabase
                .from("courses")
                .update({ is_free: !isFree })
                .eq("id", courseId);

            if (error) {
                throw error;
            }

            router.refresh();
        } catch (error) {
            console.error("Free toggle error:", error);
            alert("An error occurred while changing the free status.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={onClick}
            disabled={isLoading}
            className="h-10 px-4 flex items-center justify-center rounded-xl font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50 min-w-[100px]"
        >
            {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : isFree ? (
                "Mark as Paid"
            ) : (
                "Mark as Free"
            )}
        </button>
    );
}
