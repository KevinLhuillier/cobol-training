import type { ImageBlockSize } from "./types";

// Partagé entre l'éditeur admin (image-block-editor.tsx) et le rendu élève
// (lesson-blocks-view.tsx) pour garantir un rendu identique dans les deux.
export const IMAGE_SIZE_OPTIONS: { value: ImageBlockSize; label: string }[] = [
    { value: "small", label: "S" },
    { value: "medium", label: "M" },
    { value: "large", label: "L" },
    { value: "full", label: "Full" },
];

export function imageSizeClassName(size: ImageBlockSize | undefined): string {
    switch (size) {
        case "small":
            return "w-1/4";
        case "medium":
            return "w-1/2";
        case "large":
            return "w-3/4";
        default:
            return "w-full";
    }
}
