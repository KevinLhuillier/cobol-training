"use client";

import { useRef, useState } from "react";
import { Image as ImageIcon, Loader2, Upload } from "lucide-react";
import { BlockShell } from "./block-shell";
import { uploadLessonImage } from "@/utils/lesson-image-storage";
import { IMAGE_SIZE_OPTIONS, imageSizeClassName } from "./image-size";
import type { ImageBlock, ImageBlockData } from "./types";

interface ImageBlockEditorProps {
    block: ImageBlock;
    onChange: (patch: Partial<ImageBlockData>) => void;
    onDelete: () => void;
    onMoveUp: () => void;
    onMoveDown: () => void;
    isFirst: boolean;
    isLast: boolean;
}

export function ImageBlockEditor({
    block,
    onChange,
    onDelete,
    onMoveUp,
    onMoveDown,
    isFirst,
    isLast,
}: ImageBlockEditorProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const onFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        e.target.value = ""; // permet de re-sélectionner le même fichier juste après une erreur
        if (!file) return;

        setIsUploading(true);
        setError(null);
        try {
            const url = await uploadLessonImage(file);
            onChange({ url });
        } catch (err) {
            console.error("Image upload failed:", err);
            setError(err instanceof Error ? err.message : "Something went wrong while uploading the image.");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <BlockShell
            icon={ImageIcon}
            label="Image"
            onDelete={onDelete}
            onMoveUp={onMoveUp}
            onMoveDown={onMoveDown}
            isFirst={isFirst}
            isLast={isLast}
        >
            <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                onChange={onFileSelected}
                className="hidden"
            />

            {block.data.url ? (
                <div className="space-y-3">
                    <div className="relative rounded-xl overflow-hidden border border-slate-100 bg-slate-50 p-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={block.data.url}
                            alt={block.data.alt}
                            className={`mx-auto block max-h-96 object-contain ${imageSizeClassName(block.data.size)}`}
                        />
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                            className="absolute top-2 right-2 h-8 px-3 rounded-lg bg-white/90 backdrop-blur text-xs font-bold text-slate-700 hover:bg-white shadow-sm flex items-center gap-1.5 disabled:opacity-60"
                        >
                            {isUploading ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                                <Upload className="h-3.5 w-3.5" />
                            )}
                            Replace
                        </button>
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-slate-500 shrink-0">Size</span>
                        <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
                            {IMAGE_SIZE_OPTIONS.map((option) => {
                                const isActive = (block.data.size ?? "full") === option.value;
                                return (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => onChange({ size: option.value })}
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
                        value={block.data.alt}
                        onChange={(e) => onChange({ alt: e.target.value })}
                        placeholder="Alt text (describes the image for accessibility)"
                        className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none text-slate-900 text-sm"
                    />
                </div>
            ) : (
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="w-full flex flex-col items-center justify-center gap-2 h-40 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 transition-colors disabled:opacity-60"
                >
                    {isUploading ? (
                        <Loader2 className="h-6 w-6 text-slate-400 animate-spin" />
                    ) : (
                        <>
                            <ImageIcon className="h-6 w-6 text-slate-400" />
                            <span className="text-sm font-medium text-slate-500">Click to upload an image</span>
                        </>
                    )}
                </button>
            )}

            {error && <p className="text-xs text-red-500 font-medium mt-2">{error}</p>}
        </BlockShell>
    );
}
