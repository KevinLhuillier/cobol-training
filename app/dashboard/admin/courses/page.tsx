import Link from "next/link";
import { redirect } from "next/navigation";
import {
    Plus,
    BookOpen,
    Layers,
    PlayCircle,
} from "lucide-react";
import { CourseList } from "@/components/courses/course-list";
// 🟢 Import du client serveur Supabase
import { createClient } from "@/utils/supabase/server";

export default async function AdminCoursesPage() {
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
        return redirect("/dashboard"); // Renvoie les étudiants normaux vers leur dashboard
    }

    // 2. FETCH : Récupération des cours avec comptage des chapitres
    // La syntaxe "chapters(count)" permet de demander à PostgreSQL de ne renvoyer que le nombre d'éléments, sans télécharger les données
    const { data: courses, error } = await supabase
        .from("courses")
        .select(`
            id,
            title,
            is_published,
            is_free,
            image_url,
            updated_at,
            position,
            chapters!left(
                id,
                lessons!left(id)
            )
        `)
        .order("position", { ascending: true });

    if (error) {
        console.error("Erreur lors de la récupération des cours:", error);
    }

    // 3. FORMATAGE ET CALCUL DES STATISTIQUES
    // PostgREST renvoie les relations imbriquées sous forme de tableaux, on doit donc les réduire côté serveur.
    const formattedCourses = courses?.map(course => {
        // Compte le nombre de chapitres pour ce cours
        const chaptersCount = course.chapters ? course.chapters.length : 0;

        // Compte le nombre total de leçons en parcourant chaque chapitre de ce cours
        const lessonsCount = course.chapters
            ? course.chapters.reduce((sum, chapter) => sum + (chapter.lessons ? chapter.lessons.length : 0), 0)
            : 0;

        return {
            ...course,
            chaptersCount,
            lessonsCount
        };
    }) || [];

    // Statistiques globales pour les cartes du haut
    const totalCourses = formattedCourses.length;
    const totalChapters = formattedCourses.reduce((sum, course) => sum + course.chaptersCount, 0);
    const totalLessons = formattedCourses.reduce((sum, course) => sum + course.lessonsCount, 0);

    return (
        <div className="font-sans">
            {/* HEADER */}
            <header className="mb-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-slate-900 rounded-xl flex items-center justify-center shadow-md">
                        <BookOpen className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                            Courses
                        </h1>
                        <p className="text-sm text-slate-500">Code Legacy Course Management</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Link
                        href="/dashboard/admin/courses/new"
                        className="inline-flex items-center justify-center bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-sm h-10 px-5 text-sm font-medium transition-colors"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        New Course
                    </Link>
                    <Link
                        href="/dashboard/admin"
                        className="text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors px-4 py-2"
                    >
                        Back to admin
                    </Link>
                </div>
            </header>

            <main className="w-full mx-auto">
                {/* QUICK STATS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
                        <div className="h-12 w-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                            <BookOpen className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-500">Total Courses</p>
                            <p className="text-2xl font-extrabold text-slate-900">{totalCourses}</p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
                        <div className="h-12 w-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                            <Layers className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-500">Chapters</p>
                            <p className="text-2xl font-extrabold text-slate-900">{totalChapters}</p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
                        <div className="h-12 w-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600">
                            <PlayCircle className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-500">Lessons</p>
                            <p className="text-2xl font-extrabold text-slate-900">{totalLessons}</p>
                        </div>
                    </div>
                </div>

                {/* COURSES LIST */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-6 border-b border-slate-100">
                        <h2 className="text-lg font-bold text-slate-900">Your Courses</h2>
                    </div>

                    <CourseList items={formattedCourses} />
                </div>
            </main>
        </div>
    );
}
