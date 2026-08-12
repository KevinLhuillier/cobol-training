"use client";

import { useState } from "react";
// Plus besoin de useRouter() grâce au revalidatePath de l'action serveur
import { Check, X, Loader2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

// 🟢 Import de la Server Action
import { processReviewAction } from "@/app/actions/review";

interface ReviewActionButtonsProps {
    progressId: string;
}

export function ReviewActionButtons({ progressId }: ReviewActionButtonsProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [feedback, setFeedback] = useState("");

    const onAction = async (status: "APPROVED" | "REJECTED") => {
        try {
            setIsLoading(true);

            // 🟢 Appel de la Server Action (BDD + Email sont gérés côté serveur)
            await processReviewAction(progressId, status, feedback);

            // On peut vider le champ (la page va se rafraîchir toute seule via revalidatePath)
            setFeedback("");

        } catch (error) {
            console.error(error);
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