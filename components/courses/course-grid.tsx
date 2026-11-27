import Link from "next/link";
import { Terminal, FolderKanban, Play, CheckCircle, Lock } from "lucide-react";
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

// Grille de cartes des cours (menu Courses) ou des projets (menu Projects) : mêmes cartes,
// même progression et même lecteur (/dashboard/courses/[courseId]).
export function CourseGrid({ courses, subscriptionInfo, kind, firstCardAnchorId }: CourseGridProps) {
    const FallbackIcon = kind === "PROJECT" ? FolderKanban : Terminal;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
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
                const isCompleted = progress === 100;
                const statusLabel = isLocked
                    ? "Members only"
                    : isCompleted
                        ? "Completed"
                        : isPreview
                            ? "Free preview"
                            : progress > 0
                                ? "In progress"
                                : "Available";
                // Visuel de repli (pas d'image de couverture) : aplat teinté selon l'état du module.
                const fallbackTint = isLocked ? "bg-slate-100" : isCompleted ? "bg-emerald-50" : progress > 0 ? "bg-ui-accent-soft" : "bg-slate-100";

                return (
                    <article
                        key={course.id}
                        className="flex flex-col bg-white rounded-xl overflow-hidden border border-ui-line transition-colors hover:border-ui-line-strong"
                    >
                        <div className={`h-[132px] w-full relative flex items-center justify-center ${course.imageUrl ? "" : fallbackTint}`}>
                            {course.imageUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={course.imageUrl}
                                    alt=""
                                    className={`absolute inset-0 w-full h-full object-cover ${isLocked ? "grayscale-[40%] opacity-80" : ""}`}
                                />
                            ) : isLocked ? (
                                <Lock className="h-6 w-6 text-slate-400" />
                            ) : (
                                <FallbackIcon className="h-8 w-8 text-slate-400" />
                            )}
                            <span
                                className={`absolute top-3 right-3 inline-flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-md text-xs font-semibold ${
                                    isCompleted ? "text-emerald-700" : "text-slate-700"
                                }`}
                            >
                                {isCompleted && <CheckCircle className="h-3 w-3" />}
                                {statusLabel}
                            </span>
                        </div>

                        <div className="p-5 flex flex-col gap-3.5 flex-1">
                            <div>
                                {kind === "COURSE" && <p className="text-xs text-ui-muted">Module {index + 1}</p>}
                                <h3 className={`mt-1 text-[17px] font-semibold line-clamp-1 ${isLocked ? "text-slate-600" : "text-slate-900"}`}>
                                    {course.title}
                                </h3>
                                <p className="mt-1.5 text-[13px] leading-relaxed text-ui-muted line-clamp-2">
                                    {course.description || (kind === "PROJECT" ? "No description for this project." : "No description for this module.")}
                                </p>
                            </div>

                            {!isLocked && (
                                <div className="mt-auto">
                                    <div className="flex justify-between text-xs text-slate-600 mb-1.5">
                                        <span>Progress</span>
                                        <span className={`font-semibold ${isCompleted ? "text-emerald-700" : ""}`}>{progress}%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-200/70 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-500 ${isCompleted ? "bg-emerald-500" : "bg-ui-accent"}`}
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                </div>
                            )}

                            {isLocked ? (
                                // SubscribeButton s'enveloppe dans son propre Link : le mt-auto doit être sur un parent.
                                <div className="mt-auto">
                                    <SubscribeButton className="w-full justify-center h-[42px] rounded-lg shadow-none bg-ui-accent-soft text-ui-accent hover:bg-[#dbe9f8]">
                                        Upgrade to unlock
                                    </SubscribeButton>
                                </div>
                            ) : (
                                <Link
                                    href={href}
                                    id={index === 0 ? firstCardAnchorId : undefined}
                                    className={`w-full h-[42px] inline-flex items-center justify-center gap-2 rounded-lg text-sm font-semibold transition-colors ${
                                        isCompleted
                                            ? "bg-white border border-ui-line-strong text-slate-900 hover:bg-ui-page"
                                            : "bg-ui-ink hover:bg-ui-ink-hover text-white"
                                    }`}
                                >
                                    {isCompleted ? (
                                        "Review"
                                    ) : progress > 0 ? (
                                        <><Play className="h-3.5 w-3.5 fill-current" /> Continue</>
                                    ) : (
                                        <><Play className="h-3.5 w-3.5 fill-current" /> Start</>
                                    )}
                                </Link>
                            )}
                        </div>
                    </article>
                );
            })}
        </div>
    );
}
