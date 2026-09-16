"use client";

import { Code2 } from "lucide-react";
import { BlockShell } from "./block-shell";
import { CodeBlockView } from "./code-block-view";
import { CODE_BLOCK_LANGUAGES } from "./prism-languages";
import type { CodeBlock, CodeBlockData } from "./types";

interface CodeBlockEditorProps {
    block: CodeBlock;
    onChange: (patch: Partial<CodeBlockData>) => void;
    onDelete: () => void;
    onMoveUp: () => void;
    onMoveDown: () => void;
    isFirst: boolean;
    isLast: boolean;
}

export function CodeBlockEditor({
    block,
    onChange,
    onDelete,
    onMoveUp,
    onMoveDown,
    isFirst,
    isLast,
}: CodeBlockEditorProps) {
    // Insère 2 espaces au curseur au lieu de faire sortir le focus du champ — utile pour du
    // COBOL/JCL, où l'indentation et les colonnes ont un sens.
    const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key !== "Tab") return;
        e.preventDefault();

        const textarea = e.currentTarget;
        const { selectionStart, selectionEnd, value } = textarea;
        const nextValue = `${value.slice(0, selectionStart)}  ${value.slice(selectionEnd)}`;
        onChange({ code: nextValue });

        requestAnimationFrame(() => {
            textarea.selectionStart = textarea.selectionEnd = selectionStart + 2;
        });
    };

    return (
        <BlockShell
            icon={Code2}
            label="Code"
            onDelete={onDelete}
            onMoveUp={onMoveUp}
            onMoveDown={onMoveDown}
            isFirst={isFirst}
            isLast={isLast}
        >
            <div className="space-y-3">
                <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1 w-fit">
                    {CODE_BLOCK_LANGUAGES.map((option) => {
                        const isActive = block.data.language === option.value;
                        return (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => onChange({ language: option.value })}
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

                <textarea
                    value={block.data.code}
                    onChange={(e) => onChange({ code: e.target.value })}
                    onKeyDown={onKeyDown}
                    placeholder="Paste or type your code here..."
                    spellCheck={false}
                    rows={8}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none text-slate-900 text-sm font-mono p-4 resize-y"
                />

                {block.data.code && (
                    <CodeBlockView code={block.data.code} language={block.data.language} />
                )}
            </div>
        </BlockShell>
    );
}
