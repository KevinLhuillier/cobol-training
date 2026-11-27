import Link from "next/link";
import { Trophy } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { DashboardLayoutWrapper } from "@/components/dashboard-layout-wrapper";
// 🟢 Import du client serveur Supabase
import { createClient } from "@/utils/supabase/server";
import { ensureTrialStarted, recordLoginEvent } from "@/app/actions/auth";
import { LogoCtIcon } from "@/components/logo-ct-icon";
import { MobileSidebarButton } from "@/components/mobile-sidebar";
import { getDaysLeft } from "@/utils/subscription";

export default async function DashboardLayout({
                                                  children,
                                              }: {
    children: React.ReactNode;
}) {
    let isAdmin = false;
    let userName = "Student";
    let subscriptionStatus: string | null = null;
    let trialDaysLeft = 0;
    let mainframeDaysLeft = 0;
    let lifetimeOfferAvailable = false;
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
                .select("role, name, subscription_status, trial_ends_at, mainframe_ends_at")
                .eq("id", user.id)
                .single();

            if (profile) {
                isAdmin = profile.role === "ADMIN";
                if (profile.name) {
                    userName = profile.name;
                }
                subscriptionStatus = profile.subscription_status;
                if (subscriptionStatus === "TRIAL") {
                    trialDaysLeft = getDaysLeft(profile.trial_ends_at);
                }
                if (subscriptionStatus === "LIFETIME") {
                    mainframeDaysLeft = getDaysLeft(profile.mainframe_ends_at);
                }
                if (subscriptionStatus === "ACTIVE") {
                    // Un abonné peut passer à l'offre à vie, mais seulement une fois celle-ci configurée
                    // (prix Stripe renseigné dans l'admin) : sinon le bouton mènerait à une page vide.
                    const { data: lifetimeOffer } = await supabase
                        .from("offer_settings")
                        .select("stripe_price_id")
                        .eq("kind", "LIFETIME")
                        .maybeSingle();
                    lifetimeOfferAvailable = !!lifetimeOffer?.stripe_price_id;
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
                    mainframeDaysLeft={mainframeDaysLeft}
                    lifetimeOfferAvailable={lifetimeOfferAvailable}
                    unreadMessagesCount={unreadMessagesCount}
                />
            }
            header={
                // Le logo vit dans la sidebar (à partir de lg) ; sous lg, il reste ici à côté du
                // hamburger. Le statut d'abonnement est affiché en bas de la sidebar, et le message
                // d'accueil sur le tableau de bord lui-même.
                <header className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0 lg:hidden">
                        <MobileSidebarButton />
                        <Link href="/dashboard" className="flex items-center gap-2 min-w-0 text-base font-bold text-slate-900 tracking-tight">
                            <LogoCtIcon className="h-7 w-auto shrink-0" />
                            <span className="truncate">Cobol Training</span>
                        </Link>
                    </div>
                    <div className="ml-auto flex items-center gap-3 shrink-0">
                        {userId && (
                            <Link
                                href="/dashboard/badges"
                                aria-label={`${badgesCount} badge${badgesCount > 1 ? "s" : ""}`}
                                className="flex items-center gap-2 h-10 px-3.5 rounded-lg bg-white border border-ui-line text-amber-800 hover:bg-amber-50 transition-colors font-semibold text-sm shrink-0"
                            >
                                <Trophy className="h-4 w-4 text-amber-600" />
                                {badgesCount}
                            </Link>
                        )}
                        <div
                            title={userName}
                            className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-700"
                        >
                            {initial}
                        </div>
                    </div>
                </header>
            }
        >
            {children}
        </DashboardLayoutWrapper>
    );
}