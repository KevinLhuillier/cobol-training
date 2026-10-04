"use client";

import { useRef, useState } from "react";
import { FileText, Loader2, Paperclip, Plus, X } from "lucide-react";
import { BlockShell } from "./block-shell";
import { formatAttachmentSize } from "./attachment-size";
import { uploadLessonAttachment } from "@/utils/lesson-attachment-storage";
import type { AttachmentFile, AttachmentsBlock, AttachmentsBlockData } from "./types";

interface AttachmentsBlockEditorProps {
    block: AttachmentsBlock;
    onChange: (patch: Partial<AttachmentsBlockData>) => void;
    onDelete: () => void;
    onMoveUp: () => void;
    onMoveDown: () => void;
    isFirst: boolean;
    isLast: boolean;
}

export function AttachmentsBlockEditor({
    block,
    onChange,
    onDelete,
    onMoveUp,
    onMoveDown,
    isFirst,
    isLast,
}: AttachmentsBlockEditorProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const files = block.data.files;

    const onFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = Array.from(e.target.files ?? []);
        e.target.value = ""; // permet de re-sélectionner les mêmes fichiers juste après une erreur
        if (selected.length === 0) return;

        setIsUploading(true);
        setError(null);

        // Uploads en parallèle, puis UN SEUL onChange avec tous les fichiers réussis : plusieurs
        // onChange successifs repartiraient chacun de la même liste `files` et s'écraseraient.
        const results = await Promise.allSettled(selected.map((file) => uploadLessonAttachment(file)));
        const uploaded: AttachmentFile[] = [];
        const failures: string[] = [];
        results.forEach((result, index) => {
            if (result.status === "fulfilled") {
                uploaded.push(result.value);
            } else {
                console.error("Attachment upload failed:", selected[index].name, result.reason);
                failures.push(
                    result.reason instanceof Error && result.reason.message.includes(selected[index].name)
                        ? result.reason.message
                        : `"${selected[index].name}" could not be uploaded.`
                );
            }
        });

        if (uploaded.length > 0) {
            onChange({ files: [...files, ...uploaded] });
        }
        if (failures.length > 0) {
            setError(failures.join(" "));
        }
        setIsUploading(false);
    };

    const renameFile = (id: string, name: string) => {
        onChange({ files: files.map((file) => (file.id === id ? { ...file, name } : file)) });
    };

    // Le fichier n'est retiré du bucket qu'à la sauvegarde du contenu (nettoyage des orphelins
    // dans lesson-builder.tsx), pour qu'une modification abandonnée ne casse rien.
    const removeFile = (id: string) => {
        onChange({ files: files.filter((file) => file.id !== id) });
    };

    return (
        <BlockShell
            icon={Paperclip}
            label="Attachments"
            onDelete={onDelete}
            onMoveUp={onMoveUp}
            onMoveDown={onMoveDown}
            isFirst={isFirst}
            isLast={isLast}
        >
            <input ref={fileInputRef} type="file" multiple onChange={onFilesSelected} className="hidden" />

            <div className="space-y-3">
                <input
                    type="text"
                    value={block.data.title}
                    onChange={(e) => onChange({ title: e.target.value })}
                    placeholder="Title (optional, e.g. Resources for this exercise)"
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none text-slate-900 text-sm"
                />

                {files.length > 0 && (
                    <ul className="space-y-2">
                        {files.map((file) => (
                            <li
                                key={file.id}
                                className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"
                            >
                                <FileText className="h-4 w-4 text-slate-400 shrink-0" />
                                <input
                                    type="text"
                                    value={file.name}
                                    onChange={(e) => renameFile(file.id, e.target.value)}
                                    aria-label="File name"
                                    className="flex-1 min-w-0 h-8 px-2 rounded-md border border-transparent bg-transparent hover:border-slate-200 focus:bg-white focus:border-slate-300 outline-none text-sm font-medium text-slate-900"
                                />
                                <span className="text-xs text-slate-400 shrink-0">{formatAttachmentSize(file.size)}</span>
                                <button
                                    type="button"
                                    onClick={() => removeFile(file.id)}
                                    title="Remove file"
                                    className="h-7 w-7 shrink-0 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </li>
                        ))}
                    </ul>
                )}

                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className={`w-full flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 transition-colors disabled:opacity-60 ${
                        files.length === 0 ? "flex-col h-32" : "h-11"
                    }`}
                >
                    {isUploading ? (
                        <Loader2 className="h-5 w-5 text-slate-400 animate-spin" />
                    ) : files.length === 0 ? (
                        <>
                            <Paperclip className="h-6 w-6 text-slate-400" />
                            <span className="text-sm font-medium text-slate-500">Click to attach one or more files</span>
                            <span className="text-xs text-slate-400">50MB max per file</span>
                        </>
                    ) : (
                        <>
                            <Plus className="h-4 w-4 text-slate-400" />
                            <span className="text-sm font-medium text-slate-500">Add files</span>
                        </>
                    )}
                </button>
            </div>

            {error && <p className="text-xs text-red-500 font-medium mt-2">{error}</p>}
        </BlockShell>
    );
}
