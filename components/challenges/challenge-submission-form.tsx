"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
// 🟢 Import du client Supabase
import { createClient } from "@/utils/supabase/client";

interface ChallengeSubmissionFormProps {
    challengeId: string;
    initialSolution: string | null;
}

export function ChallengeSubmissionForm({ challengeId, initialSolution }: ChallengeSubmissionFormProps) {
    const router = useRouter();
    const supabase = createClient();
    const [solution, setSolution] = useState(initialSolution || "");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [justSaved, setJustSaved] = useState(false);

    const hasSubmitted = initialSolution !== null;
    // Rien à envoyer tant que la solution est vide ou identique à celle déjà enregistrée
    const isUnchanged = solution.trim() === (initialSolution || "").trim();

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsLoading(true);
            setError("");
            setJustSaved(false);

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                throw new Error("You must be logged in to submit a solution.");
            }

            // Une solution par étudiant et par challenge : soumettre à nouveau met à jour la ligne
            const { error: upsertError } = await supabase
                .from("challenge_submissions")
                .upsert({
                    challenge_id: challengeId,
                    user_id: user.id,
                    solution: solution.trim(),
                }, {
                    onConflict: "challenge_id, user_id",
                });

            if (upsertError) {
                console.error("Challenge submission error:", upsertError);
                throw new Error("Failed to submit your solution.");
            }

            setJustSaved(true);
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unexpected error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={onSubmit} className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900">Your Solution</h3>
                {hasSubmitted ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                        <CheckCircle className="h-3.5 w-3.5 mr-1.5" /> Submitted
                    </span>
                ) : (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-slate-200 text-slate-700">
                        Not Submitted
                    </span>
                )}
            </div>

            {error && (
                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 font-medium">
                    {error}
                </div>
            )}

            <textarea
                required
                disabled={isLoading}
                value={solution}
                onChange={(e) => {
                    setSolution(e.target.value);
                    setJustSaved(false);
                }}
                placeholder="Type or paste your code here..."
                className="w-full min-h-[220px] p-4 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all font-mono text-sm text-slate-900 resize-y disabled:bg-slate-100 disabled:text-slate-500"
            />

            <div className="flex items-center justify-end gap-4">
                {justSaved && (
                    <p className="text-xs text-emerald-600 font-medium">Solution saved.</p>
                )}
                <Button
                    type="submit"
                    disabled={isLoading || !solution.trim() || isUnchanged}
                    className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-sm px-6 h-11"
                >
                    {isLoading ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                        <Send className="h-4 w-4 mr-2" />
                    )}
                    {hasSubmitted ? "Update Solution" : "Submit Solution"}
                </Button>
            </div>
        </form>
    );
}
