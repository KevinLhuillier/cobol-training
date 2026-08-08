import Link from "next/link";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import {
    Terminal,
    Plus,
    BookOpen,
    Layers,
    PlayCircle,
    Pencil,
    Trash2,
    Settings
} from "lucide-react";
// 🟢 Import du client serveur Supabase
import { createClient } from "@/utils/supabase/server";

export default async function AdminDashboardPage() {
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
            updated_at,
            chapters!left(
                id,
                lessons!left(id)
            )
        `)
        .order("updated_at", { ascending: false });

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
            {/* ADMIN HEADER */}
            <header className="mb-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-slate-900 rounded-xl flex items-center justify-center shadow-md">
                        <Settings className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                            Administration
                        </h1>
                        <p className="text-sm text-slate-500">Code Legacy Course Management</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Le bouton "Back to website" n'est plus nécessaire car on a la Sidebar */}

                    <Link
                        href="/dashboard/admin/users-tso"
                        className="inline-flex items-center justify-center bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-xl shadow-sm h-10 px-4 text-sm font-medium transition-colors"
                    >
                        <Terminal className="mr-2 h-4 w-4 text-slate-500" />
                        TSO Accounts
                    </Link>

                    <Link
                        href="/dashboard/admin/courses/new"
                        className="inline-flex items-center justify-center bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-sm h-10 px-5 text-sm font-medium transition-colors"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        New Course
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

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                            <tr className="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-wider">
                                <th className="p-4 font-bold">Course Title</th>
                                <th className="p-4 font-bold">Status</th>
                                <th className="p-4 font-bold text-center">Structure</th>
                                <th className="p-4 font-bold text-right">Actions</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                            {formattedCourses.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-slate-500">
                                        No courses found. Click &quot;New Course&quot; to create one.
                                    </td>
                                </tr>
                            ) : (
                                formattedCourses.map((course) => (
                                    <tr key={course.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="p-4">
                                            <p className="font-bold text-slate-900">{course.title}</p>
                                            <p className="text-xs text-slate-500 mt-1">
                                                Updated: {new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date(course.updated_at))}
                                            </p>
                                        </td>
                                        <td className="p-4">
                                            <Badge
                                                className={`border-none ${
                                                    course.is_published
                                                        ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                                                        : "bg-amber-100 text-amber-700 hover:bg-amber-100"
                                                }`}
                                            >
                                                {course.is_published ? "Published" : "Draft"}
                                            </Badge>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center justify-center gap-4 text-sm text-slate-600 font-medium">
                                                <span className="flex items-center gap-1" title="Chapters">
                                                    <Layers className="h-4 w-4 text-slate-400" />
                                                    {course.chaptersCount}
                                                </span>
                                                <span className="flex items-center gap-1" title="Lessons">
                                                    <PlayCircle className="h-4 w-4 text-slate-400" />
                                                    {course.lessonsCount}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    href={`/dashboard/admin/courses/${course.id}`}
                                                    className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                                                    title="Edit course"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Link>
                                                {/* Le bouton supprimer nécessitera un composant client plus tard, on le garde en UI pour le moment */}
                                                <button
                                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}