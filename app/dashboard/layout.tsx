import Sidebar from "@/components/Sidebar";
import { DashboardLayoutWrapper } from "@/components/dashboard-layout-wrapper";

export default function DashboardLayout({
                                            children,
                                        }: {
    children: React.ReactNode;
}) {
    return (
        <DashboardLayoutWrapper
            sidebar={<Sidebar />}
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