import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Dumbbell,
  Settings,
  LogOut,
  Lock,
  Play,
  LayoutGrid,
  Terminal,
  Database,
  Server
} from "lucide-react";
import LogoutButton from "@/components/LogoutButton";

export default function StudentDashboard() {
  // Données factices pour les cours
  const courses = [
    {
      id: 1,
      title: "Fondations COBOL",
      imageGradient: "from-blue-500 to-cyan-400",
      icon: Terminal,
      progress: 42,
      status: "available", // available, locked
    },
    {
      id: 2,
      title: "Automatisation JCL",
      imageGradient: "from-slate-700 to-slate-900",
      icon: LayoutGrid,
      progress: 0,
      status: "available",
    },
    {
      id: 3,
      title: "IBM DB2 & SQL",
      imageGradient: "from-purple-500 to-indigo-500",
      icon: Database,
      progress: 0,
      status: "locked",
    },
    {
      id: 4,
      title: "Transactions CICS",
      imageGradient: "from-orange-500 to-red-500",
      icon: Server,
      progress: 0,
      status: "locked",
    }
  ];

  const menuItems = [
    { icon: BookOpen, label: "Mes Cours", active: true },
    { icon: LayoutGrid, label: "Catalogue", active: false },
    { icon: Dumbbell, label: "Exercices", active: false },
    { icon: Settings, label: "Paramètres", active: false },
  ];

  return (
      <div className="min-h-screen bg-slate-100 p-4 md:p-6 lg:p-8 flex flex-col font-sans">

        {/* HEADER GLOBAL (Optionnel si on veut garder le nom de la plateforme visible) */}
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
        <main className="flex-1 max-w-[1600px] w-full mx-auto flex flex-col-reverse lg:flex-row gap-6">

          {/* ZONE CENTRALE : CONTENU (Prend l'espace restant) */}
          <section className="flex-1 bg-white rounded-3xl shadow-sm p-6 lg:p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900">Reprendre l'apprentissage</h2>
              <p className="text-slate-500 mt-1">Voici les modules de votre parcours.</p>
            </div>

            {/* GRILLE DES COURS */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {courses.map((course) => {
                const Icon = course.icon;
                const isLocked = course.status === "locked";

                return (
                    <div
                        key={course.id}
                        className={`flex flex-col bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 transition-all ${
                            isLocked ? "opacity-75 grayscale-[20%]" : "hover:shadow-md hover:-translate-y-1"
                        }`}
                    >
                      {/* FEATURED IMAGE (Simulée avec un dégradé) */}
                      <div className={`h-40 w-full bg-gradient-to-br ${course.imageGradient} relative p-4 flex items-end justify-between`}>
                        <div className="bg-white/20 backdrop-blur-md p-2 rounded-xl">
                          <Icon className="h-8 w-8 text-white drop-shadow-md" />
                        </div>
                        <Badge
                            variant="secondary"
                            className={`font-semibold ${
                                isLocked
                                    ? "bg-slate-900/50 text-white backdrop-blur-md border-none"
                                    : "bg-white text-slate-900 shadow-sm border-none"
                            }`}
                        >
                          {isLocked ? (
                              <span className="flex items-center gap-1"><Lock className="h-3 w-3" /> Bloqué</span>
                          ) : (
                              <span>Disponible</span>
                          )}
                        </Badge>
                      </div>

                      {/* DETAILS DU COURS */}
                      <div className="p-5 flex flex-col flex-1">
                        <h3 className="text-lg font-bold text-slate-900 mb-4 line-clamp-1">
                          {course.title}
                        </h3>

                        {/* PROGRESSION (Style sombre) */}
                        <div className="mb-6 mt-auto">
                          <div className="flex justify-between text-xs font-semibold text-slate-600 mb-2">
                            <span>Progression</span>
                            <span>{course.progress}%</span>
                          </div>
                          <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden shadow-inner">
                            <div
                                className="h-full bg-slate-800 rounded-full transition-all duration-500"
                                style={{ width: `${course.progress}%` }}
                            />
                          </div>
                        </div>

                        {/* BOUTON D'ACTION */}
                        <Button
                            className={`w-full rounded-xl shadow-sm ${
                                isLocked
                                    ? "bg-slate-200 text-slate-500 hover:bg-slate-200 cursor-not-allowed"
                                    : "bg-slate-900 hover:bg-slate-800 text-white"
                            }`}
                            disabled={isLocked}
                        >
                          {isLocked ? (
                              <>Verrouillé</>
                          ) : course.progress > 0 ? (
                              <>
                                <Play className="mr-2 h-4 w-4 fill-current" />
                                Continuer
                              </>
                          ) : (
                              <>Démarrer le cours</>
                          )}
                        </Button>
                      </div>
                    </div>
                );
              })}
            </div>
          </section>

          {/* SIDEBAR DE NAVIGATION (À droite) */}
          <aside className="w-full lg:w-[280px] xl:w-[320px] bg-white rounded-3xl shadow-sm p-6 flex flex-col shrink-0 lg:sticky lg:top-8 lg:h-[calc(100vh-4rem)]">

            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-3">
              Menu Principal
            </h3>

            <nav className="flex flex-col gap-2 flex-1">
              {menuItems.map((item, index) => {
                const MenuIcon = item.icon;
                return (
                    <button
                        key={index}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-sm font-medium ${
                            item.active
                                ? "bg-slate-100 text-slate-900"
                                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        }`}
                    >
                      <MenuIcon className={`h-5 w-5 ${item.active ? "text-slate-900" : "text-slate-400"}`} />
                      {item.label}
                    </button>
                );
              })}
            </nav>

            {/* ZONE DE DÉCONNEXION (En bas de la sidebar) */}
            <div className="mt-8 pt-6 border-t border-slate-100">
              <LogoutButton />
            </div>

          </aside>
        </main>
      </div>
  );
}