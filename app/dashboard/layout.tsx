import Sidebar from "@/components/Sidebar";
import { DashboardLayoutWrapper } from "@/components/dashboard-layout-wrapper";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

export default async function DashboardLayout({
                                                  children,
                                              }: {
    children: React.ReactNode;
}) {
    // 🟢 1. Détermination du rôle admin
    let isAdmin = false;

    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("session_token")?.value;

        if (token) {
            const secret = new TextEncoder().encode(process.env.JWT_SECRET);
            const { payload } = await jwtVerify(token, secret);

            // Assure-toi que la valeur correspond exactement à ce que tu as mis lors du login (ex: "ADMIN", "admin", etc.)
            isAdmin = payload.role === "ADMIN";
        }
    } catch (error) {
        console.error("Erreur lors de la vérification du rôle dans le layout:", error);
        // Si le token est invalide, on laisse isAdmin à false
    }

    return (
        <DashboardLayoutWrapper
            // 🟢 2. On passe la prop à la Sidebar
            sidebar={<Sidebar isAdmin={isAdmin} />}
            header={
                <header className="max-w-[1600px] w-full mx-auto mb-6 flex items-center justify-between px-2">
                    <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">
                        Code Legacy
                    </h1>
                    <div className="flex items-center gap-3">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-bold text-slate-900">Bienvenue, Étudiant</p>
                            <p className="text-xs text-slate-500">Parcours Développeur Mainframe</p>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-slate-200 border-2 border-white shadow-sm flex items-center justify-center font-bold text-slate-600">
                            E
                        </div>
                    </div>
                </header>
            }
        >
            {children}
        </DashboardLayoutWrapper>
    );
}