"use client";

import { Minus } from "lucide-react";
import { BlockShell } from "./block-shell";
import { DividerBlockView } from "./divider-block-view";
import { DIVIDER_MAX_MARGIN, DIVIDER_SHAPE_OPTIONS, dividerMargin } from "./divider-style";
import type { DividerBlock, DividerBlockData } from "./types";

interface DividerBlockEditorProps {
    block: DividerBlock;
    onChange: (patch: Partial<DividerBlockData>) => void;
    onDelete: () => void;
    onMoveUp: () => void;
    onMoveDown: () => void;
    isFirst: boolean;
    isLast: boolean;
}

export function DividerBlockEditor({
    block,
    onChange,
    onDelete,
    onMoveUp,
    onMoveDown,
    isFirst,
    isLast,
}: DividerBlockEditorProps) {
    const marginFields: { id: string; label: string; key: "marginTop" | "marginBottom" }[] = [
        { id: `divider-margin-top-${block.id}`, label: "Margin top (px)", key: "marginTop" },
        { id: `divider-margin-bottom-${block.id}`, label: "Margin bottom (px)", key: "marginBottom" },
    ];

    return (
        <BlockShell
            icon={Minus}
            label="Divider"
            onDelete={onDelete}
            onMoveUp={onMoveUp}
            onMoveDown={onMoveDown}
            isFirst={isFirst}
            isLast={isLast}
        >
            <div className="space-y-3">
                <div className="flex flex-wrap items-end gap-3">
                    <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1 w-fit">
                        {DIVIDER_SHAPE_OPTIONS.map((option) => {
                            const isActive = block.data.shape === option.value;
                            return (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => onChange({ shape: option.value })}
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

                    {marginFields.map((field) => (
                        <div key={field.key} className="space-y-1">
                            <label htmlFor={field.id} className="block text-[11px] font-bold text-slate-500">
                                {field.label}
                            </label>
                            <input
                                id={field.id}
                                type="number"
                                min={0}
                                max={DIVIDER_MAX_MARGIN}
                                step={1}
                                value={dividerMargin(block.data[field.key])}
                                onChange={(e) => onChange({ [field.key]: dividerMargin(parseInt(e.target.value, 10)) })}
                                className="w-28 h-9 px-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none text-slate-900 text-sm"
                            />
                        </div>
                    ))}
                </div>

                <p className="text-xs text-slate-400">
                    Margins are added to the default spacing between blocks (max {DIVIDER_MAX_MARGIN}px).
                </p>

                <div className="rounded-xl bg-slate-50 border border-dashed border-slate-200">
                    <DividerBlockView data={block.data} />
                </div>
            </div>
        </BlockShell>
    );
}
