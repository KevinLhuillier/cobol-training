import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
    ArrowLeft,
    LayoutDashboard,
    Video,
    Pencil,
    Plus,
    GripVertical
} from "lucide-react";
import LessonForm from "@/components/courses/lesson-form";
import { LessonList } from "@/components/courses/lesson-list";
import { ChapterTitleForm } from "@/components/courses/chapter-title-form";

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
            courseId:course_id,
            lessons (
                id,
                title,
                position,
                content,
                vimeoUrl:vimeo_url,
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
                <div className="bg-red-50 border border-red-200 text-red-700 p-8 rounded-2xl max-w-lg">
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
        <div className="min-h-screen bg-slate-50 font-sans p-4 md:p-6 lg:p-8">
            <div className="max-w-5xl mx-auto">

                {/* EN TÊTE */}
                <div className="mb-8 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        {/* 🟢 Bouton retour mis à jour vers le nouveau chemin Dashboard Admin */}
                        <Link
                            href={`/dashboard/admin/courses/${courseId}`}
                            className="h-10 w-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-sm"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                                Chapter Setup
                            </h1>
                            <p className="text-sm text-slate-500">
                                Manage your chapter title and add video lessons.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* COLONNE GAUCHE: Détails du chapitre */}
                    <div className="space-y-8">
                        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6">
                            <div className="flex items-center gap-2 text-slate-900 font-bold text-lg mb-6">
                                <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                                    <LayoutDashboard className="h-4 w-4" />
                                </div>
                                Customize chapter
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm font-bold text-slate-500 mb-1">Chapter Title</p>
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
                    <div className="space-y-8">
                        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6">
                            <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
                                <div className="flex items-center gap-2 text-slate-900 font-bold text-lg shrink-0">
                                    <div className="h-8 w-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                                        <Video className="h-4 w-4" />
                                    </div>
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