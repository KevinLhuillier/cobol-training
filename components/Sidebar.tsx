"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Lock, Dumbbell, Settings, LayoutGrid, MessageCircle, FolderKanban } from "lucide-react";
import LogoutButton from "@/components/LogoutButton";
import { LogoCtIcon } from "@/components/logo-ct-icon";
import { SubscriptionStatus } from "@/components/subscription-status";
import { createClient } from "@/utils/supabase/client";

interface SidebarProps {
    userId?: string | null;
    isAdmin?: boolean;
    subscriptionStatus?: string | null;
    trialDaysLeft?: number;
    mainframeDaysLeft?: number;
    lifetimeOfferAvailable?: boolean;
    unreadMessagesCount?: number;
}

// Les props sont désormais injectées par le Layout serveur Supabase
export default function Sidebar({ userId = null, isAdmin = false, subscriptionStatus = null, trialDaysLeft = 0, mainframeDaysLeft = 0, lifetimeOfferAvailable = false, unreadMessagesCount = 0 }: SidebarProps) {
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

    const menuItems: { icon: typeof LayoutGrid; label: string; href: string; badge: number; id?: string }[] = [
        { icon: LayoutGrid, label: "Courses", href: "/dashboard", badge: 0 },
        // Même page pour tous : un admin y voit ce que voient les étudiants (la gestion des
        // projets se fait depuis /dashboard/admin/projects).
        { icon: FolderKanban, label: "Projects", href: "/dashboard/projects", badge: 0 },
        {
            icon: MessageCircle,
            label: "Messages",
            href: isAdmin ? "/dashboard/admin/messages" : "/dashboard/messages",
            badge: unreadCount,
            // Ancre du parcours d'onboarding (cf. components/onboarding/onboarding-tour.tsx),
            // ciblée par id car cette Sidebar et le tour ne vivent pas dans le même arbre React
            // (layout vs. page).
            id: "onboarding-messages-anchor",
        },
        ...(isAdmin ? [{ icon: Dumbbell, label: "Exercises", href: "/dashboard/review", badge: 0 }] : []),
        ...(isAdmin ? [{ icon: Lock, label: "Admin", href: "/dashboard/admin", badge: 0 }] : []),
        { icon: Settings, label: "Settings", href: "/dashboard/settings", badge: 0 },
    ];

    // Entrée active = celle dont le lien est le plus long préfixe de l'URL courante : une sous-page
    // (ex. /dashboard/admin/users) garde son entrée surlignée, et /dashboard/admin/messages active
    // "Messages" plutôt que "Admin". "Courses" (/dashboard) couvre aussi le lecteur de cours.
    const matches = (href: string) =>
        href === "/dashboard"
            ? pathname === "/dashboard" || pathname.startsWith("/dashboard/courses")
            : pathname === href || pathname.startsWith(`${href}/`);
    const activeHref = menuItems
        .map((item) => item.href)
        .filter(matches)
        .sort((a, b) => b.length - a.length)[0];

    return (
        <aside className="w-full lg:w-[260px] shrink-0 bg-white lg:border-r border-ui-line flex flex-col gap-7 px-4 py-6 lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto">
            <Link href="/dashboard" className="hidden lg:flex items-center gap-2.5 px-2 text-base font-bold text-slate-900 tracking-tight">
                <LogoCtIcon className="h-8 w-auto shrink-0" />
                <span>Cobol Training</span>
            </Link>

            <nav className="flex flex-col gap-0.5 flex-1">
                <p className="text-[11px] font-semibold text-ui-muted uppercase tracking-wider mb-2 px-3">
                    Menu
                </p>
                {menuItems.map((item, index) => {
                    const MenuIcon = item.icon;
                    const isActive = item.href === activeHref;

                    return (
                        <Link
                            key={index}
                            href={item.href}
                            aria-current={isActive ? "page" : undefined}
                            className={`flex items-center gap-3 h-11 px-3 rounded-lg transition-colors text-sm ${
                                isActive
                                    ? "bg-ui-accent-soft text-slate-900 font-semibold shadow-[inset_3px_0_0_var(--color-ui-accent)]"
                                    : "text-slate-600 font-medium hover:bg-ui-page hover:text-slate-900"
                            }`}
                        >
                            {/* id posé sur l'icône + le libellé seulement (pas tout le Link, qui
                                s'étire sur toute la largeur de la sidebar) : sinon l'ancre du
                                parcours d'onboarding pointe vers le bord droit de la sidebar au
                                lieu du mot "Messages". */}
                            <span id={item.id} className="flex items-center gap-3">
                                <MenuIcon className={`h-[18px] w-[18px] ${isActive ? "text-ui-accent" : "text-slate-400"}`} />
                                {item.label}
                            </span>
                            {item.badge > 0 && (
                                <span className="ml-auto h-5 min-w-5 px-1.5 rounded-full bg-ui-ink text-white text-[11px] font-bold flex items-center justify-center">
                                    {item.badge}
                                </span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            <div className="flex flex-col gap-3">
                <SubscriptionStatus
                    subscriptionStatus={subscriptionStatus}
                    trialDaysLeft={trialDaysLeft}
                    mainframeDaysLeft={mainframeDaysLeft}
                    canUpgradeToLifetime={lifetimeOfferAvailable}
                />
                <div className="[&>button]:w-full [&>button]:justify-start [&>button]:gap-3 [&>button]:px-3 [&>button]:h-11 [&>button]:rounded-lg [&>button]:border-transparent [&>button]:shadow-none [&>button]:text-sm [&>button]:font-medium [&>button]:text-slate-600 pt-3 border-t border-ui-line">
                    <LogoutButton />
                </div>
            </div>
        </aside>
    );
}