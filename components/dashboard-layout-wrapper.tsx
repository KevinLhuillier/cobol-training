"use client";

import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import { MobileSidebarDrawer, MobileSidebarProvider } from "@/components/mobile-sidebar";
import { SiteFooter } from "@/components/site-footer";

interface DashboardLayoutWrapperProps {
    header: ReactNode;
    sidebar: ReactNode;
    children: ReactNode;
}

export function DashboardLayoutWrapper({ header, sidebar, children }: DashboardLayoutWrapperProps) {
    const pathname = usePathname();

    // On vérifie si on est sur la page de lecture d'un cours
    const isCoursePlayerPage = pathname?.includes("/dashboard/courses/");

    // Si on est sur le cours : on affiche directement l'enfant,
    // car ton composant CoursePlayer gère déjà son propre plein écran et son design.
    if (isCoursePlayerPage) {
        return <>{children}</>;
    }

    // Design « Soft Structure » : la sidebar est un rail blanc collé au bord gauche (à partir de lg),
    // le contenu est posé sur le fond gris clair. Sous lg, la sidebar devient un tiroir ouvert par
    // le hamburger du header (cf. components/mobile-sidebar.tsx).
    //
    // Chaque page compose elle-même ses cartes blanches sur le fond gris (plus de carte englobante).
    return (
        <MobileSidebarProvider>
            <div className="min-h-screen bg-ui-page font-sans lg:flex">
                <MobileSidebarDrawer>{sidebar}</MobileSidebarDrawer>
                <div className="flex-1 min-w-0 flex flex-col">
                    <div className="flex-1 w-full max-w-[1280px] mx-auto px-4 py-5 md:px-8 lg:px-10 lg:py-8 flex flex-col gap-6 lg:gap-8">
                        {header}
                        {/* min-w-0 : sans lui, un contenu non sécable (ex. aperçu `truncate` d'un long message)
                            élargit la zone au lieu d'être tronqué, d'où un scroll horizontal. */}
                        <main className="flex-1 min-w-0">{children}</main>
                    </div>
                    <SiteFooter className="max-w-[1280px] mx-auto" />
                </div>
            </div>
        </MobileSidebarProvider>
    );
}