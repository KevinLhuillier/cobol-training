import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { LessonTitleForm } from "@/components/courses/lesson-title-form";
import { LessonBuilder } from "@/components/courses/lesson-builder";
import { PublishToggleButton } from "@/components/courses/publish-toggle-button";
import { FreeToggleButton } from "@/components/courses/free-toggle-button";
import { QuizBuilder } from "@/components/courses/quiz/quiz-builder";
import type { LessonBlock } from "@/components/courses/lesson-blocks/types";
import type { QuizQuestion } from "@/components/courses/quiz/types";

// 🟢 Import du client serveur Supabase
import { createClient } from "@/utils/supabase/server";

export default async function LessonDetailsPage({
                                                    params
                                                }: {
    params: Promise<{ courseId: string; chapterId: string; lessonId: string }>
}) {
    const supabase = await createClient();

    // 1. SÉCURITÉ : Vérification stricte du rôle Admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return redirect("/auth/login");

    const { data: profile } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();

    if (!profile || profile.role !== "ADMIN") {
        return redirect("/dashboard");
    }

    // 2. RÉSOLUTION DES PARAMÈTRES
    const resolvedParams = await params;
    const { courseId, chapterId, lessonId } = resolvedParams;

    // 3. FETCH SUPABASE : Récupération de la leçon
    // On utilise les alias (ex: chapterId:chapter_id) pour conserver le format de données attendu par les composants
    const { data: lesson, error } = await supabase
        .from("lessons")
        .select(`
            id,
            title,
            contentBlocks:content_blocks,
            quizQuestions:quiz_questions,
            quizPassRate:quiz_pass_rate,
            position,
            type,
            isPublished:is_published,
            isFree:is_free,
            chapterId:chapter_id,
            chapter:chapters ( isPublished:is_published, isFree:is_free )
        `)
        .eq("id", lessonId)
        .eq("chapter_id", chapterId) // Sécurité : assure que la leçon appartient bien à ce chapitre
        .maybeSingle();

    // Gestion des erreurs SQL
    if (error) {
        console.error("🔥 ERREUR SUPABASE (Lesson Details):", error);
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="bg-red-50 border border-red-200 text-red-700 p-8 rounded-xl max-w-lg">
                    <h1 className="font-bold text-xl mb-4">Erreur SQL Supabase</h1>
                    <p className="font-mono text-sm bg-white p-4 rounded-lg border border-red-100">{error.message}</p>
                </div>
            </div>
        );
    }

    if (!lesson) {
        return notFound();
    }

    // Relation to-one : PostgREST peut la renvoyer sous forme d'objet ou de tableau selon le sens d'embedding
    const rawChapter = Array.isArray(lesson.chapter) ? lesson.chapter[0] : lesson.chapter;
    const chapterIsPublished = !!rawChapter?.isPublished;
    const chapterIsFree = !!rawChapter?.isFree;

    return (
        <div className="font-sans">
            <div className="max-w-7xl mx-auto">

                {/* EN TÊTE */}
                <div className="mb-8 flex flex-col lg:flex-row lg:items-end justify-between gap-4">
                    <div className="flex items-center gap-4">
                        {/* 🟢 Lien mis à jour vers le nouvel espace Dashboard */}
                        <Link
                            href={`/dashboard/admin/courses/${courseId}/chapters/${chapterId}`}
                            className="h-10 w-10 bg-white border border-ui-line rounded-lg flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                        <div>
                            <h1 className="text-2xl md:text-[26px] font-bold text-slate-900 tracking-tight">{lesson.title}</h1>
                            <p className="mt-1 text-sm text-ui-muted">Lesson setup · 
                                Manage your lesson title and content.
                            </p>
                            {lesson.isPublished && !chapterIsPublished && (
                                <p className="text-xs font-medium text-amber-600 mt-1">
                                    This lesson is published but its chapter is a draft, so students cannot see it yet.
                                </p>
                            )}
                            {lesson.isFree && !chapterIsFree && (
                                <p className="text-xs font-medium text-amber-600 mt-1">
                                    This lesson is free but its chapter is paid, so only subscribers can access it.
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {lesson.isFree && (
                            <Badge className="px-2 py-0.5 rounded-md text-xs font-semibold border-none bg-ui-accent-soft text-ui-accent">
                                Free
                            </Badge>
                        )}
                        <Badge
                            className={`px-2 py-0.5 rounded-md text-xs font-semibold border-none ${
                                lesson.isPublished
                                    ? "bg-emerald-50 text-emerald-800"
                                    : "bg-amber-50 text-amber-800"
                            }`}
                        >
                            {lesson.isPublished ? "Published" : "Draft"}
                        </Badge>
                        <FreeToggleButton
                            table="lessons"
                            id={lesson.id}
                            isFree={lesson.isFree}
                        />
                        <PublishToggleButton
                            table="lessons"
                            id={lesson.id}
                            isPublished={lesson.isPublished}
                        />
                    </div>
                </div>
                {/* Réglages à gauche, contenu (blocs ou questions) à droite. */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
                    <aside className="lg:col-span-1 bg-white rounded-xl border border-ui-line p-5 lg:sticky lg:top-6">
                        <div className="flex items-center gap-2 text-slate-900 font-semibold text-base mb-4">
                            Lesson title &amp; type
                        </div>
                        <LessonTitleForm
                                    initialData={{ title: lesson.title, type: lesson.type || 'VIDEO' }} // Type par défaut si manquant
                                    courseId={courseId}
                                    chapterId={chapterId}
                                    lessonId={lessonId}
                                />
                    </aside>

                    <section className="lg:col-span-3 bg-white rounded-xl border border-ui-line p-5 lg:p-6 min-w-0">
                        <div className="flex items-center gap-2 text-slate-900 font-semibold text-base mb-4">
                            {lesson.type === "QUIZ" ? "Quiz questions" : "Lesson content"}
                        </div>
                        {lesson.type === "QUIZ" ? (
                                    <QuizBuilder
                                        initialQuestions={(lesson.quizQuestions as QuizQuestion[] | null) ?? []}
                                        initialPassRate={lesson.quizPassRate ?? 70}
                                        chapterId={chapterId}
                                        lessonId={lessonId}
                                    />
                                ) : (
                                    <LessonBuilder
                                        initialBlocks={(lesson.contentBlocks as LessonBlock[] | null) ?? []}
                                        chapterId={chapterId}
                                        lessonId={lessonId}
                                        lessonType={lesson.type ?? "VIDEO"}
                                    />
                                )}
                    </section>
                </div>
            </div>
        </div>
    );
}