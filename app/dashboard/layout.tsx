import Sidebar from "@/components/Sidebar";
import { DashboardLayoutWrapper } from "@/components/dashboard-layout-wrapper";
import { Badge } from "@/components/ui/badge";
// 🟢 Import du client serveur Supabase
import { createClient } from "@/utils/supabase/server";

export default async function DashboardLayout({
                                                  children,
                                              }: {
    children: React.ReactNode;
}) {
    let isAdmin = false;
    let userName = "Student";
    let subscriptionStatus: string | null = null;
    let trialDaysLeft = 0;

    try {
        const supabase = await createClient();

        // 1. Récupération de l'utilisateur connecté
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
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
                    isAdmin={isAdmin}
                    subscriptionStatus={subscriptionStatus}
                    trialDaysLeft={trialDaysLeft}
                />
            }
            header={
                <header className="max-w-[1600px] w-full mx-auto mb-6 flex items-center justify-between px-2">
                    <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">
                        Cobol Training
                    </h1>
                    <div className="flex items-center gap-3">
                        <div className="text-right hidden sm:flex sm:flex-col sm:items-end gap-1">
                            <p className="text-sm font-bold text-slate-900">Welcome, {userName}</p>
                            {subscriptionStatus === "ACTIVE" ? (
                                <Badge className="border-none bg-emerald-100 text-emerald-700">Subscribed</Badge>
                            ) : subscriptionStatus === "TRIAL" && trialDaysLeft > 0 ? (
                                <Badge className="border-none bg-amber-100 text-amber-700">Trial</Badge>
                            ) : (
                                <Badge className="border-none bg-slate-100 text-slate-500">Trial ended</Badge>
                            )}
                        </div>
                        <div className="h-10 w-10 rounded-full bg-slate-200 border-2 border-white shadow-sm flex items-center justify-center font-bold text-slate-600">
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