import { prisma } from "@/prisma/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Terminal, Lock, Play, BookOpen } from "lucide-react";

export default async function DashboardPage() {
    // 1. Récupération des cours depuis la base de données
    // (Tu peux filtrer par isPublished: true si tu ne veux afficher que les cours publiés aux élèves)
    const courses = await prisma.course.findMany({
        where: {
            isPublished: true,
        },
        orderBy: {
            createdAt: "desc",
        },
        include: {
            chapters: {
                include: {
                    lessons: true
                }
            }
        }
    });

    return (
        <>
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900">Reprendre l&apos;apprentissage</h2>
                <p className="text-slate-500 mt-1">Voici les modules de votre parcours.</p>
            </div>

            {courses.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center shadow-sm">
                    <BookOpen className="h-10 w-10 text-slate-400 mx-auto mb-3" />
                    <h3 className="text-lg font-bold text-slate-900">Aucun cours disponible</h3>
                    <p className="text-sm text-slate-500 mt-1">Les modules d&apos;apprentissage apparaîtront ici prochainement.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {courses.map((course, index) => {
                        // Simulation de logique de progression / verrouillage (à adapter selon ta logique métier future)
                        // Par défaut, on met tout disponible ou basé sur ton modèle
                        const isLocked = false;
                        const progress = 0; // Tu pourras brancher le calcul de progression réel plus tard

                        // Gradient par défaut basé sur l'index si pas d'image
                        const gradients = [
                            "from-blue-500 to-cyan-400",
                            "from-slate-700 to-slate-900",
                            "from-purple-500 to-indigo-500",
                            "from-orange-500 to-red-500"
                        ];
                        const randomGradient = gradients[index % gradients.length];

                        return (
                            <div
                                key={course.id}
                                className={`flex flex-col bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 transition-all ${
                                    isLocked ? "opacity-75 grayscale-[20%]" : "hover:shadow-md hover:-translate-y-1"
                                }`}
                            >
                                {/* En-tête avec Image ou Gradient */}
                                {course.imageUrl ? (
                                    <div className="h-40 w-full relative">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={course.imageUrl} alt={course.title} className="w-full h-full object-cover" />
                                        <div className="absolute top-4 right-4">
                                            <Badge
                                                variant="secondary"
                                                className="bg-white text-slate-900 shadow-sm border-none font-semibold"
                                            >
                                                <span>Disponible</span>
                                            </Badge>
                                        </div>
                                    </div>
                                ) : (
                                    <div className={`h-40 w-full bg-gradient-to-br ${randomGradient} relative p-4 flex items-end justify-between`}>
                                        <div className="bg-white/20 backdrop-blur-md p-2 rounded-xl">
                                            <Terminal className="h-8 w-8 text-white drop-shadow-md" />
                                        </div>
                                        <Badge
                                            variant="secondary"
                                            className="bg-white text-slate-900 shadow-sm border-none font-semibold"
                                        >
                                            <span>Disponible</span>
                                        </Badge>
                                    </div>
                                )}

                                <div className="p-5 flex flex-col flex-1">
                                    <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-1">
                                        {course.title}
                                    </h3>

                                    <p className="text-xs text-slate-500 mb-6 line-clamp-2">
                                        {course.description || "Aucune description pour ce module."}
                                    </p>

                                    <div className="mb-6 mt-auto">
                                        <div className="flex justify-between text-xs font-semibold text-slate-600 mb-2">
                                            <span>Progression</span>
                                            <span>{progress}%</span>
                                        </div>
                                        <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden shadow-inner">
                                            <div
                                                className="h-full bg-slate-800 rounded-full transition-all duration-500"
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Lien vers la page de lecture/cours de l'étudiant */}
                                    <Link href={`/courses/${course.id}`} className="w-full">
                                        <Button
                                            className="w-full rounded-xl shadow-sm bg-slate-900 hover:bg-slate-800 text-white"
                                        >
                                            <Play className="mr-2 h-4 w-4 fill-current" />
                                            {progress > 0 ? "Continuer" : "Démarrer le cours"}
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </>
    );
}