import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import {
    PlayCircle,
    CheckCircle2,
    ChevronLeft,
    Lock
} from "lucide-react";
import { SubscribeButton } from "@/components/subscribe-button";
import { LessonBlocksView } from "@/components/courses/lesson-blocks/lesson-blocks-view";
import type { LessonBlock } from "@/components/courses/lesson-blocks/types";
import { CourseProgressButton } from "@/components/courses/course-progress-button";
import { LessonLinkIndicator } from "@/components/courses/lesson-link-indicator";
import { ExerciseForm } from "@/components/courses/exercise-form";
import { QuizPlayer } from "@/components/courses/quiz/quiz-player";
import type { QuizQuestion } from "@/components/courses/quiz/types";

// 🟢 Import du client serveur Supabase
import { createClient } from "@/utils/supabase/server";
import { hasAnyLessonAccess, hasFeedbackAccess, hasLessonAccess } from "@/utils/subscription";
import { courseKindListHref } from "@/components/courses/course-kind";

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
    // Seuls les cours, chapitres et leçons publiés sont visibles par l'étudiant (cf. filtres ci-dessous)
    const { data: rawCourse, error } = await supabase
        .from("courses")
        .select(`
            id,
            title,
            is_published,
            isFree:is_free,
            kind,
            chapters (
                id,
                title,
                position,
                isFree:is_free,
                lessons (
                    id,
                    title,
                    position,
                    isFree:is_free,
                    contentBlocks:content_blocks,
                    quizQuestions:quiz_questions,
                    quizPassRate:quiz_pass_rate,
                    type,
                    lessonProgress:lesson_progress (
                        isCompleted:is_completed,
                        exerciseAnswer:exercise_answer,
                        exerciseStatus:exercise_status,
                        reviewFeedback:review_feedback,
                        user_id
                    ),
                    quizAttempts:quiz_attempts (
                        id,
                        score,
                        total,
                        passed,
                        createdAt:created_at,
                        user_id
                    )
                )
            )
        `)
        .eq("id", courseId)
        .eq("is_published", true)
        // Seuls les chapitres et leçons publiés sont visibles (filtre sur les relations imbriquées, le cours est conservé)
        .eq("chapters.is_published", true)
        .eq("chapters.lessons.is_published", true)
        .order("position", { referencedTable: "chapters", ascending: true })
        .order("position", { referencedTable: "chapters.lessons", ascending: true })
        .order("created_at", { referencedTable: "chapters.lessons.quiz_attempts", ascending: false })
        .maybeSingle();

    if (error) {
        console.error("🔥 ERREUR SUPABASE (Course Player):", JSON.stringify(error, null, 2));
    }

    if (!rawCourse) {
        return notFound();
    }

    // Liste d'origine (menu Courses ou Projects) pour les liens retour et redirections
    const listHref = courseKindListHref(rawCourse.kind);

    // 2b. GARDE-FOU ABONNEMENT : les cours non-gratuits nécessitent un abonnement actif, sauf pour
    // leurs leçons gratuites (le griséage sur /dashboard est cosmétique seul — les vérifications
    // ci-dessous empêchent l'accès direct par URL)
    const { data: profile } = await supabase
        .from("users")
        .select("subscription_status, trial_ends_at, mainframe_ends_at")
        .eq("id", user.id)
        .single();

    const subscriptionInfo = {
        subscription_status: profile?.subscription_status ?? null,
        trial_ends_at: profile?.trial_ends_at ?? null,
        mainframe_ends_at: profile?.mainframe_ends_at ?? null,
    };

    // Correction/feedback des exercices : retirée aux membres de l'offre à vie une fois leur
    // fenêtre terminée (ils gardent l'accès aux modules). Garde réelle côté base : trigger
    // enforce_feedback_access sur lesson_progress ; ceci ne sert qu'à expliquer l'absence du bouton.
    const canRequestFeedback = hasFeedbackAccess(subscriptionInfo);

// 3. FORMATAGE DES DONNÉES

    // 🟢 3a. Définition des types pour rassurer TypeScript et ESLint
    type RawProgress = {
        user_id: string;
        isCompleted: boolean | null;
        exerciseAnswer: string | null;
        exerciseStatus: string | null;
        reviewFeedback: string | null;
    };

    type RawQuizAttempt = {
        id: string;
        score: number;
        total: number;
        passed: boolean;
        createdAt: string;
        user_id: string;
    };

    type RawLesson = {
        id: string;
        title: string;
        position: number;
        isFree: boolean;
        contentBlocks: LessonBlock[] | null;
        quizQuestions: QuizQuestion[] | null;
        quizPassRate: number | null;
        type: string;
        lessonProgress: RawProgress[] | null;
        quizAttempts: RawQuizAttempt[] | null;
    };

    type RawChapter = {
        id: string;
        title: string;
        position: number;
        isFree: boolean;
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
                const userQuizAttempts = (lesson.quizAttempts || []).filter(
                    (a: RawQuizAttempt) => a.user_id === user.id
                );

                return {
                    ...lesson,
                    lessonProgress: userProgress,
                    quizAttempts: userQuizAttempts,
                    isLocked: !hasLessonAccess(rawCourse, chapter, lesson, subscriptionInfo)
                };
            })
        })).filter(chapter => chapter.lessons.length > 0) // un chapitre sans leçon publiée n'est pas affiché
    };

    // Aucune leçon accessible (cours payant sans leçon gratuite) : retour à la liste
    if (!hasAnyLessonAccess(formattedCourse, subscriptionInfo)) {
        return redirect(listHref);
    }

    const allLessons = formattedCourse.chapters.flatMap(chap => chap.lessons);

    if (allLessons.length === 0) {
        return (
            <div className="min-h-screen bg-ui-page flex items-center justify-center p-4 font-sans">
                <div className="bg-white rounded-xl border border-ui-line p-8 text-center max-w-md">
                    <h2 className="text-lg font-bold text-slate-900 mb-2">Cours en cours de création</h2>
                    <p className="text-sm text-slate-500 mb-6">Ce cours ne contient pas encore de leçons publiées.</p>
                    <Link href={listHref}>
                        <Button className="bg-ui-ink text-white rounded-lg">Retour au tableau de bord</Button>
                    </Link>
                </div>
            </div>
        );
    }

    // Détermination de la leçon courante (celle demandée dans l'URL, ou la première accessible par défaut).
    // Une leçon verrouillée reste affichable : son contenu est remplacé par l'invitation à s'abonner.
    const currentLesson = allLessons.find(l => l.id === resolvedSearchParams.lessonId)
        || allLessons.find(l => !l.isLocked)
        || allLessons[0];
    const currentLessonIndex = allLessons.findIndex(l => l.id === currentLesson.id);
    const nextLesson = allLessons[currentLessonIndex + 1];
    const currentChapter = formattedCourse.chapters.find(chap => chap.lessons.some(l => l.id === currentLesson.id));

    // La progression est validée si le tableau lessonProgress n'est pas vide et que isCompleted est true
    const isCurrentLessonCompleted = !!currentLesson?.lessonProgress?.[0]?.isCompleted;

    const isLessonDone = (lesson: (typeof allLessons)[number]) => !!lesson.lessonProgress?.[0]?.isCompleted;
    const completedCount = allLessons.filter(isLessonDone).length;
    const courseProgress = Math.round((completedCount / allLessons.length) * 100);

    return (
        <div className="min-h-screen bg-ui-page flex flex-col font-sans">

            {/* EN-TÊTE : retour, cours + leçon courante, progression globale */}
            <header className="bg-white border-b border-ui-line shrink-0">
                <div className="max-w-[1600px] mx-auto h-16 px-4 md:px-6 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                        <Link
                            href={listHref}
                            className="inline-flex items-center gap-1.5 h-10 px-3 rounded-lg border border-ui-line text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-ui-page transition-colors shrink-0"
                        >
                            <ChevronLeft className="h-4 w-4" />
                            <span className="hidden sm:inline">Dashboard</span>
                        </Link>
                        <div className="min-w-0">
                            <p className="text-xs text-ui-muted truncate">{formattedCourse.title}</p>
                            <h1 className="text-[15px] font-semibold text-slate-900 truncate">{currentLesson.title}</h1>
                        </div>
                    </div>
                    <div className="hidden md:flex items-center gap-3 shrink-0">
                        <span className="text-[13px] text-ui-muted">
                            {completedCount} / {allLessons.length} lessons
                        </span>
                        <div className="w-32 h-1.5 bg-slate-200/70 rounded-full overflow-hidden">
                            <div className="h-full rounded-full bg-ui-accent" style={{ width: `${courseProgress}%` }} />
                        </div>
                    </div>
                </div>
            </header>

            {/* LAYOUT PRINCIPAL */}
            <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 md:p-6 flex flex-col lg:flex-row gap-6 items-start">

                {/* ZONE DE CONTENU (Panneau central) */}
                <section className="flex-1 min-w-0 w-full bg-white rounded-xl border border-ui-line p-6 lg:p-7">
                    <div className="max-w-5xl w-full mx-auto space-y-6">

                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-ui-accent">
                                {currentChapter?.title} · Lesson {currentLesson.position}
                            </p>
                            <h2 className="mt-2 text-2xl md:text-[26px] font-bold text-slate-900 tracking-tight">{currentLesson.title}</h2>
                        </div>

                        {/* CONTENU : une leçon verrouillée n'affiche que l'invitation à s'abonner (son contenu n'est
                            jamais rendu) ; une leçon QUIZ n'a pas de blocs de contenu, le quiz remplace toute la zone. */}
                        {currentLesson.isLocked ? (
                            <div className="bg-ui-page p-8 rounded-xl border border-ui-line flex flex-col items-center text-center gap-4">
                                <div className="h-12 w-12 rounded-full bg-white border border-ui-line flex items-center justify-center">
                                    <Lock className="h-5 w-5 text-slate-500" />
                                </div>
                                <div>
                                    <h3 className="text-base font-semibold text-slate-900">Members only</h3>
                                    <p className="text-sm text-ui-muted mt-1">
                                        Subscribe to unlock this lesson and the rest of the course.
                                    </p>
                                </div>
                                <SubscribeButton className="rounded-lg shadow-none">Upgrade to unlock</SubscribeButton>
                            </div>
                        ) : currentLesson.type === "QUIZ" ? (
                            <QuizPlayer
                                courseId={courseId}
                                chapterId={currentChapter!.id}
                                lessonId={currentLesson.id}
                                questions={currentLesson.quizQuestions ?? []}
                                passRate={currentLesson.quizPassRate ?? 70}
                                attempts={currentLesson.quizAttempts ?? []}
                                isCompleted={isCurrentLessonCompleted}
                                nextLessonId={nextLesson?.id}
                            />
                        ) : (
                            <>
                                {/* blocs (vidéo/texte/image/code, dans l'ordre choisi par l'admin). Le bloc
                                    Solution éventuel n'affiche son contenu que si l'exercice est approuvé. */}
                                {currentLesson.contentBlocks && currentLesson.contentBlocks.length > 0 ? (
                                    <LessonBlocksView
                                        blocks={currentLesson.contentBlocks}
                                        isSolutionUnlocked={currentLesson.lessonProgress?.[0]?.exerciseStatus === "APPROVED"}
                                    />
                                ) : (
                                    <div className="bg-ui-page p-6 rounded-lg border border-ui-line">
                                        <p className="italic text-ui-muted">No instructions or content provided.</p>
                                    </div>
                                )}

                                {/* 3. ACTIONS DE VALIDATION */}
                                <div className="pt-6 border-t border-ui-line flex flex-col sm:flex-row sm:items-center sm:justify-end gap-4">
                                    {currentLesson.type === "EXERCISE" ? (
                                        <div className="w-full">
                                            <ExerciseForm
                                                courseId={courseId}
                                                chapterId={currentChapter!.id}
                                                lessonId={currentLesson.id}
                                                initialAnswer={currentLesson.lessonProgress?.[0]?.exerciseAnswer}
                                                isCompleted={isCurrentLessonCompleted}
                                                exerciseStatus={currentLesson.lessonProgress?.[0]?.exerciseStatus}
                                                reviewFeedback={currentLesson.lessonProgress?.[0]?.reviewFeedback}
                                                canRequestFeedback={canRequestFeedback}
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
                            </>
                        )}

                    </div>
                </section>

                {/* BARRE LATÉRALE : contenu du cours */}
                <aside
                    aria-label="Course content"
                    className="w-full lg:w-[360px] xl:w-[380px] bg-white rounded-xl border border-ui-line flex flex-col shrink-0 lg:sticky lg:top-6 lg:h-[calc(100vh-8.5rem)] overflow-hidden"
                >
                    <div className="px-5 py-4 border-b border-ui-line flex items-center justify-between">
                        <h3 className="text-[15px] font-semibold text-slate-900">Course content</h3>
                        <span className="text-xs font-semibold text-ui-muted">{courseProgress}%</span>
                    </div>

                    {/* Défilement natif (et non ScrollArea) : fiable sur tous les navigateurs / tactiles, avec
                        une barre visible aux couleurs du site (utilitaire scrollbar-site, app/globals.css). */}
                    <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-2 scrollbar-site">
                        {/* @ts-expect-error - Contournement conflit type Radix/React 19 */}
                        <Accordion key={currentChapter?.id || "accordion"} type="multiple" defaultValue={[currentChapter?.id || ""]} className="w-full space-y-0.5">
                            {formattedCourse.chapters.map((chapter, index) => {
                                const chapterDone = chapter.lessons.filter(isLessonDone).length;
                                const isChapterComplete = chapterDone === chapter.lessons.length;

                                return (
                                    <AccordionItem
                                        key={chapter.id}
                                        value={chapter.id}
                                        className={`border-none rounded-lg ${chapter.id === currentChapter?.id ? "bg-ui-page/70" : ""}`}
                                    >
                                        <AccordionTrigger className="hover:no-underline py-3 px-3 text-left rounded-lg transition-colors hover:bg-ui-page">
                                            <div className="flex flex-1 items-center justify-between gap-3 min-w-0">
                                                <div className="flex flex-col gap-0.5 min-w-0">
                                                    <span className="text-[11px] font-semibold text-ui-muted uppercase tracking-wider">
                                                        Chapter {index + 1}
                                                    </span>
                                                    <span className="text-sm font-semibold text-slate-900">{chapter.title}</span>
                                                </div>
                                                <span className={`text-xs font-semibold shrink-0 ${isChapterComplete ? "text-emerald-700" : "text-ui-muted"}`}>
                                                    {chapterDone}/{chapter.lessons.length}
                                                </span>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="pt-0 pb-2 px-2">
                                            <div className="space-y-0.5">
                                                {chapter.lessons.map((lesson) => {
                                                    const isCurrent = lesson.id === currentLesson.id;
                                                    const isCompleted = isLessonDone(lesson);

                                                    return (
                                                        <Link
                                                            key={lesson.id}
                                                            href={`/dashboard/courses/${courseId}?lessonId=${lesson.id}`}
                                                            aria-current={isCurrent ? "page" : undefined}
                                                            className={`flex items-start gap-2.5 px-2.5 py-2.5 rounded-md transition-colors ${
                                                                isCurrent
                                                                    ? "bg-ui-accent-soft shadow-[inset_3px_0_0_var(--color-ui-accent)]"
                                                                    : "hover:bg-ui-page"
                                                            }`}
                                                        >
                                                            <div className="mt-0.5 shrink-0">
                                                                <LessonLinkIndicator>
                                                                    {lesson.isLocked ? (
                                                                        <Lock className={`h-4 w-4 ${isCurrent ? "text-ui-accent" : "text-slate-400"}`} />
                                                                    ) : isCurrent ? (
                                                                        <PlayCircle className="h-4 w-4 text-ui-accent" />
                                                                    ) : isCompleted ? (
                                                                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                                                    ) : (
                                                                        <CheckCircle2 className="h-4 w-4 text-slate-300" />
                                                                    )}
                                                                </LessonLinkIndicator>
                                                            </div>
                                                            <p className={`text-sm ${
                                                                isCurrent
                                                                    ? "font-semibold text-slate-900"
                                                                    : lesson.isLocked
                                                                        ? "text-slate-400"
                                                                        : "text-slate-600"
                                                            }`}>
                                                                {lesson.position}. {lesson.title}
                                                            </p>
                                                        </Link>
                                                    );
                                                })}
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                );
                            })}
                        </Accordion>
                    </div>
                </aside>
            </main>
        </div>
    );
}
