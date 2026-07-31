"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send, Loader2, CheckCircle, Clock, AlertCircle } from "lucide-react"; // 🟢 Ajout de Clock et AlertCircle
import { Button } from "@/components/ui/button";

interface ExerciseFormProps {
    courseId: string;
    chapterId: string;
    lessonId: string;
    initialAnswer?: string | null;
    isCompleted: boolean;
    nextLessonId?: string;
    exerciseStatus?: string | null;
    reviewFeedback?: string | null;
}

export function ExerciseForm({ courseId, chapterId, lessonId, initialAnswer, isCompleted, nextLessonId, exerciseStatus, reviewFeedback }: ExerciseFormProps) {
    const router = useRouter();
    const [answer, setAnswer] = useState(initialAnswer || "");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    // 🟢 Calcul de l'état actuel de l'exercice
    const isPending = exerciseStatus === "PENDING_REVIEW";
    const isApproved = exerciseStatus === "APPROVED" || isCompleted;

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsLoading(true);
            setError("");

            // 🟢 On passe uniquement la réponse, l'API gère isCompleted et le statut "PENDING_REVIEW"
            const response = await fetch(`/api/courses/${courseId}/chapters/${chapterId}/lessons/${lessonId}/progress`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    exerciseAnswer: answer
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to submit exercise.");
            }

            if (nextLessonId) {
                router.push(`/dashboard/courses/${courseId}?lessonId=${nextLessonId}`);
            }

            router.refresh();
        } catch (err) {
            if (err instanceof Error) setError(err.message);
            else setError("An unexpected error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="mt-8 bg-slate-50 border border-slate-100 rounded-2xl p-6">
            {/* 🟢 En-tête avec statuts */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900">Your Solution</h3>

                {isApproved ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                        <CheckCircle className="h-3.5 w-3.5 mr-1.5" /> Approved
                    </span>
                ) : isPending ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-100">
                        <Clock className="h-3.5 w-3.5 mr-1.5" /> Review Pending
                    </span>
                ) : (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-slate-200 text-slate-700">
                        Not Submitted
                    </span>
                )}
            </div>

            {reviewFeedback && (
                <div className="mb-6 p-4 bg-blue-50/50 border border-blue-100 rounded-xl relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
                    <h4 className="text-sm font-bold text-blue-900 flex items-center mb-1">
                        Formateur
                    </h4>
                    <p className="text-sm text-blue-800 whitespace-pre-wrap">
                        {reviewFeedback}
                    </p>
                </div>
            )}

            <form onSubmit={onSubmit} className="space-y-4">
                {error && (
                    <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 font-medium">
                        {error}
                    </div>
                )}

                <textarea
                    required
                    // 🟢 On grise le champ si approuvé OU en attente de review
                    disabled={isLoading || isPending || isApproved}
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Type or paste your code/answer here..."
                    className="w-full min-h-[200px] p-4 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all font-mono text-sm text-slate-900 resize-y disabled:bg-slate-100 disabled:text-slate-500"
                />

                <div className="flex items-center justify-between">
                    {/* 🟢 Messages informatifs selon l'état */}
                    {isPending && (
                        <p className="text-xs text-amber-600 font-medium flex items-center">
                            <AlertCircle className="h-4 w-4 mr-1.5" />
                            Your solution has been sent to your instructor.
                        </p>
                    )}

                    {isApproved && (
                        <div className="flex items-center text-emerald-600 font-bold bg-emerald-50 px-4 py-2 rounded-xl w-fit ml-auto">
                            <CheckCircle className="h-5 w-5 mr-2" />
                            Exercise Approved
                        </div>
                    )}

                    {/* 🟢 Bouton d'envoi affiché uniquement si ni en attente ni approuvé */}
                    {!isApproved && !isPending && (
                        <div className="ml-auto">
                            <Button
                                type="submit"
                                disabled={isLoading || !answer.trim()}
                                className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-sm px-6 h-11"
                            >
                                {isLoading ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <Send className="h-4 w-4 mr-2" />
                                )}
                                Submit Exercise
                            </Button>
                        </div>
                    )}
                </div>
            </form>
        </div>
    );
}