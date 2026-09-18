import { Info, AlertTriangle, XCircle, CheckCircle2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { CalloutAlign, CalloutVariant } from "./types";

// Partagé entre l'éditeur admin (callout-block-editor.tsx) et le rendu élève
// (lesson-blocks-view.tsx) pour garantir un rendu identique dans les deux.
export const CALLOUT_VARIANT_OPTIONS: { value: CalloutVariant; label: string }[] = [
    { value: "info", label: "Info" },
    { value: "warning", label: "Warning" },
    { value: "error", label: "Error" },
    { value: "success", label: "Success" },
];

export const CALLOUT_VARIANT_ICONS: Record<CalloutVariant, LucideIcon> = {
    info: Info,
    warning: AlertTriangle,
    error: XCircle,
    success: CheckCircle2,
};

export const CALLOUT_ALIGN_OPTIONS: { value: CalloutAlign; label: string }[] = [
    { value: "left", label: "Left" },
    { value: "center", label: "Center" },
];

export function calloutAlignClassName(align: CalloutAlign | undefined): string {
    return align === "center" ? "mx-auto" : "";
}

export function calloutVariantClassName(variant: CalloutVariant): string {
    switch (variant) {
        case "warning":
            return "bg-amber-50 border-amber-200 text-amber-900 [&_svg]:text-amber-500";
        case "error":
            return "bg-red-50 border-red-200 text-red-900 [&_svg]:text-red-500";
        case "success":
            return "bg-emerald-50 border-emerald-200 text-emerald-900 [&_svg]:text-emerald-500";
        default:
            return "bg-blue-50 border-blue-200 text-blue-900 [&_svg]:text-blue-500";
    }
}
