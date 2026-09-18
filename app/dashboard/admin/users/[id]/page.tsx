import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, BookOpen, Globe, Calendar } from "lucide-react";
import { createClient } from "@/utils/supabase/server";

export default async function AdminUserDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const supabase = await createClient();

    // 1. SÉCURITÉ : vérification stricte du rôle Admin
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

    // 2. Récupère l'étudiant concerné
    const { data: student } = await supabase
        .from("users")
        .select("id, name, email, created_at")
        .eq("id", id)
        .single();

    if (!student) {
        return redirect("/dashboard/admin/users");
    }

    // 3. Avancement dans les cours, historique de connexion (5 dernières)
    const [{ data: rawCourses }, { data: completedProgress }, { data: loginEvents }] = await Promise.all([
        supabase
            .from("courses")
            .select(`
                id,
                title,
                chapters ( id, position, lessons ( id, position ) )
            `)
            .eq("is_published", true)
            .eq("chapters.is_published", true)
            .eq("chapters.lessons.is_published", true)
            .order("position", { ascending: true }),
        supabase
            .from("lesson_progress")
            .select("lesson_id")
            .eq("user_id", id)
            .eq("is_completed", true),
        supabase
            .from("login_events")
            .select("ip_address, country, signed_in_at")
            .eq("user_id", id)
            .order("signed_in_at", { ascending: false })
            .limit(5),
    ]);

    const completedLessonIds = new Set((completedProgress || []).map((p) => p.lesson_id));

    // Tri des chapitres/leçons par position (PostgREST ne garantit pas l'ordre des relations imbriquées)
    const courses = (rawCourses || []).map((course) => {
        const allLessons = [...course.chapters]
            .sort((a, b) => a.position - b.position)
            .flatMap((chapter) => [...chapter.lessons].sort((a, b) => a.position - b.position));

        const total = allLessons.length;
        const completed = allLessons.filter((lesson) => completedLessonIds.has(lesson.id)).length;
        const progress = total === 0 ? 0 : Math.round((completed / total) * 100);

        return { id: course.id, title: course.title, total, completed, progress };
    });

    const studentName = student.name || student.email;
    const registeredOn = new Date(student.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    return (
        <div className="max-w-3xl mx-auto space-y-6 font-sans">
            {/* HEADER */}
            <div className="flex items-center gap-3">
                <Link
                    href="/dashboard/admin/users"
                    className="h-9 w-9 flex items-center justify-center rounded-xl border border-slate-100 bg-white shadow-sm text-slate-500 hover:text-slate-900 transition-colors shrink-0"
                >
                    <ArrowLeft className="h-4 w-4" />
                </Link>
                <div>
                    <h1 className="text-xl font-bold text-slate-900">{studentName}</h1>
                    <p className="text-sm text-slate-500">{student.email}</p>
                </div>
            </div>

            {/* REGISTERED ON */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 flex items-center gap-4">
                <div className="h-12 w-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-600 shrink-0">
                    <Calendar className="h-6 w-6" />
                </div>
                <div>
                    <p className="text-sm font-bold text-slate-500">Registered on</p>
                    <p className="text-lg font-extrabold text-slate-900">{registeredOn}</p>
                </div>
            </div>

            {/* COURSE PROGRESS */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center gap-3">
                    <BookOpen className="h-5 w-5 text-slate-500" />
                    <h2 className="text-lg font-bold text-slate-900">Course progress</h2>
                </div>
                <div className="divide-y divide-slate-100">
                    {courses.length === 0 ? (
                        <p className="p-6 text-sm text-slate-500">No published courses.</p>
                    ) : (
                        courses.map((course) => (
                            <div key={course.id} className="p-6">
                                <div className="flex justify-between items-center mb-2">
                                    <p className="font-bold text-slate-900">{course.title}</p>
                                    <span className={`text-sm font-semibold ${course.progress === 100 ? "text-emerald-600" : "text-slate-600"}`}>
                                        {course.completed}/{course.total} lessons — {course.progress}%
                                    </span>
                                </div>
                                <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden shadow-inner">
                                    <div
                                        className={`h-full rounded-full transition-all duration-500 ${course.progress === 100 ? "bg-emerald-500" : "bg-slate-800"}`}
                                        style={{ width: `${course.progress}%` }}
                                    />
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* LOGIN HISTORY */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center gap-3">
                    <Globe className="h-5 w-5 text-slate-500" />
                    <h2 className="text-lg font-bold text-slate-900">Last 5 connections</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                        <tr className="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-wider">
                            <th className="p-4 font-bold">Date</th>
                            <th className="p-4 font-bold">IP address</th>
                            <th className="p-4 font-bold">Country</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                        {!loginEvents || loginEvents.length === 0 ? (
                            <tr>
                                <td colSpan={3} className="p-8 text-center text-slate-500">
                                    No connection recorded yet.
                                </td>
                            </tr>
                        ) : (
                            loginEvents.map((event, index) => (
                                <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="p-4">
                                        <span className="text-sm text-slate-600">
                                            {new Date(event.signed_in_at).toLocaleString("en-US", {
                                                year: "numeric",
                                                month: "short",
                                                day: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <span className="text-sm font-mono text-slate-600">{event.ip_address}</span>
                                    </td>
                                    <td className="p-4">
                                        <span className="text-sm text-slate-600">{event.country || "—"}</span>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
