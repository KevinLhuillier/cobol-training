"use client";

import { Video as VideoIcon } from "lucide-react";
import { BlockShell } from "./block-shell";
import { VideoBlockView } from "./video-block-view";
import type { VideoBlock, VideoBlockData } from "./types";

interface VideoBlockEditorProps {
    block: VideoBlock;
    onChange: (patch: Partial<VideoBlockData>) => void;
    onDelete: () => void;
    onMoveUp: () => void;
    onMoveDown: () => void;
    isFirst: boolean;
    isLast: boolean;
}

export function VideoBlockEditor({
    block,
    onChange,
    onDelete,
    onMoveUp,
    onMoveDown,
    isFirst,
    isLast,
}: VideoBlockEditorProps) {
    return (
        <BlockShell
            icon={VideoIcon}
            label="Video"
            onDelete={onDelete}
            onMoveUp={onMoveUp}
            onMoveDown={onMoveDown}
            isFirst={isFirst}
            isLast={isLast}
        >
            <div className="space-y-3">
                <input
                    type="url"
                    value={block.data.url}
                    onChange={(e) => onChange({ url: e.target.value })}
                    placeholder="Paste a video URL (YouTube, Vimeo, MP4...)"
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none text-slate-900 text-sm"
                />

                {block.data.url ? (
                    <VideoBlockView url={block.data.url} />
                ) : (
                    <div className="flex items-center justify-center h-40 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                        <VideoIcon className="h-6 w-6 text-slate-300" />
                    </div>
                )}
            </div>
        </BlockShell>
    );
}
