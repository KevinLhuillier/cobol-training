import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, ChevronLeft } from "lucide-react";
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
            kind,
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
            <header className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <Link href="/dashboard/admin" className="inline-flex items-center gap-1 text-[13px] font-semibold text-ui-accent hover:underline mb-2">
                        <ChevronLeft className="h-4 w-4" />
                        Admin
                    </Link>
                    <h1 className="text-2xl md:text-[26px] font-bold text-slate-900 tracking-tight">Courses</h1>
                    <p className="mt-1 text-sm text-ui-muted">Courses and projects management</p>
                </div>
                <div className="flex items-center gap-2">
                    <Link
                        href="/dashboard/admin/courses/new"
                        className="inline-flex items-center justify-center bg-ui-ink hover:bg-ui-ink-hover text-white rounded-lg h-10 px-5 text-sm font-medium transition-colors"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        New Course
                    </Link>
                </div>
            </header>

            <main className="w-full mx-auto">
                {/* QUICK STATS */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white rounded-xl border border-ui-line px-5 py-4"><p className="text-[13px] text-ui-muted">Total Courses</p><p className="mt-1 text-2xl font-bold text-slate-900 tracking-tight">{totalCourses}</p></div>
                    <div className="bg-white rounded-xl border border-ui-line px-5 py-4"><p className="text-[13px] text-ui-muted">Chapters</p><p className="mt-1 text-2xl font-bold text-slate-900 tracking-tight">{totalChapters}</p></div>
                    <div className="bg-white rounded-xl border border-ui-line px-5 py-4"><p className="text-[13px] text-ui-muted">Lessons</p><p className="mt-1 text-2xl font-bold text-slate-900 tracking-tight">{totalLessons}</p></div>
                </div>

                {/* COURSES LIST */}
                <div className="bg-white rounded-xl border border-ui-line overflow-hidden">
                    <div className="px-5 py-4 border-b border-ui-line">
                        <h2 className="text-base font-semibold text-slate-900">Your Courses</h2>
                    </div>

                    <CourseList items={formattedCourses} />
                </div>
            </main>
        </div>
    );
}
