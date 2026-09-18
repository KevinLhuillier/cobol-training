"use client";

import { ChevronUp, ChevronDown, Trash2, Plus, HelpCircle } from "lucide-react";
import { AnswerRow } from "./answer-row";
import type { QuizAnswer, QuizQuestion, QuizQuestionType } from "./types";

function createAnswerId() {
    return typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2);
}

interface QuestionEditorProps {
    question: QuizQuestion;
    index: number;
    onChange: (patch: Partial<QuizQuestion>) => void;
    onDelete: () => void;
    onMoveUp: () => void;
    onMoveDown: () => void;
    isFirst: boolean;
    isLast: boolean;
}

export function QuestionEditor({
    question,
    index,
    onChange,
    onDelete,
    onMoveUp,
    onMoveDown,
    isFirst,
    isLast,
}: QuestionEditorProps) {
    const updateAnswer = (answerId: string, patch: Partial<QuizAnswer>) => {
        onChange({
            answers: question.answers.map((answer) =>
                answer.id === answerId ? { ...answer, ...patch } : answer
            ),
        });
    };

    const setAnswerCorrect = (answerId: string, isCorrect: boolean) => {
        if (question.type === "SINGLE_CHOICE") {
            // Une seule bonne réponse possible : cocher celle-ci décoche toutes les autres.
            onChange({
                answers: question.answers.map((answer) => ({
                    ...answer,
                    isCorrect: answer.id === answerId,
                })),
            });
        } else {
            updateAnswer(answerId, { isCorrect });
        }
    };

    const onTypeChange = (type: QuizQuestionType) => {
        if (type === "SINGLE_CHOICE") {
            // Contrainte à choix unique : ne garde que la première bonne réponse cochée.
            const firstCorrectIndex = question.answers.findIndex((a) => a.isCorrect);
            onChange({
                type,
                answers: question.answers.map((answer, i) => ({
                    ...answer,
                    isCorrect: i === firstCorrectIndex,
                })),
            });
        } else {
            onChange({ type });
        }
    };

    const addAnswer = () => {
        onChange({
            answers: [...question.answers, { id: createAnswerId(), text: "", isCorrect: false }],
        });
    };

    const deleteAnswer = (answerId: string) => {
        onChange({ answers: question.answers.filter((a) => a.id !== answerId) });
    };

    const moveAnswer = (answerIndex: number, direction: -1 | 1) => {
        const target = answerIndex + direction;
        if (target < 0 || target >= question.answers.length) return;
        const next = [...question.answers];
        [next[answerIndex], next[target]] = [next[target], next[answerIndex]];
        onChange({ answers: next });
    };

    return (
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
                <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    <HelpCircle className="h-3.5 w-3.5" />
                    Question {index + 1}
                </span>
                <div className="flex items-center gap-1">
                    <button
                        type="button"
                        onClick={onMoveUp}
                        disabled={isFirst}
                        className="h-7 w-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronUp className="h-4 w-4" />
                    </button>
                    <button
                        type="button"
                        onClick={onMoveDown}
                        disabled={isLast}
                        className="h-7 w-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronDown className="h-4 w-4" />
                    </button>
                    <button
                        type="button"
                        onClick={onDelete}
                        className="h-7 w-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            </div>

            <div className="space-y-3">
                <div className="flex flex-col sm:flex-row gap-2">
                    <input
                        type="text"
                        value={question.text}
                        onChange={(e) => onChange({ text: e.target.value })}
                        placeholder="Question text"
                        className="flex-1 h-9 px-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none text-sm font-medium text-slate-900"
                    />
                    <select
                        value={question.type}
                        onChange={(e) => onTypeChange(e.target.value as QuizQuestionType)}
                        className="h-9 px-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none text-sm font-medium text-slate-900 shrink-0"
                    >
                        <option value="SINGLE_CHOICE">Single choice</option>
                        <option value="MULTIPLE_CHOICE">Multiple choice</option>
                    </select>
                </div>

                <div className="space-y-2 pl-1">
                    {question.answers.map((answer, answerIndex) => (
                        <AnswerRow
                            key={answer.id}
                            answer={answer}
                            questionType={question.type}
                            questionId={question.id}
                            onChange={(patch) => updateAnswer(answer.id, patch)}
                            onToggleCorrect={(isCorrect) => setAnswerCorrect(answer.id, isCorrect)}
                            onDelete={() => deleteAnswer(answer.id)}
                            onMoveUp={() => moveAnswer(answerIndex, -1)}
                            onMoveDown={() => moveAnswer(answerIndex, 1)}
                            isFirst={answerIndex === 0}
                            isLast={answerIndex === question.answers.length - 1}
                        />
                    ))}
                </div>

                <button
                    type="button"
                    onClick={addAnswer}
                    className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors pl-1"
                >
                    <Plus className="h-3.5 w-3.5" />
                    Add answer
                </button>
            </div>
        </div>
    );
}
