"use client";

import dynamic from "next/dynamic";

// ReactPlayer manipule des custom elements côté navigateur (youtube-video-element,
// vimeo-video-element, ...) : ssr:false comme pour l'éditeur Quill (components/editor.tsx),
// même raison — pas de rendu fiable côté serveur pour ce genre de composant.
const ReactPlayer = dynamic(() => import("react-player"), { ssr: false });

interface VideoBlockViewProps {
    url: string;
}

export function VideoBlockView({ url }: VideoBlockViewProps) {
    if (!url) return null;

    return (
        <div className="relative w-full aspect-video bg-slate-900 rounded-2xl overflow-hidden">
            <ReactPlayer src={url} controls width="100%" height="100%" />
        </div>
    );
}
