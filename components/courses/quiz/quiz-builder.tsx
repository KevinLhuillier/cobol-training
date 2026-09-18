"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { HelpCircle, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import { QuestionEditor } from "./question-editor";
import type { QuizQuestion } from "./types";

function createQuestionId() {
    return typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2);
}

function createAnswerId() {
    return typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2);
}

function validateQuestions(questions: QuizQuestion[]): string | null {
    if (questions.length === 0) return "Add at least one question before saving.";

    for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        if (!q.text.trim()) return `Question ${i + 1} is missing its text.`;
        if (q.answers.length < 2) return `Question ${i + 1} needs at least two answers.`;
        if (q.answers.some((a) => !a.text.trim())) return `Question ${i + 1} has an empty answer.`;

        const correctCount = q.answers.filter((a) => a.isCorrect).length;
        if (correctCount === 0) return `Question ${i + 1} needs at least one correct answer.`;
        if (q.type === "SINGLE_CHOICE" && correctCount > 1) {
            return `Question ${i + 1} is single choice but has several correct answers.`;
        }
    }

    return null;
}

interface QuizBuilderProps {
    initialQuestions: QuizQuestion[];
    initialPassRate: number;
    chapterId: string;
    lessonId: string;
}

export function QuizBuilder({ initialQuestions, initialPassRate, chapterId, lessonId }: QuizBuilderProps) {
    const router = useRouter();
    const supabase = createClient();

    const [questions, setQuestions] = useState<QuizQuestion[]>(initialQuestions);
    const [passRate, setPassRate] = useState(initialPassRate);
    const [isDirty, setIsDirty] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const addQuestion = () => {
        setQuestions((prev) => [
            ...prev,
            {
                id: createQuestionId(),
                type: "SINGLE_CHOICE",
                text: "",
                answers: [
                    { id: createAnswerId(), text: "", isCorrect: false },
                    { id: createAnswerId(), text: "", isCorrect: false },
                ],
            },
        ]);
        setIsDirty(true);
    };

    const updateQuestion = (id: string, patch: Partial<QuizQuestion>) => {
        setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, ...patch } : q)));
        setIsDirty(true);
    };

    const deleteQuestion = (id: string) => {
        setQuestions((prev) => prev.filter((q) => q.id !== id));
        setIsDirty(true);
    };

    const moveQuestion = (index: number, direction: -1 | 1) => {
        setQuestions((prev) => {
            const target = index + direction;
            if (target < 0 || target >= prev.length) return prev;
            const next = [...prev];
            [next[index], next[target]] = [next[target], next[index]];
            return next;
        });
        setIsDirty(true);
    };

    const onPassRateChange = (value: number) => {
        setPassRate(Math.min(100, Math.max(0, value)));
        setIsDirty(true);
    };

    const onSave = async () => {
        setError(null);

        const validationError = validateQuestions(questions);
        if (validationError) {
            setError(validationError);
            return;
        }

        setIsSaving(true);
        try {
            const { error: updateError } = await supabase
                .from("lessons")
                .update({ quiz_questions: questions, quiz_pass_rate: passRate })
                .eq("id", lessonId)
                .eq("chapter_id", chapterId); // Sécurité

            if (updateError) throw updateError;

            setIsDirty(false);
            router.refresh();
        } catch (err) {
            console.error("Quiz update error:", err);
            setError("An error occurred while saving the quiz.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3">
                <div>
                    <p className="text-sm font-bold text-slate-900">Passing score</p>
                    <p className="text-xs text-slate-500">Minimum percentage of correct answers required to pass this quiz.</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                    <input
                        type="number"
                        min={0}
                        max={100}
                        value={passRate}
                        onChange={(e) => onPassRateChange(Number(e.target.value))}
                        className="w-16 h-9 px-2 text-center rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none text-sm font-bold text-slate-900"
                    />
                    <span className="text-sm font-bold text-slate-500">%</span>
                </div>
            </div>

            {questions.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center py-16 border-2 border-dashed border-slate-200 rounded-2xl">
                    <HelpCircle className="h-8 w-8 text-slate-300 mb-3" />
                    <p className="text-sm font-medium text-slate-500">No questions yet</p>
                    <p className="text-xs text-slate-400 mt-1">Add a question to build this quiz.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {questions.map((question, index) => (
                        <QuestionEditor
                            key={question.id}
                            question={question}
                            index={index}
                            onChange={(patch) => updateQuestion(question.id, patch)}
                            onDelete={() => deleteQuestion(question.id)}
                            onMoveUp={() => moveQuestion(index, -1)}
                            onMoveDown={() => moveQuestion(index, 1)}
                            isFirst={index === 0}
                            isLast={index === questions.length - 1}
                        />
                    ))}
                </div>
            )}

            <button
                type="button"
                onClick={addQuestion}
                className="flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors"
            >
                <Plus className="h-4 w-4" />
                Add question
            </button>

            <div className="flex items-center gap-3 pt-2">
                <Button
                    onClick={onSave}
                    disabled={isSaving || !isDirty}
                    className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-sm"
                >
                    {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Save quiz
                </Button>
                {error && <p className="text-sm text-red-500 font-medium">{error}</p>}
            </div>
        </div>
    );
}
