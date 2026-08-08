"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export function TsoDeleteButton({ id }: { id: string }) {
    const router = useRouter();
    const supabase = createClient();
    const [isLoading, setIsLoading] = useState(false);

    const onClick = async () => {
        if (!confirm("Are you sure you want to delete this TSO account?")) return;

        try {
            setIsLoading(true);
            const { error } = await supabase.from("tso_users").delete().eq("id", id);
            if (error) throw error;
            router.refresh();
        } catch {
            alert("An error occurred while deleting.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={onClick}
            disabled={isLoading}
            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
        </button>
    );
}