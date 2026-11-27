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

    // Sinon, on restitue EXACTEMENT ton layout d'origine
    // Sous lg, la sidebar devient un tiroir ouvert par le hamburger du header ; à partir de lg
    // elle reste affichée à côté du contenu (cf. components/mobile-sidebar.tsx).
    return (
        <MobileSidebarProvider>
            <div className="min-h-screen bg-slate-100 p-4 md:p-6 lg:p-8 flex flex-col font-sans">
                {header}
                <main className="flex-1 max-w-[1600px] w-full mx-auto flex flex-col lg:flex-row gap-6">
                    <MobileSidebarDrawer>{sidebar}</MobileSidebarDrawer>
                    {/* min-w-0 : sans lui, un contenu non sécable (ex. aperçu `truncate` d'un long message)
                        élargit la section au lieu d'être tronqué, d'où un scroll horizontal. */}
                    <section className="flex-1 min-w-0 bg-white rounded-3xl shadow-sm p-6 lg:p-8">
                        {children}
                    </section>
                </main>
                <SiteFooter className="max-w-[1600px] mx-auto pb-0" />
            </div>
        </MobileSidebarProvider>
    );
}