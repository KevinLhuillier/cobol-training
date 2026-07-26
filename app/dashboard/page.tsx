import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Terminal, LayoutGrid, Database, Server, Lock, Play } from "lucide-react";

export default function DashboardPage() {
    const courses = [
        { id: 1, title: "Fondations COBOL", imageGradient: "from-blue-500 to-cyan-400", icon: Terminal, progress: 42, status: "available" },
        { id: 2, title: "Automatisation JCL", imageGradient: "from-slate-700 to-slate-900", icon: LayoutGrid, progress: 0, status: "available" },
        { id: 3, title: "IBM DB2 & SQL", imageGradient: "from-purple-500 to-indigo-500", icon: Database, progress: 0, status: "locked" },
        { id: 4, title: "Transactions CICS", imageGradient: "from-orange-500 to-red-500", icon: Server, progress: 0, status: "locked" }
    ];

    return (
        <>
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900">Reprendre l&apos;apprentissage</h2>
                <p className="text-slate-500 mt-1">Voici les modules de votre parcours.</p>
            </div>

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

                            <div className="p-5 flex flex-col flex-1">
                                <h3 className="text-lg font-bold text-slate-900 mb-4 line-clamp-1">
                                    {course.title}
                                </h3>

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
                                        <><Play className="mr-2 h-4 w-4 fill-current" /> Continuer</>
                                    ) : (
                                        <>Démarrer le cours</>
                                    )}
                                </Button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </>
    );
}