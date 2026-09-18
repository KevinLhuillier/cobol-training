import { CALLOUT_VARIANT_ICONS, calloutAlignClassName, calloutVariantClassName } from "./callout-style";
import type { CalloutBlockData } from "./types";

interface CalloutBlockViewProps {
    data: CalloutBlockData;
}

export function CalloutBlockView({ data }: CalloutBlockViewProps) {
    const Icon = CALLOUT_VARIANT_ICONS[data.variant];

    return (
        <div
            className={`flex gap-3 rounded-2xl border p-4 max-w-lg ${calloutAlignClassName(data.align)} ${calloutVariantClassName(data.variant)}`}
        >
            <Icon className="h-5 w-5 shrink-0 mt-0.5" />
            <div className="min-w-0 space-y-1">
                {data.title && <p className="font-bold text-sm">{data.title}</p>}
                {data.content && <p className="text-sm whitespace-pre-wrap">{data.content}</p>}
            </div>
        </div>
    );
}
