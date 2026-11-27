"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Send, Loader2, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SubscribeButton } from "@/components/subscribe-button";
// 🟢 Import du client Supabase
import { createClient } from "@/utils/supabase/client";
import { notifyExerciseSubmitted } from "@/app/actions/review";

interface ExerciseFormProps {
    courseId: string;
    chapterId: string;
    lessonId: string;
    initialAnswer?: string | null;
    isCompleted: boolean;
    nextLessonId?: string;
    exerciseStatus?: string | null;
    reviewFeedback?: string | null;
    /** Faux pour les membres de l'offre à vie dont la période de correction est terminée. */
    canRequestFeedback?: boolean;
}

export function ExerciseForm({ courseId, chapterId, lessonId, initialAnswer, isCompleted, nextLessonId, exerciseStatus, reviewFeedback, canRequestFeedback = true }: ExerciseFormProps) {
    const router = useRouter();
    const supabase = createClient();
    const [answer, setAnswer] = useState(initialAnswer || "");
    const [isLoading, setIsLoading] = useState(false);
    // Maintient le spinner jusqu'à la fin de la navigation / du rafraîchissement
    const [isNavigating, startTransition] = useTransition();
    const busy = isLoading || isNavigating;
    const [error, setError] = useState("");

    // Calcul de l'état actuel de l'exercice
    const isPending = exerciseStatus === "PENDING_REVIEW";
    const isApproved = exerciseStatus === "APPROVED" || isCompleted;

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsLoading(true);
            setError("");

            // 1. Récupérer l'utilisateur connecté
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                throw new Error("You must be logged in to submit an exercise.");
            }

            // 2. Upsert de la progression dans Supabase
            // Si une ligne existe déjà pour cet utilisateur et cette leçon, elle est mise à jour.
            const { error: upsertError } = await supabase
                .from("lesson_progress")
                .upsert({
                    lesson_id: lessonId,
                    user_id: user.id,
                    exercise_answer: answer.trim(),
                    exercise_status: "PENDING_REVIEW", // Passe automatiquement en statut "en attente"
                    is_completed: false // L'exercice n'est validé (true) que lorsque l'admin l'approuve
                }, {
                    onConflict: "user_id, lesson_id" // Utilise la contrainte d'unicité pour mettre à jour
                });

            if (upsertError) {
                console.error("Upsert Progress Error:", upsertError);
                throw new Error("Failed to submit exercise.");
            }

            // 3. Notifie l'admin par email (best-effort). Attendu avant de naviguer : une navigation
            // lancée pendant qu'une Server Action est en vol fait échouer celle-ci. L'action répond
            // immédiatement (l'email part dans `after()`).
            try {
                await notifyExerciseSubmitted(lessonId);
            } catch (notifyError) {
                console.error("Exercise submission notification failed:", notifyError);
            }

            startTransition(() => {
                // 3. Redirection si une leçon suivante existe
                if (nextLessonId) {
                    router.push(`/dashboard/courses/${courseId}?lessonId=${nextLessonId}`);
                }

                // Rafraîchir la page courante pour mettre à jour l'UI (le badge passera à "Review Pending")
                router.refresh();
            });
        } catch (err) {
            if (err instanceof Error) setError(err.message);
            else setError("An unexpected error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <section aria-labelledby="exercise-title" className="bg-ui-page/60 border border-ui-line rounded-xl p-5">
            {/* En-tête avec statuts */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <h3 id="exercise-title" className="text-[17px] font-semibold text-slate-900">Your solution</h3>

                {isApproved ? (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-800">
                        <CheckCircle className="h-3.5 w-3.5 mr-1.5" /> Approved
                    </span>
                ) : isPending ? (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-50 text-amber-800">
                        <Clock className="h-3.5 w-3.5 mr-1.5" /> Review pending
                    </span>
                ) : (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-white border border-ui-line text-slate-600">
                        Not submitted
                    </span>
                )}
            </div>

            {reviewFeedback && (
                <div className="mb-4 p-4 bg-ui-accent-soft rounded-lg">
                    <h4 className="text-[13px] font-semibold text-slate-900 mb-1">
                        Feedback from your instructor
                    </h4>
                    <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">
                        {reviewFeedback}
                    </p>
                </div>
            )}

            <form onSubmit={onSubmit} className="space-y-3">
                {error && (
                    <div className="p-3 bg-red-50 text-red-800 text-sm rounded-lg font-medium">
                        {error}
                    </div>
                )}

                <textarea
                    required
                    // On grise le champ si approuvé OU en attente de review
                    disabled={busy || isPending || isApproved || !canRequestFeedback}
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Type or paste your code/answer here..."
                    aria-labelledby="exercise-title"
                    spellCheck={false}
                    className="w-full min-h-[200px] p-4 rounded-lg border border-ui-ink bg-ui-ink focus:ring-2 focus:ring-ui-accent/40 outline-none transition-all font-mono text-[13px] leading-relaxed text-slate-100 placeholder:text-slate-500 resize-y disabled:opacity-70"
                />

                <div className="flex flex-wrap items-center justify-between gap-3">
                    {/* Messages informatifs selon l'état */}
                    {isPending && (
                        <p className="text-[13px] text-amber-800 flex items-center">
                            <AlertCircle className="h-4 w-4 mr-1.5" />
                            Your solution has been sent to your instructor.
                        </p>
                    )}

                    {isApproved && (
                        <div className="flex items-center text-emerald-800 text-sm font-semibold bg-emerald-50 px-3 py-2 rounded-lg w-fit ml-auto">
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Exercise approved
                        </div>
                    )}

                    {/* Plus de correction incluse : on explique pourquoi l'envoi est indisponible */}
                    {!canRequestFeedback && !isApproved && !isPending && (
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:justify-between">
                            <p className="text-sm text-slate-600 flex items-start gap-2">
                                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0 text-slate-400" />
                                Submitting exercises for review isn&apos;t included in your current plan. Upgrade to have your exercises reviewed by your instructor.
                            </p>
                            <SubscribeButton className="shrink-0 rounded-lg shadow-none" />
                        </div>
                    )}

                    {/* Bouton d'envoi affiché uniquement si ni en attente ni approuvé */}
                    {canRequestFeedback && !isApproved && !isPending && (
                        <div className="ml-auto">
                            <Button
                                type="submit"
                                disabled={busy || !answer.trim()}
                                className="bg-ui-ink hover:bg-ui-ink-hover text-white rounded-lg px-5 h-[42px] font-semibold"
                            >
                                {busy ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <Send className="h-4 w-4 mr-2" />
                                )}
                                Submit for review
                            </Button>
                        </div>
                    )}
                </div>
            </form>
        </section>
    );
}