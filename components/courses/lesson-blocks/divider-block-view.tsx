import { dividerLineClassName, dividerMargin } from "./divider-style";
import type { DividerBlockData } from "./types";

interface DividerBlockViewProps {
    data: DividerBlockData;
}

// Les marges sont appliquées en padding (et non en margin) : les blocs sont espacés par
// `space-y-6` dans lesson-blocks-view.tsx, et une margin verticale fusionnerait avec (ou serait
// écrasée par) cet espacement au lieu de s'y ajouter. Un padding donne un résultat prévisible :
// espacement standard entre blocs + la valeur choisie.
export function DividerBlockView({ data }: DividerBlockViewProps) {
    return (
        <div style={{ paddingTop: dividerMargin(data.marginTop), paddingBottom: dividerMargin(data.marginBottom) }}>
            {data.shape === "dots" ? (
                <div role="separator" className="flex items-center justify-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                </div>
            ) : (
                <hr className={dividerLineClassName(data.shape)} />
            )}
        </div>
    );
}
