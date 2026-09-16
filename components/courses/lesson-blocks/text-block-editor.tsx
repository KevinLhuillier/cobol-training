"use client";

import { Type } from "lucide-react";
import { Editor } from "@/components/editor";
import { BlockShell } from "./block-shell";
import type { TextBlock } from "./types";

interface TextBlockEditorProps {
    block: TextBlock;
    onChange: (html: string) => void;
    onDelete: () => void;
    onMoveUp: () => void;
    onMoveDown: () => void;
    isFirst: boolean;
    isLast: boolean;
}

export function TextBlockEditor({
    block,
    onChange,
    onDelete,
    onMoveUp,
    onMoveDown,
    isFirst,
    isLast,
}: TextBlockEditorProps) {
    return (
        <BlockShell
            icon={Type}
            label="Text"
            onDelete={onDelete}
            onMoveUp={onMoveUp}
            onMoveDown={onMoveDown}
            isFirst={isFirst}
            isLast={isLast}
        >
            <Editor value={block.data.html} onChange={onChange} />
        </BlockShell>
    );
}
