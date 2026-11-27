import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import LessonForm from "@/components/courses/lesson-form";
import { LessonList } from "@/components/courses/lesson-list";
import { ChapterTitleForm } from "@/components/courses/chapter-title-form";
import { PublishToggleButton } from "@/components/courses/publish-toggle-button";
import { FreeToggleButton } from "@/components/courses/free-toggle-button";

// 🟢 Import du client serveur Supabase
import { createClient } from "@/utils/supabase/server";

export default async function ChapterDetailsPage({
                                                     params
                                                 }: {
    params: Promise<{ courseId: string; chapterId: string }>
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

    // 2. On "attend" la résolution de la promesse params
    const resolvedParams = await params;
    const { courseId, chapterId } = resolvedParams;

    // 3. FETCH SUPABASE : Récupération du chapitre et de ses leçons imbriquées
    // On utilise les alias (ex: courseId:course_id) pour garder le format attendu par tes composants
    const { data: rawChapter, error } = await supabase
        .from("chapters")
        .select(`
            id,
            title,
            position,
            isPublished:is_published,
            isFree:is_free,
            courseId:course_id,
            lessons (
                id,
                title,
                position,
                isPublished:is_published,
                isFree:is_free,
                type,
                chapterId:chapter_id
            )
        `)
        .eq("id", chapterId)
        .eq("course_id", courseId) // Assure que le chapitre appartient bien à ce cours
        .maybeSingle();

    // Si une erreur SQL survient (ex: colonne manquante), on l'affiche pour déboguer facilement
    if (error) {
        console.error("🔥 ERREUR SUPABASE (Chapter Details):", error);
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="bg-red-50 border border-red-200 text-red-700 p-8 rounded-xl max-w-lg">
                    <h1 className="font-bold text-xl mb-4">Erreur SQL Supabase</h1>
                    <p className="font-mono text-sm bg-white p-4 rounded-lg border border-red-100">{error.message}</p>
                </div>
            </div>
        );
    }

    // 4. 404 si le chapitre n'existe pas
    if (!rawChapter) {
        return notFound();
    }

    // 5. Tri des leçons par position (garanti côté JS)
    const chapter = {
        ...rawChapter,
        lessons: rawChapter.lessons ? [...rawChapter.lessons].sort((a, b) => a.position - b.position) : []
    };

    return (
        <div className="font-sans">
            <div className="max-w-5xl mx-auto">

                {/* EN TÊTE */}
                <div className="mb-8 flex flex-col lg:flex-row lg:items-end justify-between gap-4">
                    <div className="flex items-center gap-4">
                        {/* 🟢 Bouton retour mis à jour vers le nouveau chemin Dashboard Admin */}
                        <Link
                            href={`/dashboard/admin/courses/${courseId}`}
                            className="h-10 w-10 bg-white border border-ui-line rounded-lg flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                        <div>
                            <h1 className="text-2xl md:text-[26px] font-bold text-slate-900 tracking-tight">{chapter.title}</h1>
                            <p className="mt-1 text-sm text-ui-muted">Chapter setup · 
                                Manage your chapter title and add video lessons.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {chapter.isFree && (
                            <Badge className="px-2 py-0.5 rounded-md text-xs font-semibold border-none bg-ui-accent-soft text-ui-accent">
                                Free
                            </Badge>
                        )}
                        <Badge
                            className={`px-2 py-0.5 rounded-md text-xs font-semibold border-none ${
                                chapter.isPublished
                                    ? "bg-emerald-50 text-emerald-800"
                                    : "bg-amber-50 text-amber-800"
                            }`}
                        >
                            {chapter.isPublished ? "Published" : "Draft"}
                        </Badge>
                        <FreeToggleButton
                            table="chapters"
                            id={chapter.id}
                            isFree={chapter.isFree}
                        />
                        <PublishToggleButton
                            table="chapters"
                            id={chapter.id}
                            isPublished={chapter.isPublished}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">

                    {/* COLONNE GAUCHE: Détails du chapitre */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-xl border border-ui-line p-6">
                            <div className="flex items-center gap-2 text-slate-900 font-semibold text-base mb-5">
                                Customize chapter
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <p className="text-[13px] font-semibold text-slate-900 mb-1.5">Chapter Title</p>
                                    <ChapterTitleForm
                                        initialData={chapter}
                                        courseId={courseId}
                                        chapterId={chapterId}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* COLONNE DROITE: Les leçons (vidéos) */}
                    <div className="lg:col-span-3 space-y-6">
                        <div className="bg-white rounded-xl border border-ui-line p-6">
                            <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
                                <div className="flex items-center gap-2 text-slate-900 font-semibold text-base shrink-0">
                                    Lessons
                                </div>

                                <LessonForm courseId={courseId} chapterId={chapterId} />
                            </div>

                            <LessonList
                                courseId={courseId}
                                chapterId={chapterId}
                                items={chapter.lessons}
                            />
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}