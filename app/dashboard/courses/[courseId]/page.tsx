import { notFound, redirect } from "next/navigation";
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

// 🟢 Import du client serveur Supabase
import { createClient } from "@/utils/supabase/server";

export default async function CoursePlayer({
                                               params,
                                               searchParams
                                           }: {
    params: Promise<{ courseId: string }>;
    searchParams: Promise<{ lessonId?: string }>;
}) {
    const supabase = await createClient();

    // 1. SÉCURITÉ : Vérification de la session Supabase
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return redirect("/auth/login");
    }

    const resolvedParams = await params;
    const resolvedSearchParams = await searchParams;
    const { courseId } = resolvedParams;

    // 2. FETCH SUPABASE : Récupération massive (Cours -> Chapitres -> Leçons -> Progression)
    // Seuls les chapitres et cours "publiés" devraient normalement être visibles par l'étudiant
    const { data: rawCourse, error } = await supabase
        .from("courses")
        .select(`
            id,
            title,
            is_published,
            chapters (
                id,
                title,
                position,
                lessons (
                    id,
                    title,
                    position,
                    content,
                    type,
                    videoUrl:vimeo_url,
                    lessonProgress:lesson_progress (
                        isCompleted:is_completed,
                        exerciseAnswer:exercise_answer,
                        exerciseStatus:exercise_status,
                        reviewFeedback:review_feedback,
                        user_id
                    )
                )
            )
        `)
        .eq("id", courseId)
        .eq("is_published", true)
        .order("position", { referencedTable: "chapters", ascending: true })
        .order("position", { referencedTable: "chapters.lessons", ascending: true })
        .maybeSingle();

    if (error) {
        console.error("🔥 ERREUR SUPABASE (Course Player):", JSON.stringify(error, null, 2));
    }

    if (!rawCourse) {
        return notFound();
    }

// 3. FORMATAGE DES DONNÉES

    // 🟢 3a. Définition des types pour rassurer TypeScript et ESLint
    type RawProgress = {
        user_id: string;
        isCompleted: boolean | null;
        exerciseAnswer: string | null;
        exerciseStatus: string | null;
        reviewFeedback: string | null;
    };

    type RawLesson = {
        id: string;
        title: string;
        position: number;
        content: string | null;
        type: string;
        videoUrl: string | null;
        lessonProgress: RawProgress[] | null;
    };

    type RawChapter = {
        id: string;
        title: string;
        position: number;
        lessons: RawLesson[] | null;
    };

    // 🟢 3b. Application des types lors du map()
    const formattedCourse = {
        ...rawCourse,
        chapters: (rawCourse?.chapters || []).map((chapter: RawChapter) => ({
            ...chapter,
            lessons: (chapter.lessons || []).map((lesson: RawLesson) => {

                // On filtre la progression pour ne garder QUE celle de l'utilisateur connecté
                const userProgress = (lesson.lessonProgress || []).filter(
                    (p: RawProgress) => p.user_id === user.id
                );

                return {
                    ...lesson,
                    lessonProgress: userProgress
                };
            })
        }))
    };

    const allLessons = formattedCourse.chapters.flatMap(chap => chap.lessons);

    if (allLessons.length === 0) {
        return (
            <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-sans">
                <div className="bg-white rounded-2xl p-8 text-center max-w-md shadow-sm">
                    <h2 className="text-lg font-bold text-slate-900 mb-2">Cours en cours de création</h2>
                    <p className="text-sm text-slate-500 mb-6">Ce cours ne contient pas encore de leçons publiées.</p>
                    <Link href="/dashboard">
                        <Button className="bg-slate-900 text-white rounded-xl">Retour au tableau de bord</Button>
                    </Link>
                </div>
            </div>
        );
    }

    // Détermination de la leçon courante (celle demandée dans l'URL, ou la première par défaut)
    const currentLesson = allLessons.find(l => l.id === resolvedSearchParams.lessonId) || allLessons[0];
    const currentLessonIndex = allLessons.findIndex(l => l.id === currentLesson.id);
    const nextLesson = allLessons[currentLessonIndex + 1];
    const currentChapter = formattedCourse.chapters.find(chap => chap.lessons.some(l => l.id === currentLesson.id));

    // La progression est validée si le tableau lessonProgress n'est pas vide et que isCompleted est true
    const isCurrentLessonCompleted = !!currentLesson?.lessonProgress?.[0]?.isCompleted;

    const getVimeoEmbedUrl = (url: string | null) => {
        if (!url) return null;
        const match = url.match(/(?:vimeo\.com\/|video\/|channels\/.+\/|groups\/.+\/videos\/|album\/.+\/video\/)(\d+)/);
        const videoId = match ? match[1] : url.split("/").pop();
        if (!videoId || isNaN(Number(videoId))) return null;
        return `https://player.vimeo.com/video/${videoId}`;
    };

    const vimeoEmbedUrl = getVimeoEmbedUrl(currentLesson.videoUrl);

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
                        {formattedCourse.title}
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

                        {/* 1. LECTEUR VIDÉO */}
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
                                    {/* 🟢 Le composant ExerciseForm devra également être migré vers Supabase */}
                                    <ExerciseForm
                                        courseId={courseId}
                                        chapterId={currentChapter!.id}
                                        lessonId={currentLesson.id}
                                        initialAnswer={currentLesson.lessonProgress?.[0]?.exerciseAnswer}
                                        isCompleted={isCurrentLessonCompleted}
                                        exerciseStatus={currentLesson.lessonProgress?.[0]?.exerciseStatus}
                                        reviewFeedback={currentLesson.lessonProgress?.[0]?.reviewFeedback}
                                        nextLessonId={nextLesson?.id}
                                    />
                                </div>
                            ) : (
                                /* 🟢 Le composant CourseProgressButton devra également être migré vers Supabase */
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

                {/* BARRE LATÉRALE (Menu) */}
                <aside className="w-full lg:w-[400px] xl:w-[430px] bg-white rounded-3xl shadow-sm flex flex-col shrink-0 lg:h-[calc(100vh-10rem)] overflow-hidden">

                    <div className="p-6 bg-slate-50/50 rounded-t-3xl border-b border-slate-100">
                        <h3 className="font-bold text-slate-900 mb-4">Contenu du cours</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm text-slate-600">
                                <span>{formattedCourse.chapters.length} chapitres au total</span>
                            </div>
                        </div>
                    </div>

                    <ScrollArea className="flex-1 p-4">
                        {/* @ts-expect-error - Contournement conflit type Radix/React 19 */}
                        <Accordion key={currentChapter?.id || "accordion"} type="multiple" defaultValue={[currentChapter?.id || ""]} className="w-full space-y-3">
                            {formattedCourse.chapters.map((chapter, index) => (
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