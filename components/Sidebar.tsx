"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Lock, Dumbbell, Settings, LayoutGrid, MessageCircle } from "lucide-react";
import LogoutButton from "@/components/LogoutButton";
import { SubscriptionStatus } from "@/components/subscription-status";
import { createClient } from "@/utils/supabase/client";

interface SidebarProps {
    userId?: string | null;
    isAdmin?: boolean;
    subscriptionStatus?: string | null;
    trialDaysLeft?: number;
    unreadMessagesCount?: number;
}

// Les props sont désormais injectées par le Layout serveur Supabase
export default function Sidebar({ userId = null, isAdmin = false, subscriptionStatus = null, trialDaysLeft = 0, unreadMessagesCount = 0 }: SidebarProps) {
    const pathname = usePathname();
    // Valeur initiale = calcul serveur du layout ; ensuite tenue à jour uniquement par
    // l'abonnement temps réel ci-dessous (seule source possible de changement de ce compteur).
    const [unreadCount, setUnreadCount] = useState(unreadMessagesCount);

    // Met le badge à jour en direct (nouveau message reçu, ou fil marqué comme lu dans un
    // autre onglet) sans attendre un rechargement de page — écoute tous les changements
    // pertinents sur "messages" et recalcule via la même fonction que le layout serveur.
    useEffect(() => {
        if (!userId) return;

        const supabase = createClient();
        const refreshCount = () => {
            supabase.rpc("unread_messages_count").then(({ data, error }) => {
                if (!error && typeof data === "number") setUnreadCount(data);
            });
        };

        const channel = supabase
            .channel(`sidebar-unread-${userId}`)
            .on(
                "postgres_changes",
                isAdmin
                    ? { event: "*", schema: "public", table: "messages" }
                    : { event: "*", schema: "public", table: "messages", filter: `student_id=eq.${userId}` },
                refreshCount
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [userId, isAdmin]);

    const menuItems = [
        { icon: LayoutGrid, label: "Dashboard", href: "/dashboard", badge: 0 },
        {
            icon: MessageCircle,
            label: "Messages",
            href: isAdmin ? "/dashboard/admin/messages" : "/dashboard/messages",
            badge: unreadCount,
        },
        ...(isAdmin ? [{ icon: Dumbbell, label: "Exercises", href: "/dashboard/review", badge: 0 }] : []),
        ...(isAdmin ? [{ icon: Lock, label: "Admin", href: "/dashboard/admin", badge: 0 }] : []),
        { icon: Settings, label: "Settings", href: "/dashboard/settings", badge: 0 },
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
                            {item.badge > 0 && (
                                <span className="ml-auto h-5 min-w-5 px-1 rounded-full bg-slate-900 text-white text-[11px] font-bold flex items-center justify-center">
                                    {item.badge}
                                </span>
                            )}
                        </Link>
                    );
                })}

                <div className="[&>button]:w-full [&>button]:justify-start [&>button]:px-4 [&>button]:py-3 [&>button]:h-auto [&>button]:border-transparent [&>button]:shadow-none [&>button]:text-sm mt-auto pt-4 border-t border-slate-100">
                    <LogoutButton />
                </div>

                <div className="px-1">
                    <SubscriptionStatus subscriptionStatus={subscriptionStatus} trialDaysLeft={trialDaysLeft} />
                </div>
            </nav>
        </aside>
    );
}