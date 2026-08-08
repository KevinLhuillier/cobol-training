"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X, Loader2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
// 🟢 Import du client Supabase
import { createClient } from "@/utils/supabase/client";

interface ReviewActionButtonsProps {
    progressId: string;
}

export function ReviewActionButtons({ progressId }: ReviewActionButtonsProps) {
    const router = useRouter();
    const supabase = createClient();
    const [isLoading, setIsLoading] = useState(false);
    const [feedback, setFeedback] = useState("");

    const onAction = async (status: "APPROVED" | "REJECTED") => {
        try {
            setIsLoading(true);

            // 🟢 Mise à jour directe de la ligne dans la table lesson_progress
            const { error } = await supabase
                .from("lesson_progress")
                .update({
                    exercise_status: status,
                    review_feedback: feedback || null,
                    // Si on approuve, la leçon est officiellement validée pour l'étudiant
                    is_completed: status === "APPROVED"
                })
                .eq("id", progressId);

            if (error) {
                console.error("Review Update Error:", error);
                throw new Error("Failed to update review");
            }

            // Rafraîchir la page pour faire disparaître l'exercice de la liste "En attente"
            router.refresh();
        } catch (error) {
            alert("An error occurred while updating the review.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center w-full gap-3">
            <div className="relative w-full">
                <MessageSquare className="absolute top-3 left-3 h-4 w-4 text-slate-400" />
                <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    disabled={isLoading}
                    placeholder="Add feedback for the student (optional)..."
                    className="block w-full min-h-[100px] pl-10 p-3 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-slate-900 outline-none transition-all text-sm text-slate-700 resize-y"
                />
            </div>
            <Button
                disabled={isLoading}
                onClick={() => onAction("REJECTED")}
                variant="outline"
                className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 bg-white"
            >
                {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <X className="h-4 w-4 mr-2" />}
                Reject
            </Button>

            <Button
                disabled={isLoading}
                onClick={() => onAction("APPROVED")}
                className="bg-emerald-600 text-white hover:bg-emerald-700"
            >
                {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Check className="h-4 w-4 mr-2" />}
                Approve
            </Button>
        </div>
    );
}