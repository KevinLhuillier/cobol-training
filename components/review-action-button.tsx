"use client";

import { useState } from "react";
// Plus besoin de useRouter() grâce au revalidatePath de l'action serveur
import { Check, X, Loader2 } from "lucide-react";
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
        <div className="flex flex-col gap-3">
            <label htmlFor={`feedback-${progressId}`} className="text-[13px] font-semibold text-slate-900">
                Feedback <span className="font-normal text-ui-muted">(optional)</span>
            </label>
            <textarea
                id={`feedback-${progressId}`}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                disabled={isLoading}
                rows={3}
                placeholder="Explain what to fix, or congratulate the student…"
                className="block w-full p-3 rounded-lg border border-ui-line-strong bg-white focus:outline-none focus:ring-2 focus:ring-ui-accent/30 focus:border-ui-accent text-sm text-slate-700 resize-y"
            />
            <div className="flex flex-wrap justify-end gap-2">
                <Button
                    disabled={isLoading}
                    onClick={() => onAction("REJECTED")}
                    variant="outline"
                    className="h-10 px-4 rounded-lg text-red-700 border-red-200 hover:bg-red-50 hover:text-red-800 bg-white font-semibold"
                >
                    {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <X className="h-4 w-4 mr-2" />}
                    Request changes
                </Button>

                <Button
                    disabled={isLoading}
                    onClick={() => onAction("APPROVED")}
                    className="h-10 px-4 rounded-lg bg-emerald-700 text-white hover:bg-emerald-800 font-semibold"
                >
                    {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Check className="h-4 w-4 mr-2" />}
                    Approve
                </Button>
            </div>
        </div>
    );
}
