"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle, RotateCcw, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { createClient } from "@/utils/supabase/client";
import type { QuizAttempt, QuizQuestion } from "./types";

interface QuizPlayerProps {
    courseId: string;
    chapterId: string;
    lessonId: string;
    questions: QuizQuestion[];
    passRate: number;
    attempts: QuizAttempt[];
    isCompleted: boolean;
    nextLessonId?: string;
}

interface LastResult {
    score: number;
    total: number;
    passed: boolean;
    selections: Record<string, string[]>;
}

function isQuestionCorrect(question: QuizQuestion, selectedIds: string[]): boolean {
    const selected = new Set(selectedIds);
    const correct = new Set(question.answers.filter((a) => a.isCorrect).map((a) => a.id));
    if (selected.size !== correct.size) return false;
    return [...selected].every((id) => correct.has(id));
}

export function QuizPlayer({
    courseId,
    chapterId,
    lessonId,
    questions,
    passRate,
    attempts,
    isCompleted,
    nextLessonId,
}: QuizPlayerProps) {
    const router = useRouter();
    const supabase = createClient();

    const [selections, setSelections] = useState<Record<string, string[]>>({});
    const [lastResult, setLastResult] = useState<LastResult | null>(
        attempts[0] ? { score: attempts[0].score, total: attempts[0].total, passed: attempts[0].passed, selections: {} } : null
    );
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isRetaking = lastResult === null;
    const allAnswered = questions.every((q) => (selections[q.id]?.length ?? 0) > 0);

    const onSelect = (question: QuizQuestion, answerId: string) => {
        setSelections((prev) => {
            const current = prev[question.id] ?? [];
            if (question.type === "SINGLE_CHOICE") {
                return { ...prev, [question.id]: [answerId] };
            }
            const next = current.includes(answerId)
                ? current.filter((id) => id !== answerId)
                : [...current, answerId];
            return { ...prev, [question.id]: next };
        });
    };

    const onSubmit = async () => {
        setError(null);
        setIsSubmitting(true);
        try {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (!user) throw new Error("You must be logged in to submit this quiz.");

            const score = questions.filter((q) => isQuestionCorrect(q, selections[q.id] ?? [])).length;
            const total = questions.length;
            const passed = total > 0 && (score / total) * 100 >= passRate;

            const { error: insertError } = await supabase.from("quiz_attempts").insert({
                lesson_id: lessonId,
                user_id: user.id,
                score,
                total,
                passed,
            });
            if (insertError) throw insertError;

            // Une réussite passée n'est jamais effacée par une tentative ratée ultérieure.
            const { error: upsertError } = await supabase
                .from("lesson_progress")
                .upsert(
                    { lesson_id: lessonId, user_id: user.id, is_completed: passed || isCompleted },
                    { onConflict: "user_id, lesson_id" }
                );
            if (upsertError) throw upsertError;

            setLastResult({ score, total, passed, selections });
            router.refresh();
        } catch (err) {
            console.error("Quiz submission error:", err);
            setError(err instanceof Error ? err.message : "An error occurred while submitting the quiz.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const onRetry = () => {
        setSelections({});
        setLastResult(null);
        setError(null);
    };

    if (questions.length === 0) {
        return (
            <div className="p-6 bg-slate-50 border border-slate-100 rounded-2xl">
                <p className="italic text-slate-500">This quiz has no questions yet.</p>
            </div>
        );
    }

    if (lastResult && !isRetaking) {
        const percentage = lastResult.total > 0 ? Math.round((lastResult.score / lastResult.total) * 100) : 0;
        return (
            <div className="space-y-6">
                <div
                    className={`rounded-2xl border p-6 flex items-center justify-between gap-4 flex-wrap ${
                        lastResult.passed ? "bg-emerald-50 border-emerald-100" : "bg-red-50 border-red-100"
                    }`}
                >
                    <div className="flex items-center gap-3">
                        {lastResult.passed ? (
                            <CheckCircle2 className="h-8 w-8 text-emerald-600 shrink-0" />
                        ) : (
                            <XCircle className="h-8 w-8 text-red-600 shrink-0" />
                        )}
                        <div>
                            <p className={`font-bold ${lastResult.passed ? "text-emerald-900" : "text-red-900"}`}>
                                {lastResult.passed ? "Quiz passed" : "Quiz failed"}
                            </p>
                            <p className={`text-sm ${lastResult.passed ? "text-emerald-700" : "text-red-700"}`}>
                                {lastResult.score} / {lastResult.total} correct answers ({percentage}%) — passing score: {passRate}%
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            onClick={onRetry}
                            className="rounded-xl border-slate-300 bg-white text-slate-700 hover:text-slate-900 hover:bg-slate-50"
                        >
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Retry quiz
                        </Button>
                        {nextLessonId && lastResult.passed && (
                            <Button
                                onClick={() => router.push(`/dashboard/courses/${courseId}?lessonId=${nextLessonId}`)}
                                className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-sm"
                            >
                                Continue
                                <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                        )}
                    </div>
                </div>

                <div className="bg-white border border-slate-100 rounded-2xl px-5">
                    <Accordion>
                        <AccordionItem value="correct-answers" className="border-none">
                            <AccordionTrigger className="text-sm font-bold text-slate-900 hover:no-underline">
                                Correct answers
                            </AccordionTrigger>
                            <AccordionContent>
                                <div className="space-y-5 pt-1">
                                    {questions.map((question, index) => (
                                        <div key={question.id} className="space-y-2">
                                            <p className="text-sm font-semibold text-slate-800">
                                                {index + 1}. {question.text}
                                            </p>
                                            <div className="space-y-1.5">
                                                {question.answers.map((answer) => (
                                                    <div key={answer.id}>
                                                        <div
                                                            className={`flex items-start gap-2 text-sm px-3 py-2 rounded-lg ${
                                                                answer.isCorrect
                                                                    ? "bg-emerald-50 text-emerald-800"
                                                                    : "bg-slate-50 text-slate-600"
                                                            }`}
                                                        >
                                                            {answer.isCorrect ? (
                                                                <CheckCircle2 className="h-4 w-4 mt-0.5 text-emerald-600 shrink-0" />
                                                            ) : (
                                                                <span className="h-4 w-4 shrink-0" />
                                                            )}
                                                            <span>{answer.text}</span>
                                                        </div>
                                                        {answer.isCorrect && answer.explanation && (
                                                            <p className="text-xs text-emerald-700/80 pl-9 pt-1">
                                                                {answer.explanation}
                                                            </p>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </div>

                {attempts.length > 0 && (
                    <div className="bg-white border border-slate-100 rounded-2xl p-5">
                        <p className="text-sm font-bold text-slate-900 mb-3">Attempt history</p>
                        <div className="space-y-1.5">
                            {attempts.map((attempt) => (
                                <div
                                    key={attempt.id}
                                    className="flex items-center justify-between text-sm px-3 py-2 rounded-lg bg-slate-50"
                                >
                                    <span className="text-slate-500">
                                        {new Date(attempt.createdAt).toLocaleString()}
                                    </span>
                                    <div className="flex items-center gap-3">
                                        <span className="font-medium text-slate-700">
                                            {attempt.score} / {attempt.total}
                                        </span>
                                        <span
                                            className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                                                attempt.passed
                                                    ? "bg-emerald-50 text-emerald-700"
                                                    : "bg-red-50 text-red-700"
                                            }`}
                                        >
                                            {attempt.passed ? "Passed" : "Failed"}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="bg-blue-50/50 border border-blue-100 rounded-xl px-4 py-3">
                <p className="text-sm text-blue-800">
                    Answer every question, then submit. You need <span className="font-bold">{passRate}%</span> correct
                    answers to pass — you can retry as many times as you like.
                </p>
            </div>

            {questions.map((question, index) => {
                const selected = selections[question.id] ?? [];
                return (
                    <div key={question.id} className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5">
                        <p className="font-bold text-slate-900 mb-3">
                            {index + 1}. {question.text}
                        </p>
                        <div className="space-y-2">
                            {question.answers.map((answer) => {
                                const isSelected = selected.includes(answer.id);
                                return (
                                    <label
                                        key={answer.id}
                                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border cursor-pointer transition-colors ${
                                            isSelected
                                                ? "border-slate-900 bg-slate-50"
                                                : "border-slate-200 hover:bg-slate-50"
                                        }`}
                                    >
                                        <input
                                            type={question.type === "SINGLE_CHOICE" ? "radio" : "checkbox"}
                                            name={question.id}
                                            checked={isSelected}
                                            onChange={() => onSelect(question, answer.id)}
                                            className="h-4 w-4 accent-slate-900"
                                        />
                                        <span className="text-sm text-slate-800">{answer.text}</span>
                                    </label>
                                );
                            })}
                        </div>
                    </div>
                );
            })}

            {error && (
                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 font-medium">
                    {error}
                </div>
            )}

            <div className="flex justify-end">
                <Button
                    onClick={onSubmit}
                    disabled={isSubmitting || !allAnswered}
                    size="lg"
                    className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-md"
                >
                    {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Submit quiz
                </Button>
            </div>
        </div>
    );
}
