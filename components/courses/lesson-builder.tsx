"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import { deleteLessonImage } from "@/utils/lesson-image-storage";
import { BlockPalette } from "@/components/courses/lesson-blocks/block-palette";
import { TextBlockEditor } from "@/components/courses/lesson-blocks/text-block-editor";
import { ImageBlockEditor } from "@/components/courses/lesson-blocks/image-block-editor";
import { CodeBlockEditor } from "@/components/courses/lesson-blocks/code-block-editor";
import { VideoBlockEditor } from "@/components/courses/lesson-blocks/video-block-editor";
import { CalloutBlockEditor } from "@/components/courses/lesson-blocks/callout-block-editor";
import { DividerBlockEditor } from "@/components/courses/lesson-blocks/divider-block-editor";
import { SolutionBlockEditor } from "@/components/courses/lesson-blocks/solution-block-editor";
import { DIVIDER_DEFAULT_DATA } from "@/components/courses/lesson-blocks/divider-style";
import { createBlockId } from "@/components/courses/lesson-blocks/create-block-id";
import type {
    CalloutBlockData,
    CodeBlockData,
    DividerBlockData,
    ImageBlock,
    ImageBlockData,
    LessonBlock,
    LessonBlockType,
    SolutionBlockData,
    VideoBlockData,
} from "@/components/courses/lesson-blocks/types";

function isImageBlock(block: LessonBlock): block is ImageBlock {
    return block.type === "image";
}

function collectImageUrls(blocks: LessonBlock[]): Set<string> {
    return new Set(
        blocks
            .filter(isImageBlock)
            .map((block) => block.data.url)
            .filter(Boolean)
    );
}

interface LessonBuilderProps {
    initialBlocks: LessonBlock[];
    chapterId: string;
    lessonId: string;
    // Le bloc Solution n'est proposé dans la palette que sur les leçons de type "Exercise" —
    // c'est le seul type de leçon où l'élève a une soumission à faire approuver avant de la voir.
    lessonType?: "VIDEO" | "EXERCISE" | "QUIZ";
}

export function LessonBuilder({ initialBlocks, chapterId, lessonId, lessonType }: LessonBuilderProps) {
    const router = useRouter();
    const supabase = createClient();

    const [blocks, setBlocks] = useState<LessonBlock[]>(initialBlocks);
    const [isDirty, setIsDirty] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Images de la dernière version effectivement enregistrée en base — sert à détecter, à
    // la prochaine sauvegarde, quelles images ne sont plus référencées (bloc supprimé, ou image
    // remplacée) et doivent être nettoyées du bucket.
    const lastSavedImageUrlsRef = useRef(collectImageUrls(initialBlocks));

    const addBlock = (type: LessonBlockType) => {
        if (type === "text") {
            setBlocks((prev) => [...prev, { id: createBlockId(), type: "text", data: { html: "" } }]);
            setIsDirty(true);
        } else if (type === "image") {
            setBlocks((prev) => [...prev, { id: createBlockId(), type: "image", data: { url: "", alt: "", size: "full" } }]);
            setIsDirty(true);
        } else if (type === "code") {
            setBlocks((prev) => [...prev, { id: createBlockId(), type: "code", data: { code: "", language: "cobol" } }]);
            setIsDirty(true);
        } else if (type === "video") {
            setBlocks((prev) => [...prev, { id: createBlockId(), type: "video", data: { url: "" } }]);
            setIsDirty(true);
        } else if (type === "callout") {
            setBlocks((prev) => [
                ...prev,
                { id: createBlockId(), type: "callout", data: { variant: "info", title: "", content: "" } },
            ]);
            setIsDirty(true);
        } else if (type === "divider") {
            setBlocks((prev) => [...prev, { id: createBlockId(), type: "divider", data: { ...DIVIDER_DEFAULT_DATA } }]);
            setIsDirty(true);
        } else if (type === "solution") {
            setBlocks((prev) => [...prev, { id: createBlockId(), type: "solution", data: { title: "", blocks: [] } }]);
            setIsDirty(true);
        }
    };

    const updateTextBlock = (id: string, html: string) => {
        setBlocks((prev) =>
            prev.map((block) => (block.id === id && block.type === "text" ? { ...block, data: { ...block.data, html } } : block))
        );
        setIsDirty(true);
    };

    const updateImageBlock = (id: string, patch: Partial<ImageBlockData>) => {
        setBlocks((prev) =>
            prev.map((block) => (block.id === id && block.type === "image" ? { ...block, data: { ...block.data, ...patch } } : block))
        );
        setIsDirty(true);
    };

    const updateCodeBlock = (id: string, patch: Partial<CodeBlockData>) => {
        setBlocks((prev) =>
            prev.map((block) => (block.id === id && block.type === "code" ? { ...block, data: { ...block.data, ...patch } } : block))
        );
        setIsDirty(true);
    };

    const updateVideoBlock = (id: string, patch: Partial<VideoBlockData>) => {
        setBlocks((prev) =>
            prev.map((block) => (block.id === id && block.type === "video" ? { ...block, data: { ...block.data, ...patch } } : block))
        );
        setIsDirty(true);
    };

    const updateCalloutBlock = (id: string, patch: Partial<CalloutBlockData>) => {
        setBlocks((prev) =>
            prev.map((block) => (block.id === id && block.type === "callout" ? { ...block, data: { ...block.data, ...patch } } : block))
        );
        setIsDirty(true);
    };

    const updateDividerBlock = (id: string, patch: Partial<DividerBlockData>) => {
        setBlocks((prev) =>
            prev.map((block) => (block.id === id && block.type === "divider" ? { ...block, data: { ...block.data, ...patch } } : block))
        );
        setIsDirty(true);
    };

    const updateSolutionBlock = (id: string, patch: Partial<SolutionBlockData>) => {
        setBlocks((prev) =>
            prev.map((block) => (block.id === id && block.type === "solution" ? { ...block, data: { ...block.data, ...patch } } : block))
        );
        setIsDirty(true);
    };

    const deleteBlock = (id: string) => {
        setBlocks((prev) => prev.filter((block) => block.id !== id));
        setIsDirty(true);
    };

    const moveBlock = (index: number, direction: -1 | 1) => {
        setBlocks((prev) => {
            const target = index + direction;
            if (target < 0 || target >= prev.length) return prev;
            const next = [...prev];
            [next[index], next[target]] = [next[target], next[index]];
            return next;
        });
        setIsDirty(true);
    };

    const onSave = async () => {
        setIsSaving(true);
        setError(null);
        try {
            const { error: updateError } = await supabase
                .from("lessons")
                .update({ content_blocks: blocks })
                .eq("id", lessonId)
                .eq("chapter_id", chapterId); // Sécurité

            if (updateError) throw updateError;

            // Nettoyage best-effort des images qui ne sont plus référencées par la version qu'on
            // vient d'enregistrer (bloc supprimé, ou image remplacée dans un bloc existant) —
            // uniquement après le succès de la sauvegarde, pour ne jamais supprimer un fichier
            // encore référencé par la dernière version persistée si l'update échoue.
            const currentImageUrls = collectImageUrls(blocks);
            const orphanedUrls = [...lastSavedImageUrlsRef.current].filter((url) => !currentImageUrls.has(url));
            await Promise.all(
                orphanedUrls.map((url) =>
                    deleteLessonImage(url).catch((err) => console.error("Failed to delete orphaned lesson image:", url, err))
                )
            );
            lastSavedImageUrlsRef.current = currentImageUrls;

            setIsDirty(false);
            router.refresh();
        } catch (err) {
            console.error("Lesson content blocks update error:", err);
            setError("An error occurred while saving the lesson content.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="flex flex-col lg:flex-row gap-6">
            {/* CANVAS */}
            <div className="flex-1 min-w-0 space-y-4">
                {blocks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-center py-16 border-2 border-dashed border-slate-200 rounded-2xl">
                        <FileText className="h-8 w-8 text-slate-300 mb-3" />
                        <p className="text-sm font-medium text-slate-500">No content yet</p>
                        <p className="text-xs text-slate-400 mt-1">Add a component from the panel to get started.</p>
                    </div>
                ) : (
                    blocks.map((block, index) => {
                        const sharedProps = {
                            onDelete: () => deleteBlock(block.id),
                            onMoveUp: () => moveBlock(index, -1),
                            onMoveDown: () => moveBlock(index, 1),
                            isFirst: index === 0,
                            isLast: index === blocks.length - 1,
                        };

                        if (block.type === "image") {
                            return (
                                <ImageBlockEditor
                                    key={block.id}
                                    block={block}
                                    onChange={(patch) => updateImageBlock(block.id, patch)}
                                    {...sharedProps}
                                />
                            );
                        }

                        if (block.type === "code") {
                            return (
                                <CodeBlockEditor
                                    key={block.id}
                                    block={block}
                                    onChange={(patch) => updateCodeBlock(block.id, patch)}
                                    {...sharedProps}
                                />
                            );
                        }

                        if (block.type === "video") {
                            return (
                                <VideoBlockEditor
                                    key={block.id}
                                    block={block}
                                    onChange={(patch) => updateVideoBlock(block.id, patch)}
                                    {...sharedProps}
                                />
                            );
                        }

                        if (block.type === "callout") {
                            return (
                                <CalloutBlockEditor
                                    key={block.id}
                                    block={block}
                                    onChange={(patch) => updateCalloutBlock(block.id, patch)}
                                    {...sharedProps}
                                />
                            );
                        }

                        if (block.type === "divider") {
                            return (
                                <DividerBlockEditor
                                    key={block.id}
                                    block={block}
                                    onChange={(patch) => updateDividerBlock(block.id, patch)}
                                    {...sharedProps}
                                />
                            );
                        }

                        if (block.type === "solution") {
                            return (
                                <SolutionBlockEditor
                                    key={block.id}
                                    block={block}
                                    onChange={(patch) => updateSolutionBlock(block.id, patch)}
                                    {...sharedProps}
                                />
                            );
                        }

                        return (
                            <TextBlockEditor
                                key={block.id}
                                block={block}
                                onChange={(html) => updateTextBlock(block.id, html)}
                                {...sharedProps}
                            />
                        );
                    })
                )}
            </div>

            {/* PALETTE DE COMPOSANTS + SAUVEGARDE — fixée en haut au défilement (lg+ seulement,
                là où elle est à côté du canvas plutôt qu'au-dessus) pour que la palette et le
                bouton "Save content" restent accessibles sur une leçon avec beaucoup de blocs. */}
            <div className="w-full lg:w-36 shrink-0 lg:sticky lg:top-6 lg:self-start">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Components</p>
                <BlockPalette onAddBlock={addBlock} showSolution={lessonType === "EXERCISE"} />

                <div className="mt-6 pt-4 border-t border-slate-100 space-y-2">
                    <Button
                        onClick={onSave}
                        disabled={isSaving || !isDirty}
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-sm"
                    >
                        {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        Save content
                    </Button>
                    {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
                </div>
            </div>
        </div>
    );
}
