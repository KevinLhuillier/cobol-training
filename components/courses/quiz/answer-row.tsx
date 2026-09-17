"use client";

import { useState } from "react";
import { ChevronUp, ChevronDown, MoreVertical, MessageSquarePlus, Trash2, X } from "lucide-react";
import {
    Popover,
    PopoverTrigger,
    PopoverPortal,
    PopoverPositioner,
    PopoverPopup,
} from "@/components/ui/popover";
import type { QuizAnswer, QuizQuestionType } from "./types";

interface AnswerRowProps {
    answer: QuizAnswer;
    questionType: QuizQuestionType;
    questionId: string;
    onChange: (patch: Partial<QuizAnswer>) => void;
    onToggleCorrect: (isCorrect: boolean) => void;
    onDelete: () => void;
    onMoveUp: () => void;
    onMoveDown: () => void;
    isFirst: boolean;
    isLast: boolean;
}

export function AnswerRow({
    answer,
    questionType,
    questionId,
    onChange,
    onToggleCorrect,
    onDelete,
    onMoveUp,
    onMoveDown,
    isFirst,
    isLast,
}: AnswerRowProps) {
    const [menuOpen, setMenuOpen] = useState(false);
    const [showExplanation, setShowExplanation] = useState(!!answer.explanation);

    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2">
                <input
                    type={questionType === "SINGLE_CHOICE" ? "radio" : "checkbox"}
                    name={questionType === "SINGLE_CHOICE" ? `correct-${questionId}` : undefined}
                    checked={answer.isCorrect}
                    onChange={(e) => onToggleCorrect(e.target.checked)}
                    className="h-4 w-4 shrink-0 accent-emerald-600"
                    title="Mark as correct answer"
                />

                <input
                    type="text"
                    value={answer.text}
                    onChange={(e) => onChange({ text: e.target.value })}
                    placeholder="Answer text"
                    className="flex-1 h-8 px-2 rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none text-sm text-slate-900"
                />

                <div className="flex items-center gap-0.5 shrink-0">
                    <button
                        type="button"
                        onClick={onMoveUp}
                        disabled={isFirst}
                        className="h-7 w-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                        type="button"
                        onClick={onMoveDown}
                        disabled={isLast}
                        className="h-7 w-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronDown className="h-3.5 w-3.5" />
                    </button>

                    <Popover open={menuOpen} onOpenChange={setMenuOpen}>
                        <PopoverTrigger className="h-7 w-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer">
                            <MoreVertical className="h-3.5 w-3.5" />
                        </PopoverTrigger>
                        <PopoverPortal>
                            <PopoverPositioner side="bottom" align="end" sideOffset={4}>
                                <PopoverPopup className="w-56 p-1.5">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowExplanation(true);
                                            setMenuOpen(false);
                                        }}
                                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-white hover:bg-white/10 transition-colors cursor-pointer"
                                    >
                                        <MessageSquarePlus className="h-4 w-4" />
                                        {answer.explanation ? "Edit explanation" : "Add explanation"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setMenuOpen(false);
                                            onDelete();
                                        }}
                                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-red-400 hover:bg-white/10 transition-colors cursor-pointer"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        Delete answer
                                    </button>
                                </PopoverPopup>
                            </PopoverPositioner>
                        </PopoverPortal>
                    </Popover>
                </div>
            </div>

            {showExplanation && (
                <div className="ml-6 flex items-start gap-2">
                    <textarea
                        value={answer.explanation ?? ""}
                        onChange={(e) => onChange({ explanation: e.target.value })}
                        placeholder="Explanation shown to students after they answer (optional)"
                        rows={2}
                        className="flex-1 px-3 py-2 rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none text-sm text-slate-700 resize-y"
                    />
                    <button
                        type="button"
                        onClick={() => {
                            setShowExplanation(false);
                            onChange({ explanation: undefined });
                        }}
                        className="h-8 w-8 shrink-0 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Remove explanation"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            )}
        </div>
    );
}
