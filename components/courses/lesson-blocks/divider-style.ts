import type { DividerBlockData, DividerShape } from "./types";

// Partagé entre l'éditeur admin (divider-block-editor.tsx) et le rendu élève
// (divider-block-view.tsx / lesson-blocks-view.tsx) pour garantir un rendu identique dans les deux.
export const DIVIDER_SHAPE_OPTIONS: { value: DividerShape; label: string }[] = [
    { value: "line", label: "Line" },
    { value: "dashed", label: "Dashed" },
    { value: "dotted", label: "Dotted" },
    { value: "double", label: "Double" },
    { value: "dots", label: "Dots" },
];

export const DIVIDER_DEFAULT_DATA: DividerBlockData = {
    shape: "line",
    marginTop: 0,
    marginBottom: 0,
};

export const DIVIDER_MAX_MARGIN = 200;

// Les données viennent d'un JSONB modifiable : on ne fait pas confiance aux valeurs lues, un
// nombre hors bornes, négatif ou non numérique ne doit pas casser la mise en page.
export function dividerMargin(value: unknown): number {
    if (typeof value !== "number" || !Number.isFinite(value)) return 0;
    return Math.min(DIVIDER_MAX_MARGIN, Math.max(0, Math.round(value)));
}

// Classes du trait pour les formes "ligne" ; la forme "dots" est rendue à part (pas une bordure).
export function dividerLineClassName(shape: DividerShape): string {
    switch (shape) {
        case "dashed":
            return "border-t-2 border-dashed border-slate-300";
        case "dotted":
            return "border-t-2 border-dotted border-slate-300";
        case "double":
            return "border-t-4 border-double border-slate-300";
        default:
            return "border-t border-slate-300";
    }
}
