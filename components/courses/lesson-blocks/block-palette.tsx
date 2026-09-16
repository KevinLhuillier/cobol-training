"use client";

import { Type, Image as ImageIcon, Code2, Video } from "lucide-react";
import type { LessonBlockType } from "./types";

interface PaletteItem {
    type: LessonBlockType;
    icon: typeof Type;
    label: string;
    enabled: boolean;
}

// Une future tuile pas encore implémentée peut être ajoutée ici avec enabled: false pour
// montrer la direction (façon Teachizy) sans être cliquable — cf. l'historique de ce fichier.
const PALETTE_ITEMS: PaletteItem[] = [
    { type: "text", icon: Type, label: "Text", enabled: true },
    { type: "image", icon: ImageIcon, label: "Image", enabled: true },
    { type: "code", icon: Code2, label: "Code", enabled: true },
    { type: "video", icon: Video, label: "Video", enabled: true },
];

interface BlockPaletteProps {
    onAddBlock: (type: LessonBlockType) => void;
}

export function BlockPalette({ onAddBlock }: BlockPaletteProps) {
    return (
        <div className="grid grid-cols-2 gap-3">
            {PALETTE_ITEMS.map((item) => {
                const Icon = item.icon;
                const title = item.enabled ? item.label : `${item.label} (Coming soon)`;
                return (
                    <button
                        key={item.type}
                        type="button"
                        disabled={!item.enabled}
                        onClick={() => item.enabled && onAddBlock(item.type)}
                        title={title}
                        aria-label={title}
                        className={`h-11 w-11 shrink-0 rounded-xl border flex items-center justify-center transition-all ${
                            item.enabled
                                ? "border-slate-200 bg-slate-900 text-white hover:bg-slate-800 hover:shadow-sm cursor-pointer"
                                : "border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed"
                        }`}
                    >
                        <Icon className="h-5 w-5" />
                    </button>
                );
            })}
        </div>
    );
}
