"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ExerciseFormProps {
    courseId: string;
    chapterId: string;
    lessonId: string;
    initialAnswer?: string | null;
    isCompleted: boolean;
    nextLessonId?: string;
}

export function ExerciseForm({ courseId, chapterId, lessonId, initialAnswer, isCompleted, nextLessonId }: ExerciseFormProps) {
    const router = useRouter();
    const [answer, setAnswer] = useState(initialAnswer || "");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsLoading(true);
            setError("");

            // On réutilise la route de progression classique, mais on lui passe la réponse
            const response = await fetch(`/api/courses/${courseId}/chapters/${chapterId}/lessons/${lessonId}/progress`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    isCompleted: true,
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
            <h3 className="text-lg font-bold text-slate-900 mb-4">Your Solution</h3>

            <form onSubmit={onSubmit} className="space-y-4">
                {error && (
                    <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 font-medium">
                        {error}
                    </div>
                )}

                <textarea
                    required
                    disabled={isLoading || isCompleted}
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Type or paste your code/answer here..."
                    className="w-full min-h-[200px] p-4 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all font-mono text-sm text-slate-900 resize-y"
                />

                <div className="flex items-center justify-end">
                    {isCompleted ? (
                        <div className="flex items-center text-emerald-600 font-bold bg-emerald-50 px-4 py-2 rounded-xl">
                            <CheckCircle className="h-5 w-5 mr-2" />
                            Exercise Submitted
                        </div>
                    ) : (
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
                    )}
                </div>
            </form>
        </div>
    );
}