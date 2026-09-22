"use client";

import { Lightbulb } from "lucide-react";
import { BlockShell } from "./block-shell";
import { BlockPalette } from "./block-palette";
import { TextBlockEditor } from "./text-block-editor";
import { ImageBlockEditor } from "./image-block-editor";
import { CodeBlockEditor } from "./code-block-editor";
import { VideoBlockEditor } from "./video-block-editor";
import { CalloutBlockEditor } from "./callout-block-editor";
import { DividerBlockEditor } from "./divider-block-editor";
import { DIVIDER_DEFAULT_DATA } from "./divider-style";
import { createBlockId } from "./create-block-id";
import type {
    CalloutBlockData,
    CodeBlockData,
    DividerBlockData,
    ImageBlockData,
    LessonBlock,
    LessonBlockType,
    SolutionBlock,
    SolutionBlockData,
    VideoBlockData,
} from "./types";

interface SolutionBlockEditorProps {
    block: SolutionBlock;
    onChange: (patch: Partial<SolutionBlockData>) => void;
    onDelete: () => void;
    onMoveUp: () => void;
    onMoveDown: () => void;
    isFirst: boolean;
    isLast: boolean;
}

// Éditeur du bloc "Solution" : un conteneur affiché/caché côté élève (flèche déroulante, cf.
// solution-block-view.tsx) qui embarque sa propre liste de blocs enfants. Il reprend les mêmes
// éditeurs de composants que le canvas principal (lesson-builder.tsx) — à l'exception du bloc
// Solution lui-même, volontairement absent de la palette imbriquée pour interdire l'imbrication.
export function SolutionBlockEditor({
    block,
    onChange,
    onDelete,
    onMoveUp,
    onMoveDown,
    isFirst,
    isLast,
}: SolutionBlockEditorProps) {
    const children = block.data.blocks;

    const setChildren = (next: LessonBlock[]) => onChange({ blocks: next });

    const addChildBlock = (type: LessonBlockType) => {
        if (type === "text") {
            setChildren([...children, { id: createBlockId(), type: "text", data: { html: "" } }]);
        } else if (type === "image") {
            setChildren([...children, { id: createBlockId(), type: "image", data: { url: "", alt: "", size: "full" } }]);
        } else if (type === "code") {
            setChildren([...children, { id: createBlockId(), type: "code", data: { code: "", language: "cobol" } }]);
        } else if (type === "video") {
            setChildren([...children, { id: createBlockId(), type: "video", data: { url: "" } }]);
        } else if (type === "callout") {
            setChildren([
                ...children,
                { id: createBlockId(), type: "callout", data: { variant: "info", title: "", content: "" } },
            ]);
        } else if (type === "divider") {
            setChildren([...children, { id: createBlockId(), type: "divider", data: { ...DIVIDER_DEFAULT_DATA } }]);
        }
    };

    const updateChildData = (id: string, patch: Record<string, unknown>) => {
        setChildren(
            children.map((child) => (child.id === id ? ({ ...child, data: { ...child.data, ...patch } } as LessonBlock) : child))
        );
    };

    const deleteChildBlock = (id: string) => {
        setChildren(children.filter((child) => child.id !== id));
    };

    const moveChildBlock = (index: number, direction: -1 | 1) => {
        const target = index + direction;
        if (target < 0 || target >= children.length) return;
        const next = [...children];
        [next[index], next[target]] = [next[target], next[index]];
        setChildren(next);
    };

    return (
        <BlockShell
            icon={Lightbulb}
            label="Solution"
            onDelete={onDelete}
            onMoveUp={onMoveUp}
            onMoveDown={onMoveDown}
            isFirst={isFirst}
            isLast={isLast}
        >
            <div className="space-y-4">
                <div className="space-y-1">
                    <label htmlFor={`solution-title-${block.id}`} className="block text-[11px] font-bold text-slate-500">
                        Toggle label
                    </label>
                    <input
                        id={`solution-title-${block.id}`}
                        type="text"
                        value={block.data.title}
                        onChange={(e) => onChange({ title: e.target.value })}
                        placeholder="Show solution"
                        className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none text-slate-900 text-sm font-medium"
                    />
                </div>

                <p className="text-xs text-slate-400">
                    Only shown to students once their submission for this exercise is approved. Add any
                    component below to build the solution.
                </p>

                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 p-4 space-y-4">
                    {children.length === 0 ? (
                        <p className="text-xs text-slate-400 text-center py-4">No content yet in this solution.</p>
                    ) : (
                        children.map((child, index) => {
                            const sharedProps = {
                                onDelete: () => deleteChildBlock(child.id),
                                onMoveUp: () => moveChildBlock(index, -1),
                                onMoveDown: () => moveChildBlock(index, 1),
                                isFirst: index === 0,
                                isLast: index === children.length - 1,
                            };

                            if (child.type === "image") {
                                return (
                                    <ImageBlockEditor
                                        key={child.id}
                                        block={child}
                                        onChange={(patch: Partial<ImageBlockData>) => updateChildData(child.id, patch)}
                                        {...sharedProps}
                                    />
                                );
                            }

                            if (child.type === "code") {
                                return (
                                    <CodeBlockEditor
                                        key={child.id}
                                        block={child}
                                        onChange={(patch: Partial<CodeBlockData>) => updateChildData(child.id, patch)}
                                        {...sharedProps}
                                    />
                                );
                            }

                            if (child.type === "video") {
                                return (
                                    <VideoBlockEditor
                                        key={child.id}
                                        block={child}
                                        onChange={(patch: Partial<VideoBlockData>) => updateChildData(child.id, patch)}
                                        {...sharedProps}
                                    />
                                );
                            }

                            if (child.type === "callout") {
                                return (
                                    <CalloutBlockEditor
                                        key={child.id}
                                        block={child}
                                        onChange={(patch: Partial<CalloutBlockData>) => updateChildData(child.id, patch)}
                                        {...sharedProps}
                                    />
                                );
                            }

                            if (child.type === "divider") {
                                return (
                                    <DividerBlockEditor
                                        key={child.id}
                                        block={child}
                                        onChange={(patch: Partial<DividerBlockData>) => updateChildData(child.id, patch)}
                                        {...sharedProps}
                                    />
                                );
                            }

                            if (child.type === "solution") {
                                // Ne devrait jamais arriver (palette imbriquée sans cette entrée) — filet
                                // de sécurité si des données existantes contenaient déjà une imbrication.
                                return null;
                            }

                            return (
                                <TextBlockEditor
                                    key={child.id}
                                    block={child}
                                    onChange={(html: string) => updateChildData(child.id, { html })}
                                    {...sharedProps}
                                />
                            );
                        })
                    )}

                    <div>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                            Add to solution
                        </p>
                        <BlockPalette onAddBlock={addChildBlock} />
                    </div>
                </div>
            </div>
        </BlockShell>
    );
}
