"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Dumbbell, Settings, LayoutGrid } from "lucide-react";
import LogoutButton from "@/components/LogoutButton";

export default function Sidebar() {
    const pathname = usePathname();

    const menuItems = [
        { icon: LayoutGrid, label: "Tableau de bord", href: "/dashboard" },
        { icon: BookOpen, label: "Mes Cours", href: "/dashboard/cours" },
        { icon: Dumbbell, label: "Exercices", href: "/dashboard/exercices" },
        { icon: Settings, label: "Paramètres", href: "/dashboard/settings" },
    ];

    return (
        <aside className="w-full lg:w-[280px] xl:w-[320px] bg-white rounded-3xl shadow-sm p-6 flex flex-col shrink-0 lg:sticky lg:top-8 lg:max-h-[calc(100vh-4rem)] border border-slate-100">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-3">
                Menu Principal
            </h3>

            <nav className="flex flex-col gap-2">
                {menuItems.map((item, index) => {
                    const MenuIcon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                        <Link
                            key={index}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-sm font-medium ${
                                isActive
                                    ? "bg-slate-100 text-slate-900"
                                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                            }`}
                        >
                            <MenuIcon className={`h-5 w-5 ${isActive ? "text-slate-900" : "text-slate-400"}`} />
                            {item.label}
                        </Link>
                    );
                })}

                {/* Le bouton est maintenant directement à la suite dans la liste */}
                <div className="[&>button]:w-full [&>button]:justify-start [&>button]:px-4 [&>button]:py-3 [&>button]:h-auto [&>button]:border-transparent [&>button]:shadow-none [&>button]:text-sm">
                    <LogoutButton />
                </div>
            </nav>
        </aside>
    );
}