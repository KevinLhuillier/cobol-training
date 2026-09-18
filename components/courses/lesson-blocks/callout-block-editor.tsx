"use client";

import { Info } from "lucide-react";
import { BlockShell } from "./block-shell";
import { CalloutBlockView } from "./callout-block-view";
import { CALLOUT_ALIGN_OPTIONS, CALLOUT_VARIANT_OPTIONS } from "./callout-style";
import type { CalloutBlock, CalloutBlockData } from "./types";

interface CalloutBlockEditorProps {
    block: CalloutBlock;
    onChange: (patch: Partial<CalloutBlockData>) => void;
    onDelete: () => void;
    onMoveUp: () => void;
    onMoveDown: () => void;
    isFirst: boolean;
    isLast: boolean;
}

export function CalloutBlockEditor({
    block,
    onChange,
    onDelete,
    onMoveUp,
    onMoveDown,
    isFirst,
    isLast,
}: CalloutBlockEditorProps) {
    return (
        <BlockShell
            icon={Info}
            label="Info block"
            onDelete={onDelete}
            onMoveUp={onMoveUp}
            onMoveDown={onMoveDown}
            isFirst={isFirst}
            isLast={isLast}
        >
            <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1 w-fit">
                        {CALLOUT_VARIANT_OPTIONS.map((option) => {
                            const isActive = block.data.variant === option.value;
                            return (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => onChange({ variant: option.value })}
                                    className={`h-7 px-3 rounded-md text-xs font-bold transition-colors ${
                                        isActive
                                            ? "bg-white text-slate-900 shadow-sm"
                                            : "text-slate-500 hover:text-slate-900"
                                    }`}
                                >
                                    {option.label}
                                </button>
                            );
                        })}
                    </div>

                    <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1 w-fit">
                        {CALLOUT_ALIGN_OPTIONS.map((option) => {
                            const isActive = (block.data.align ?? "left") === option.value;
                            return (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => onChange({ align: option.value })}
                                    className={`h-7 px-3 rounded-md text-xs font-bold transition-colors ${
                                        isActive
                                            ? "bg-white text-slate-900 shadow-sm"
                                            : "text-slate-500 hover:text-slate-900"
                                    }`}
                                >
                                    {option.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <input
                    type="text"
                    value={block.data.title}
                    onChange={(e) => onChange({ title: e.target.value })}
                    placeholder="Title"
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none text-slate-900 text-sm font-medium"
                />

                <textarea
                    value={block.data.content}
                    onChange={(e) => onChange({ content: e.target.value })}
                    placeholder="Content"
                    rows={3}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none text-slate-900 text-sm p-3 resize-y"
                />

                {(block.data.title || block.data.content) && <CalloutBlockView data={block.data} />}
            </div>
        </BlockShell>
    );
}
