import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft,
    LayoutDashboard,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { LessonTitleForm } from "@/components/courses/lesson-title-form";
import { LessonBuilder } from "@/components/courses/lesson-builder";
import { PublishToggleButton } from "@/components/courses/publish-toggle-button";
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
            chapterId:chapter_id,
            chapter:chapters ( isPublished:is_published )
        `)
        .eq("id", lessonId)
        .eq("chapter_id", chapterId) // Sécurité : assure que la leçon appartient bien à ce chapitre
        .maybeSingle();

    // Gestion des erreurs SQL
    if (error) {
        console.error("🔥 ERREUR SUPABASE (Lesson Details):", error);
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="bg-red-50 border border-red-200 text-red-700 p-8 rounded-2xl max-w-lg">
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

    return (
        <div className="min-h-screen bg-slate-50 font-sans p-4 md:p-6 lg:p-8">
            <div className="max-w-6xl mx-auto">

                {/* EN TÊTE */}
                <div className="mb-8 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        {/* 🟢 Lien mis à jour vers le nouvel espace Dashboard */}
                        <Link
                            href={`/dashboard/admin/courses/${courseId}/chapters/${chapterId}`}
                            className="h-10 w-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-sm"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                                Lesson Setup
                            </h1>
                            <p className="text-sm text-slate-500">
                                Manage your lesson title and content.
                            </p>
                            {lesson.isPublished && !chapterIsPublished && (
                                <p className="text-xs font-medium text-amber-600 mt-1">
                                    This lesson is published but its chapter is a draft, so students cannot see it yet.
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Badge
                            className={`px-3 py-1.5 border-none font-bold shadow-sm ${
                                lesson.isPublished
                                    ? "bg-emerald-100 text-emerald-700"
                                    : "bg-amber-100 text-amber-700"
                            }`}
                        >
                            {lesson.isPublished ? "Published" : "Draft"}
                        </Badge>
                        <PublishToggleButton
                            table="lessons"
                            id={lesson.id}
                            isPublished={lesson.isPublished}
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-8">

                    {/* BLOC HAUT : Titre & Contenu */}
                    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6 lg:p-8">
                        <div className="flex items-center gap-2 text-slate-900 font-bold text-lg mb-6">
                            <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                                <LayoutDashboard className="h-4 w-4" />
                            </div>
                            Customize lesson
                        </div>

                        <div className="space-y-6">
                            <div>
                                <p className="text-sm font-bold text-slate-500 mb-1">Lesson Title & Type</p>
                                <LessonTitleForm
                                    initialData={{ title: lesson.title, type: lesson.type || 'VIDEO' }} // Type par défaut si manquant
                                    courseId={courseId}
                                    chapterId={chapterId}
                                    lessonId={lessonId}
                                />
                            </div>

                            <div className="w-full">
                                <p className="text-sm font-bold text-slate-500 mb-3">
                                    {lesson.type === "QUIZ" ? "Quiz Questions" : "Lesson Content"}
                                </p>
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
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}