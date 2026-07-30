"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";

interface TsoDeleteButtonProps {
    id: string;
}

export function TsoDeleteButton({ id }: TsoDeleteButtonProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const onClick = async () => {
        // Demande de confirmation native du navigateur
        const confirmed = confirm("Are you sure you want to delete this TSO account? This action cannot be undone.");
        if (!confirmed) return;

        try {
            setIsLoading(true);
            const response = await fetch(`/api/admin/tso-users/${id}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error("Something went wrong");
            }

            // Rafraîchit la page serveur pour faire disparaître la ligne
            router.refresh();
        } catch (error) {
            alert("An error occurred while deleting the account.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={onClick}
            disabled={isLoading}
            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Delete"
        >
            {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin text-red-600" />
            ) : (
                <Trash2 className="h-4 w-4" />
            )}
        </button>
    );
}