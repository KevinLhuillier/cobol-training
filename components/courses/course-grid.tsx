import Link from "next/link";
import { Terminal, FolderKanban, Play, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SubscribeButton } from "@/components/subscribe-button";
import { hasAnyLessonAccess, hasCourseAccess, type SubscriptionInfo } from "@/utils/subscription";
import type { CourseKind } from "@/components/courses/course-kind";

export interface CourseGridItem {
    id: string;
    title: string;
    description: string | null;
    imageUrl: string | null;
    isFree: boolean;
    chapters: {
        isFree: boolean;
        lessons: {
            id: string;
            isFree: boolean;
            lessonProgress?: { isCompleted: boolean | null }[] | null;
        }[];
    }[];
}

interface CourseGridProps {
    // Chapitres et leçons déjà triés par position
    courses: CourseGridItem[];
    subscriptionInfo: SubscriptionInfo;
    kind: CourseKind;
    // Ancre du parcours d'onboarding posée sur le bouton de la première carte (cf.
    // components/onboarding/onboarding-tour.tsx) — uniquement sur /dashboard.
    firstCardAnchorId?: string;
}

const GRADIENTS = [
    "from-blue-500 to-cyan-400",
    "from-slate-700 to-slate-900",
    "from-purple-500 to-indigo-500",
    "from-orange-500 to-red-500",
];

// Grille de cartes des cours (menu Courses) ou des projets (menu Projects) : mêmes cartes,
// même progression et même lecteur (/dashboard/courses/[courseId]).
export function CourseGrid({ courses, subscriptionInfo, kind, firstCardAnchorId }: CourseGridProps) {
    const FallbackIcon = kind === "PROJECT" ? FolderKanban : Terminal;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {courses.map((course, index) => {
                const allLessons = course.chapters.flatMap(chap => chap.lessons);
                const totalLessons = allLessons.length;
                const completedLessons = allLessons.filter(l => l.lessonProgress?.[0]?.isCompleted);
                const progress = totalLessons === 0 ? 0 : Math.round((completedLessons.length / totalLessons) * 100);
                const nextUncompletedLesson = allLessons.find(l => !l.lessonProgress?.[0]?.isCompleted);

                let href = `/dashboard/courses/${course.id}`;
                if (nextUncompletedLesson) {
                    href = `/dashboard/courses/${course.id}?lessonId=${nextUncompletedLesson.id}`;
                } else if (allLessons.length > 0) {
                    href = `/dashboard/courses/${course.id}?lessonId=${allLessons[0].id}`;
                }

                // Cours payant sans abonnement : ouvrable s'il contient des leçons gratuites (aperçu),
                // le lecteur verrouille les autres
                const isLocked = !hasAnyLessonAccess(course, subscriptionInfo);
                const isPreview = !isLocked && !hasCourseAccess({ isFree: course.isFree }, subscriptionInfo);
                const statusLabel = isLocked ? "Members only" : progress === 100 ? "Completed" : isPreview ? "Free preview" : "Available";
                const randomGradient = GRADIENTS[index % GRADIENTS.length];

                return (
                    <div
                        key={course.id}
                        className={`flex flex-col bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 transition-all ${
                            isLocked ? "opacity-75 grayscale-[20%]" : "hover:shadow-md hover:-translate-y-1"
                        }`}
                    >
                        {course.imageUrl ? (
                            <div className="h-40 w-full relative">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={course.imageUrl} alt={course.title} className="w-full h-full object-cover" />
                                <div className="absolute top-4 right-4">
                                    <Badge variant="secondary" className="bg-white text-slate-900 shadow-sm border-none font-semibold">
                                        <span>{statusLabel}</span>
                                    </Badge>
                                </div>
                            </div>
                        ) : (
                            <div className={`h-40 w-full bg-gradient-to-br ${randomGradient} relative p-4 flex items-end justify-between`}>
                                <div className="bg-white/20 backdrop-blur-md p-2 rounded-xl">
                                    <FallbackIcon className="h-8 w-8 text-white drop-shadow-md" />
                                </div>
                                <Badge variant="secondary" className="bg-white text-slate-900 shadow-sm border-none font-semibold">
                                    <span>{statusLabel}</span>
                                </Badge>
                            </div>
                        )}

                        <div className="p-5 flex flex-col flex-1">
                            <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-1">
                                {course.title}
                            </h3>

                            <p className="text-xs text-slate-500 mb-6 line-clamp-2">
                                {course.description || (kind === "PROJECT" ? "No description for this project." : "No description for this module.")}
                            </p>

                            <div className="mb-6 mt-auto">
                                <div className="flex justify-between text-xs font-semibold text-slate-600 mb-2">
                                    <span>Progress</span>
                                    <span className={progress === 100 ? "text-emerald-600" : ""}>{progress}%</span>
                                </div>
                                <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden shadow-inner">
                                    <div
                                        className={`h-full rounded-full transition-all duration-500 ${progress === 100 ? 'bg-emerald-500' : 'bg-slate-800'}`}
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                            </div>

                            {isLocked ? (
                                <SubscribeButton className="w-full justify-center">
                                    Upgrade to unlock
                                </SubscribeButton>
                            ) : (
                                <Link href={href} className="w-full" id={index === 0 ? firstCardAnchorId : undefined}>
                                    <Button
                                        className={`w-full rounded-xl shadow-sm text-white ${
                                            progress === 100
                                                ? "bg-emerald-600 hover:bg-emerald-700"
                                                : "bg-slate-900 hover:bg-slate-800"
                                        }`}
                                    >
                                        {progress === 100 ? (
                                            <><CheckCircle className="mr-2 h-4 w-4" /> Completed (Review)</>
                                        ) : progress > 0 ? (
                                            <><Play className="mr-2 h-4 w-4 fill-current" /> Continue</>
                                        ) : (
                                            <><Play className="mr-2 h-4 w-4 fill-current" /> Start</>
                                        )}
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
