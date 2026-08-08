"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Lock, Dumbbell, Settings, LayoutGrid } from "lucide-react";
import LogoutButton from "@/components/LogoutButton";

// La prop isAdmin est désormais injectée par le Layout serveur Supabase
export default function Sidebar({ isAdmin = false }: { isAdmin?: boolean }) {
    const pathname = usePathname();

    const menuItems = [
        { icon: LayoutGrid, label: "Dashboard", href: "/dashboard" },
        ...(isAdmin ? [{ icon: Dumbbell, label: "Exercises", href: "/dashboard/review" }] : []),
        ...(isAdmin ? [{ icon: Lock, label: "Admin", href: "/dashboard/admin" }] : []),
        { icon: Settings, label: "Settings", href: "/dashboard/settings" },
    ];

    return (
        <aside className="w-full lg:w-[280px] xl:w-[320px] bg-white rounded-3xl shadow-sm p-6 flex flex-col shrink-0 lg:sticky lg:top-8 lg:max-h-[calc(100vh-4rem)] border border-slate-100">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-3">
                Main Menu
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

                <div className="[&>button]:w-full [&>button]:justify-start [&>button]:px-4 [&>button]:py-3 [&>button]:h-auto [&>button]:border-transparent [&>button]:shadow-none [&>button]:text-sm mt-auto pt-4 border-t border-slate-100">
                    <LogoutButton />
                </div>
            </nav>
        </aside>
    );
}