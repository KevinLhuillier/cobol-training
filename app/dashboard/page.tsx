import { prisma } from "@/prisma/client";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Terminal, Lock, Play, BookOpen, CheckCircle } from "lucide-react";

export default async function DashboardPage() {
    // 1. Authentification : Récupération du cookie et du userId
    const cookieStore = await cookies();
    const token = cookieStore.get("session_token")?.value;

    if (!token) return redirect("/login");

    let userId: string;
    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const { payload } = await jwtVerify(token, secret);
        userId = payload.userId as string;
        if (!userId) return redirect("/login");
    } catch (error) {
        return redirect("/login");
    }

    // 2. Récupération des cours AVEC la progression de l'utilisateur
    const courses = await prisma.course.findMany({
        where: { isPublished: true },
        orderBy: { createdAt: "desc" },
        include: {
            chapters: {
                orderBy: { position: "asc" },
                include: {
                    lessons: {
                        orderBy: { position: "asc" },
                        include: {
                            lessonProgress: {
                                where: { userId: userId }
                            }
                        }
                    }
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
                    <p className="text-sm text-slate-500 mt-1">Les modules d'apprentissage apparaîtront ici prochainement.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {courses.map((course, index) => {
                        // Aplatir toutes les leçons pour les calculs
                        const allLessons = course.chapters.flatMap(chap => chap.lessons);
                        const totalLessons = allLessons.length;

                        // Calcul de la progression
                        const completedLessons = allLessons.filter(l => l.lessonProgress?.[0]?.isCompleted);
                        const progress = totalLessons === 0 ? 0 : Math.round((completedLessons.length / totalLessons) * 100);

                        // Déterminer la prochaine leçon à faire (la première qui n'est pas terminée)
                        const nextUncompletedLesson = allLessons.find(l => !l.lessonProgress?.[0]?.isCompleted);

                        // Construire l'URL du bouton
                        let href = `/dashboard/courses/${course.id}`;
                        if (nextUncompletedLesson) {
                            // S'il reste des leçons à faire, on pointe vers la première non terminée
                            href = `/dashboard/courses/${course.id}?lessonId=${nextUncompletedLesson.id}`;
                        } else if (allLessons.length > 0) {
                            // Si tout est terminé, on renvoie vers la première leçon pour révision
                            href = `/dashboard/courses/${course.id}?lessonId=${allLessons[0].id}`;
                        }

                        // Simulation de verrouillage (à adapter si tu as une logique d'achat)
                        const isLocked = false;

                        // Gradients pour les images de fallback
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
                                            <Badge variant="secondary" className="bg-white text-slate-900 shadow-sm border-none font-semibold">
                                                <span>{progress === 100 ? "Terminé" : "Disponible"}</span>
                                            </Badge>
                                        </div>
                                    </div>
                                ) : (
                                    <div className={`h-40 w-full bg-gradient-to-br ${randomGradient} relative p-4 flex items-end justify-between`}>
                                        <div className="bg-white/20 backdrop-blur-md p-2 rounded-xl">
                                            <Terminal className="h-8 w-8 text-white drop-shadow-md" />
                                        </div>
                                        <Badge variant="secondary" className="bg-white text-slate-900 shadow-sm border-none font-semibold">
                                            <span>{progress === 100 ? "Terminé" : "Disponible"}</span>
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
                                            <span className={progress === 100 ? "text-emerald-600" : ""}>{progress}%</span>
                                        </div>
                                        <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden shadow-inner">
                                            <div
                                                className={`h-full rounded-full transition-all duration-500 ${progress === 100 ? 'bg-emerald-500' : 'bg-slate-800'}`}
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Bouton dynamique */}
                                    <Link href={href} className="w-full">
                                        <Button
                                            className={`w-full rounded-xl shadow-sm text-white ${
                                                progress === 100
                                                    ? "bg-emerald-600 hover:bg-emerald-700"
                                                    : "bg-slate-900 hover:bg-slate-800"
                                            }`}
                                        >
                                            {progress === 100 ? (
                                                <><CheckCircle className="mr-2 h-4 w-4" /> Terminé (Revoir)</>
                                            ) : progress > 0 ? (
                                                <><Play className="mr-2 h-4 w-4 fill-current" /> Continuer</>
                                            ) : (
                                                <><Play className="mr-2 h-4 w-4 fill-current" /> Démarrer</>
                                            )}
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