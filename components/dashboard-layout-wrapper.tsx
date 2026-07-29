"use client";

import { usePathname } from "next/navigation";
import { ReactNode } from "react";

interface DashboardLayoutWrapperProps {
    header: ReactNode;
    sidebar: ReactNode;
    children: ReactNode;
}

export function DashboardLayoutWrapper({ header, sidebar, children }: DashboardLayoutWrapperProps) {
    const pathname = usePathname();

    // On vérifie si on est sur la page de lecture d'un cours
    const isCoursePlayerPage = pathname?.includes("/courses/");

    // Si on est sur le cours : on affiche directement l'enfant,
    // car ton composant CoursePlayer gère déjà son propre plein écran et son design.
    if (isCoursePlayerPage) {
        return <>{children}</>;
    }

    // Sinon, on restitue EXACTEMENT ton layout d'origine
    return (
        <div className="min-h-screen bg-slate-100 p-4 md:p-6 lg:p-8 flex flex-col font-sans">
            {header}
            <main className="flex-1 max-w-[1600px] w-full mx-auto flex flex-col lg:flex-row gap-6">
                {sidebar}
                <section className="flex-1 bg-white rounded-3xl shadow-sm p-6 lg:p-8">
                    {children}
                </section>
            </main>
        </div>
    );
}