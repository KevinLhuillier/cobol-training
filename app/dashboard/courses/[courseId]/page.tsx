import { prisma } from "@/prisma/client";
import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import {
    PlayCircle,
    CheckCircle2,
    ChevronLeft
} from "lucide-react";
import { Preview } from "@/components/preview";
import { CourseProgressButton } from "@/components/courses/course-progress-button";
import { ExerciseForm } from "@/components/courses/exercise-form";

export default async function CoursePlayer({
                                               params,
                                               searchParams
                                           }: {
    params: Promise<{ courseId: string }>;
    searchParams: Promise<{ lessonId?: string }>;
}) {
    const resolvedParams = await params;
    const resolvedSearchParams = await searchParams;
    const { courseId } = resolvedParams;

    const cookieStore = await cookies();
    const token = cookieStore.get("session_token")?.value;

    if (!token) {
        return redirect("/login");
    }

    let userId: string;
    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const { payload } = await jwtVerify(token, secret);
        userId = payload.userId as string;

        if (!userId) {
            return redirect("/login");
        }
    } catch (error) {
        console.error("Session invalide :", error);
        return redirect("/login");
    }

    const course = await prisma.course.findUnique({
        where: { id: courseId },
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

    if (!course || !course.isPublished) {
        return notFound();
    }

    const allLessons = course.chapters.flatMap(chap => chap.lessons);

    if (allLessons.length === 0) {
        return (
            <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl p-8 text-center max-w-md shadow-sm">
                    <h2 className="text-lg font-bold text-slate-900 mb-2">Cours en cours de création</h2>
                    <p className="text-sm text-slate-500 mb-6">Ce cours ne contient pas encore de leçons.</p>
                    <Link href="/">
                        <Button className="bg-slate-900 text-white rounded-xl">Retour au tableau de bord</Button>
                    </Link>
                </div>
            </div>
        );
    }

    const currentLesson = allLessons.find(l => l.id === resolvedSearchParams.lessonId) || allLessons[0];
    const currentLessonIndex = allLessons.findIndex(l => l.id === currentLesson.id);
    const nextLesson = allLessons[currentLessonIndex + 1];
    const currentChapter = course.chapters.find(chap => chap.lessons.some(l => l.id === currentLesson.id));

    const isCurrentLessonCompleted = !!currentLesson?.lessonProgress?.[0]?.isCompleted;

    const getVimeoEmbedUrl = (url: string | null) => {
        if (!url) return null;
        const match = url.match(/(?:vimeo\.com\/|video\/|channels\/.+\/|groups\/.+\/videos\/|album\/.+\/video\/)(\d+)/);
        const videoId = match ? match[1] : url.split("/").pop();
        if (!videoId || isNaN(Number(videoId))) return null;
        return `https://player.vimeo.com/video/${videoId}`;
    };

    const vimeoEmbedUrl = getVimeoEmbedUrl(currentLesson.vimeoUrl);

    return (
        <div className="min-h-screen bg-slate-100 p-4 md:p-6 lg:p-8 flex flex-col gap-6 font-sans">

            {/* HEADER FLOTTANT ET ARRONDI */}
            <header className="bg-white rounded-2xl shadow-sm h-16 flex items-center px-6 shrink-0 justify-between max-w-[1600px] w-full mx-auto">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard">
                        <Button variant="ghost" size="icon" className="text-slate-500 hover:text-slate-900 rounded-full">
                            <ChevronLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <h1 className="font-semibold text-slate-800 line-clamp-1">
                        {course.title}
                    </h1>
                </div>
                <div className="text-sm text-slate-500 font-medium bg-slate-50 px-4 py-1.5 rounded-full shrink-0">
                    Formation active
                </div>
            </header>

            {/* LAYOUT PRINCIPAL */}
            <main className="flex-1 max-w-[1600px] w-full mx-auto flex flex-col lg:flex-row gap-6 overflow-hidden">

                {/* ZONE DE CONTENU (Panneau central) */}
                <section className="flex-1 bg-white rounded-3xl shadow-sm p-6 lg:p-8 flex flex-col overflow-y-auto">
                    <div className="max-w-5xl mx-auto w-full space-y-6">

                        <div>
                            <p className="text-sm font-medium text-blue-600 mb-1">
                                {currentChapter?.title} • Lesson {currentLesson.position}
                            </p>
                            <h2 className="text-2xl font-bold text-slate-900">{currentLesson.title}</h2>
                        </div>

                        {/* 1. LECTEUR VIDÉO (Seulement si une URL est présente) */}
                        {vimeoEmbedUrl && (
                            <div className="w-full aspect-video bg-slate-900 rounded-2xl shadow-md flex flex-col items-center justify-center relative overflow-hidden border-4 border-slate-50">
                                <iframe
                                    src={vimeoEmbedUrl}
                                    className="absolute top-0 left-0 w-full h-full border-0"
                                    allow="autoplay; fullscreen; picture-in-picture"
                                    allowFullScreen
                                />
                            </div>
                        )}

                        {/* 2. CONTENU TEXTUEL */}
                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                            {currentLesson.content ? (
                                // 🟢 On utilise Preview au lieu de dangerouslySetInnerHTML
                                <div className="text-slate-800">
                                    <Preview value={currentLesson.content} />
                                </div>
                            ) : (
                                <p className="italic text-slate-500">No instructions or content provided.</p>
                            )}
                        </div>

                        {/* 3. ACTIONS DE VALIDATION */}
                        <div className="pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-end gap-4">
                            {currentLesson.type === "EXERCISE" ? (
                                <div className="w-full">
                                    <ExerciseForm
                                        courseId={courseId}
                                        chapterId={currentChapter!.id}
                                        lessonId={currentLesson.id}
                                        initialAnswer={currentLesson.lessonProgress?.[0]?.exerciseAnswer}
                                        isCompleted={isCurrentLessonCompleted}
                                        exerciseStatus={currentLesson.lessonProgress?.[0]?.exerciseStatus}
                                        nextLessonId={nextLesson?.id}
                                    />
                                </div>
                            ) : (
                                <CourseProgressButton
                                    courseId={courseId}
                                    chapterId={currentChapter!.id}
                                    lessonId={currentLesson.id}
                                    isCompleted={isCurrentLessonCompleted}
                                    nextLessonId={nextLesson?.id}
                                />
                            )}
                        </div>

                    </div>
                </section>

                {/* BARRE LATÉRALE (Panneau de droite) */}
                <aside className="w-full lg:w-[400px] xl:w-[430px] bg-white rounded-3xl shadow-sm flex flex-col shrink-0 lg:h-[calc(100vh-10rem)] overflow-hidden">

                    <div className="p-6 bg-slate-50/50 rounded-t-3xl border-b border-slate-100">
                        <h3 className="font-bold text-slate-900 mb-4">Contenu du cours</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm text-slate-600">
                                <span>{course.chapters.length} chapitres au total</span>
                            </div>
                        </div>
                    </div>

                    <ScrollArea className="flex-1 p-4">
                        {/* @ts-expect-error - Contournement conflit type Radix/React 19 */}
                        <Accordion key={currentChapter?.id || "accordion"} type="multiple" defaultValue={[currentChapter?.id || ""]} className="w-full space-y-3">
                            {course.chapters.map((chapter, index) => (
                                <AccordionItem key={chapter.id} value={chapter.id} className="border-none bg-slate-50 rounded-xl px-2">
                                    <AccordionTrigger className="hover:no-underline py-4 px-3 text-left rounded-xl transition-colors hover:bg-slate-100">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                                Section {index + 1}
                                            </span>
                                            <span className="text-sm font-bold text-slate-800">
                                                {chapter.title}
                                            </span>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="pt-1 pb-3 px-1">
                                        <div className="space-y-1">
                                            {chapter.lessons.map((lesson) => {
                                                const isCurrent = lesson.id === currentLesson.id;
                                                const isCompleted = !!lesson.lessonProgress?.[0]?.isCompleted;

                                                return (
                                                    <Link
                                                        key={lesson.id}
                                                        href={`/dashboard/courses/${courseId}?lessonId=${lesson.id}`}
                                                        className={`flex items-start gap-3 p-3 rounded-lg transition-all block ${
                                                            isCurrent
                                                                ? "bg-white shadow-sm ring-1 ring-slate-200"
                                                                : "hover:bg-slate-100/50"
                                                        }`}
                                                    >

                                                        <div className="mt-0.5 shrink-0">
                                                            {isCurrent ? (
                                                                <PlayCircle className="h-5 w-5 text-blue-600" />
                                                            ) : isCompleted ? (
                                                                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                                                            ) : (
                                                                <CheckCircle2 className="h-5 w-5 text-slate-300" />
                                                            )}
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className={`text-sm ${
                                                                isCurrent ? "font-bold text-slate-900" : "font-medium text-slate-600"
                                                            }`}>
                                                                {lesson.position}. {lesson.title}
                                                            </p>
                                                        </div>
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </ScrollArea>
                </aside>
            </main>
        </div>
    );
}