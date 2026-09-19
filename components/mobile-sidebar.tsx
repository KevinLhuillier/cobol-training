"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileSidebarContextValue {
    open: boolean;
    toggle: () => void;
    close: () => void;
}

const MobileSidebarContext = createContext<MobileSidebarContextValue>({
    open: false,
    toggle: () => {},
    close: () => {},
});

// État d'ouverture partagé entre le bouton hamburger (dans le header, rendu par le layout
// serveur) et le tiroir (dans DashboardLayoutWrapper). Le contexte traverse bien les deux : le
// header est passé en prop mais reste rendu dans le sous-arbre de ce provider.
export function MobileSidebarProvider({ children }: { children: React.ReactNode }) {
    const pathname = usePathname() ?? "";

    // On mémorise la page sur laquelle le menu a été ouvert : dès que la route change (clic sur
    // un lien du menu), le menu est considéré fermé — sans effet ni setState de synchronisation.
    const [openedAt, setOpenedAt] = useState<string | null>(null);
    const open = openedAt === pathname;

    const value: MobileSidebarContextValue = {
        open,
        toggle: () => setOpenedAt(open ? null : pathname),
        close: () => setOpenedAt(null),
    };

    // Menu ouvert : Échap le ferme et la page derrière ne défile plus.
    useEffect(() => {
        if (!open) return;

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") setOpenedAt(null);
        };
        document.addEventListener("keydown", onKeyDown);
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.removeEventListener("keydown", onKeyDown);
            document.body.style.overflow = previousOverflow;
        };
    }, [open]);

    return <MobileSidebarContext.Provider value={value}>{children}</MobileSidebarContext.Provider>;
}

// Bouton hamburger : visible uniquement sous le breakpoint lg (au-dessus, la sidebar est affichée
// en permanence à côté du contenu). L'id sert d'ancre à l'onboarding sur mobile (cf.
// MOBILE_OVERRIDES dans components/onboarding/onboarding-tour.tsx).
export function MobileSidebarButton() {
    const { open, toggle } = useContext(MobileSidebarContext);

    return (
        <button
            id="onboarding-menu-anchor"
            type="button"
            onClick={toggle}
            aria-label="Open menu"
            aria-expanded={open}
            aria-controls="mobile-sidebar"
            className="lg:hidden h-10 w-10 shrink-0 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
        >
            <Menu className="h-5 w-5" />
        </button>
    );
}

// Enveloppe la Sidebar : tiroir latéral avec fond assombri sous lg, et `display: contents` à
// partir de lg pour disparaître complètement de la mise en page (la Sidebar redevient un enfant
// direct du flex, avec son `sticky` d'origine). La Sidebar n'est rendue qu'UNE fois — la
// dupliquer dupliquerait l'id d'ancre de l'onboarding et son abonnement temps réel.
export function MobileSidebarDrawer({ children }: { children: React.ReactNode }) {
    const { open, close } = useContext(MobileSidebarContext);

    return (
        <>
            {open && (
                <div
                    className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden"
                    onClick={close}
                    aria-hidden="true"
                />
            )}
            <div
                id="mobile-sidebar"
                className={cn(
                    "fixed inset-y-0 left-0 z-50 w-[85%] max-w-sm overflow-y-auto p-3",
                    "transition-[transform,visibility] duration-200 ease-out",
                    // Fermé : hors écran ET invisible, pour que ses liens ne restent pas
                    // atteignables au clavier. `lg:visible` car visibility s'hérite.
                    open ? "translate-x-0 visible" : "-translate-x-full invisible",
                    "lg:contents lg:visible"
                )}
            >
                <div className="flex justify-end mb-2 lg:hidden">
                    <button
                        type="button"
                        onClick={close}
                        aria-label="Close menu"
                        className="h-9 w-9 flex items-center justify-center rounded-full bg-white text-slate-600 shadow-sm hover:text-slate-900 transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>
                {children}
            </div>
        </>
    );
}
