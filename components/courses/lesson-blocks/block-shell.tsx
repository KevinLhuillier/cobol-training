"use client";

import { ChevronUp, ChevronDown, Trash2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface BlockShellProps {
    icon: LucideIcon;
    label: string;
    onDelete: () => void;
    onMoveUp: () => void;
    onMoveDown: () => void;
    isFirst: boolean;
    isLast: boolean;
    children: React.ReactNode;
}

// Coquille commune à tous les blocs éditables : libellé + contrôles (monter/descendre/
// supprimer). Chaque type de bloc (texte, image, ...) n'a plus qu'à fournir son propre éditeur
// en enfant.
export function BlockShell({
    icon: Icon,
    label,
    onDelete,
    onMoveUp,
    onMoveDown,
    isFirst,
    isLast,
    children,
}: BlockShellProps) {
    return (
        <div className="group relative bg-white border border-slate-100 rounded-2xl shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
                <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    <Icon className="h-3.5 w-3.5" />
                    {label}
                </span>
                <div className="flex items-center gap-1">
                    <button
                        type="button"
                        onClick={onMoveUp}
                        disabled={isFirst}
                        className="h-7 w-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronUp className="h-4 w-4" />
                    </button>
                    <button
                        type="button"
                        onClick={onMoveDown}
                        disabled={isLast}
                        className="h-7 w-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronDown className="h-4 w-4" />
                    </button>
                    <button
                        type="button"
                        onClick={onDelete}
                        className="h-7 w-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            </div>
            {children}
        </div>
    );
}
