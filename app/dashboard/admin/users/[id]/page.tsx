import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeft, MessageCircle } from "lucide-react";
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
        .select("id, name, email, created_at, subscription_status")
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

    // Pastille de statut d'abonnement (mêmes couleurs que la liste des utilisateurs).
    const STATUS_CHIP: Record<string, { label: string; className: string }> = {
        ACTIVE: { label: "Active", className: "bg-emerald-50 text-emerald-800" },
        TRIAL: { label: "Trial", className: "bg-amber-50 text-amber-800" },
        UNPAID: { label: "Unpaid", className: "bg-red-50 text-red-800" },
        CANCELED: { label: "Canceled", className: "bg-slate-100 text-slate-600" },
        EXPIRED: { label: "Expired", className: "bg-slate-100 text-slate-600" },
        LIFETIME: { label: "Lifetime", className: "bg-violet-50 text-violet-800" },
        LIFETIME_EXPIRED: { label: "Lifetime expired", className: "bg-violet-50 text-violet-700" },
        LIFETIME_ADDON: { label: "Lifetime + Mainframe", className: "bg-violet-50 text-violet-800" },
        INVITE_PENDING: { label: "Invite pending", className: "bg-blue-50 text-blue-800" },
    };
    const statusChip = STATUS_CHIP[student.subscription_status ?? ""] ?? { label: "No subscription", className: "bg-slate-100 text-slate-500" };

    return (
        <div className="max-w-5xl mx-auto flex flex-col gap-6 font-sans">
            <Link
                href="/dashboard/admin/users"
                className="self-start inline-flex items-center gap-1 text-[13px] font-semibold text-ui-accent hover:underline"
            >
                <ChevronLeft className="h-4 w-4" />
                Users
            </Link>

            {/* IDENTITÉ */}
            <header className="bg-white rounded-xl border border-ui-line p-6 flex flex-wrap items-center gap-5">
                <span className="h-14 w-14 rounded-full bg-slate-200 text-slate-700 text-xl font-bold flex items-center justify-center shrink-0">
                    {studentName.charAt(0).toUpperCase()}
                </span>
                <div className="flex-1 min-w-[220px]">
                    <h1 className="text-[22px] font-bold text-slate-900 tracking-tight">{studentName}</h1>
                    <p className="mt-1 text-sm text-ui-muted">
                        {student.email} · Registered on {registeredOn}
                    </p>
                </div>
                <span className={`px-2.5 py-1 rounded-md text-[13px] font-semibold ${statusChip.className}`}>{statusChip.label}</span>
                <Link
                    href={`/dashboard/admin/messages/${student.id}`}
                    className="inline-flex items-center gap-2 h-10 px-4 rounded-lg border border-ui-line-strong bg-white text-sm font-semibold text-slate-900 hover:bg-ui-page transition-colors"
                >
                    <MessageCircle className="h-4 w-4 text-slate-500" />
                    Send a message
                </Link>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
                {/* COURSE PROGRESS */}
                <section className="lg:col-span-3 bg-white rounded-xl border border-ui-line overflow-hidden">
                    <h2 className="px-5 py-4 border-b border-ui-line text-base font-semibold text-slate-900">Course progress</h2>
                    {courses.length === 0 ? (
                        <p className="p-5 text-sm text-ui-muted">No published courses.</p>
                    ) : (
                        <div className="p-5 flex flex-col gap-4">
                            {courses.map((course) => (
                                <div key={course.id}>
                                    <div className="flex justify-between items-center gap-3 mb-1.5 text-sm">
                                        <p className="font-medium text-slate-900 truncate">{course.title}</p>
                                        <span className={`shrink-0 font-semibold ${course.progress === 100 ? "text-emerald-700" : "text-slate-600"}`}>
                                            {course.completed}/{course.total} · {course.progress}%
                                        </span>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-200/70 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${course.progress === 100 ? "bg-emerald-500" : "bg-ui-accent"}`}
                                            style={{ width: `${course.progress}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* LOGIN HISTORY */}
                <section className="lg:col-span-2 bg-white rounded-xl border border-ui-line overflow-hidden">
                    <h2 className="px-5 py-4 border-b border-ui-line text-base font-semibold text-slate-900">Last 5 connections</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-[13px]">
                            <thead>
                            <tr className="bg-ui-page/70 text-ui-muted text-xs">
                                <th className="px-5 py-2.5 font-semibold">Date</th>
                                <th className="px-3 py-2.5 font-semibold">IP address</th>
                                <th className="px-5 py-2.5 font-semibold">Country</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-ui-line">
                            {!loginEvents || loginEvents.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="p-6 text-center text-ui-muted">
                                        No connection recorded yet.
                                    </td>
                                </tr>
                            ) : (
                                loginEvents.map((event, index) => (
                                    <tr key={index}>
                                        <td className="px-5 py-3 text-slate-700 whitespace-nowrap">
                                            {new Date(event.signed_in_at).toLocaleString("en-US", {
                                                month: "short",
                                                day: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </td>
                                        <td className="px-3 py-3 font-mono text-slate-600">{event.ip_address}</td>
                                        <td className="px-5 py-3 text-slate-600">{event.country || "—"}</td>
                                    </tr>
                                ))
                            )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </div>
    );
}
