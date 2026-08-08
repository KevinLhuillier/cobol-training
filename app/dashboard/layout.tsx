import Sidebar from "@/components/Sidebar";
import { DashboardLayoutWrapper } from "@/components/dashboard-layout-wrapper";
// 🟢 Import du client serveur Supabase
import { createClient } from "@/utils/supabase/server";

export default async function DashboardLayout({
                                                  children,
                                              }: {
    children: React.ReactNode;
}) {
    let isAdmin = false;
    let userName = "Student";

    try {
        const supabase = await createClient();

        // 1. Récupération de l'utilisateur connecté
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
            // 2. Récupération de son profil public (rôle et nom)
            const { data: profile } = await supabase
                .from("users")
                .select("role, name")
                .eq("id", user.id)
                .single();

            if (profile) {
                isAdmin = profile.role === "ADMIN";
                if (profile.name) {
                    userName = profile.name;
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
            sidebar={<Sidebar isAdmin={isAdmin} />}
            header={
                <header className="max-w-[1600px] w-full mx-auto mb-6 flex items-center justify-between px-2">
                    <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">
                        Code Legacy
                    </h1>
                    <div className="flex items-center gap-3">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-bold text-slate-900">Welcome, {userName}</p>
                            <p className="text-xs text-slate-500">Mainframe Developer Path</p>
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