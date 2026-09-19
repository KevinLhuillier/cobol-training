import Link from "next/link";
import { Trophy } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { DashboardLayoutWrapper } from "@/components/dashboard-layout-wrapper";
import { Badge } from "@/components/ui/badge";
// 🟢 Import du client serveur Supabase
import { createClient } from "@/utils/supabase/server";
import { ensureTrialStarted, recordLoginEvent } from "@/app/actions/auth";
import { LogoCtIcon } from "@/components/logo-ct-icon";
import { MobileSidebarButton } from "@/components/mobile-sidebar";

export default async function DashboardLayout({
                                                  children,
                                              }: {
    children: React.ReactNode;
}) {
    let isAdmin = false;
    let userName = "Student";
    let subscriptionStatus: string | null = null;
    let trialDaysLeft = 0;
    let unreadMessagesCount = 0;
    let userId: string | null = null;
    let badgesCount = 0;

    try {
        const supabase = await createClient();

        // 1. Récupération de l'utilisateur connecté
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
            userId = user.id;

            // Filet de sécurité : démarre l'essai si ce n'est pas déjà fait (idempotent côté DB).
            // Nécessaire ici aussi (et pas seulement dans dashboard/page.tsx) car ce layout et la
            // page qu'il englobe sont deux composants serveur fetchés en parallèle par Next.js :
            // sans cet appel, le badge d'abonnement peut lire le statut AVANT que la page ne
            // démarre l'essai, et afficher "Trial ended" jusqu'au prochain refresh.
            await ensureTrialStarted();

            // Traçabilité : enregistre IP/pays/horodatage de cette connexion (idempotent,
            // même raison que ci-dessus pour l'appeler ici plutôt que juste après le login).
            await recordLoginEvent();

            // 2. Récupération de son profil public (rôle, nom et statut d'abonnement)
            const { data: profile } = await supabase
                .from("users")
                .select("role, name, subscription_status, trial_ends_at")
                .eq("id", user.id)
                .single();

            if (profile) {
                isAdmin = profile.role === "ADMIN";
                if (profile.name) {
                    userName = profile.name;
                }
                subscriptionStatus = profile.subscription_status;
                if (subscriptionStatus === "TRIAL" && profile.trial_ends_at) {
                    const diffMs = new Date(profile.trial_ends_at).getTime() - Date.now();
                    trialDaysLeft = diffMs > 0 ? Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24))) : 0;
                }
            }

            // 3. Nombre de messages non lus (badge sidebar) — fonction SECURITY DEFINER
            // qui s'adapte déjà au rôle de l'appelant (cf. unread_messages_count()).
            const { data: unreadCount } = await supabase.rpc("unread_messages_count");
            if (typeof unreadCount === "number") {
                unreadMessagesCount = unreadCount;
            }

            // 4. Nombre de badges débloqués (affiché à gauche du bloc "Welcome").
            const { count } = await supabase
                .from("user_badges")
                .select("id", { count: "exact", head: true })
                .eq("user_id", user.id);
            badgesCount = count || 0;
        }
    } catch (error) {
        console.error("Erreur de récupération du rôle dans le layout:", error);
    }

    // Récupère la première lettre du nom pour l'avatar
    const initial = userName.charAt(0).toUpperCase();

    return (
        <DashboardLayoutWrapper
            sidebar={
                <Sidebar
                    userId={userId}
                    isAdmin={isAdmin}
                    subscriptionStatus={subscriptionStatus}
                    trialDaysLeft={trialDaysLeft}
                    unreadMessagesCount={unreadMessagesCount}
                />
            }
            header={
                <header className="max-w-[1600px] w-full mx-auto mb-6 flex items-center justify-between px-2">
                    <div className="flex items-center gap-3 min-w-0">
                        <MobileSidebarButton />
                        <h1 className="flex items-center gap-2.5 min-w-0 text-lg sm:text-2xl font-extrabold text-slate-800 tracking-tight">
                            <LogoCtIcon className="h-8 w-auto shrink-0" />
                            <span className="truncate">Cobol Training</span>
                        </h1>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right hidden sm:flex sm:flex-col sm:items-end gap-1">
                            <p className="text-sm font-bold text-slate-900">Welcome, {userName}</p>
                            {subscriptionStatus === "ACTIVE" ? (
                                <Badge className="border-none bg-emerald-100 text-emerald-700">Subscribed</Badge>
                            ) : subscriptionStatus === "TRIAL" && trialDaysLeft > 0 ? (
                                <Badge className="border-none bg-amber-100 text-amber-700">Trial</Badge>
                            ) : subscriptionStatus === "UNPAID" ? (
                                <Badge className="border-none bg-red-100 text-red-700">Payment failed</Badge>
                            ) : (
                                <Badge className="border-none bg-slate-100 text-slate-500">Trial ended</Badge>
                            )}
                        </div>
                        <div className="h-10 w-10 rounded-full bg-slate-200 border-2 border-white shadow-sm flex items-center justify-center font-bold text-slate-600">
                            {initial}
                        </div>
                        {userId && (
                            <Link
                                href="/dashboard/badges"
                                className="flex items-center gap-1.5 h-9 px-3 rounded-full bg-amber-50 text-amber-700 border border-amber-100 hover:bg-amber-100 transition-colors font-bold text-sm shrink-0"
                            >
                                <Trophy className="h-4 w-4" />
                                {badgesCount}
                            </Link>
                        )}
                    </div>
                </header>
            }
        >
            {children}
        </DashboardLayoutWrapper>
    );
}