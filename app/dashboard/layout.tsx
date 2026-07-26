import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({
                                            children,
                                        }: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-slate-100 p-4 md:p-6 lg:p-8 flex flex-col font-sans">

            {/* HEADER GLOBAL */}
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

            {/* LAYOUT PRINCIPAL */}
            <main className="flex-1 max-w-[1600px] w-full mx-auto flex flex-col lg:flex-row gap-6">

                {/* SIDEBAR DE NAVIGATION (À gauche) */}
                <Sidebar />

                {/* ZONE CENTRALE : CONTENU DYNAMIQUE */}
                <section className="flex-1 bg-white rounded-3xl shadow-sm p-6 lg:p-8">
                    {children}
                </section>

            </main>
        </div>
    );
}