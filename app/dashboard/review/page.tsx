import { redirect } from "next/navigation";
import { User, BookOpen, Check, Clock } from "lucide-react";
import { ReviewActionButtons } from "@/components/review-action-button";
// 🟢 Import du client serveur Supabase
import { createClient } from "@/utils/supabase/server";

export default async function AdminReviewsPage() {
    const supabase = await createClient();

    // 1. SÉCURITÉ : Vérification de la session et du rôle Admin
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

    // 2. FETCH SUPABASE : Récupération des exercices en attente avec toutes les relations
    const { data: rawReviews, error } = await supabase
        .from("lesson_progress")
        .select(`
            id,
            updatedAt:updated_at,
            exerciseAnswer:exercise_answer,
            userId:user_id,
            user:users (
                name,
                email
            ),
            lesson:lessons (
                title,
                chapter:chapters (
                    title,
                    course:courses (
                        title
                    )
                )
            )
        `)
        .eq("exercise_status", "PENDING_REVIEW")
        .order("updated_at", { ascending: true }); // Les plus anciens en premier

    if (error) {
        console.error("Erreur récupération reviews:", error);
    }

    // 3. FORMATAGE ET TYPAGE DES DONNÉES
    // Supabase renvoie des objets imbriqués qu'on formate pour correspondre à ton JSX
    const pendingReviews = (rawReviews || []).map((review: any) => {
        // Comme les relations "un-à-un" peuvent être retournées comme tableaux par PostgREST
        // selon la configuration des clés étrangères, on sécurise l'extraction.
        const student = Array.isArray(review.user) ? review.user[0] : review.user;
        const lesson = Array.isArray(review.lesson) ? review.lesson[0] : review.lesson;
        const chapter = lesson?.chapter ? (Array.isArray(lesson.chapter) ? lesson.chapter[0] : lesson.chapter) : null;
        const course = chapter?.course ? (Array.isArray(chapter.course) ? chapter.course[0] : chapter.course) : null;

        return {
            id: review.id,
            updatedAt: review.updatedAt,
            exerciseAnswer: review.exerciseAnswer,
            userId: review.userId,
            studentName: student?.name || student?.email || review.userId,
            courseTitle: course?.title || "Unknown Course",
            chapterTitle: chapter?.title || "Unknown Chapter",
            lessonTitle: lesson?.title || "Unknown Lesson"
        };
    });

    return (
        <div className="font-sans max-w-5xl mx-auto flex flex-col gap-6">
            {/* HEADER */}
            <div>
                <h1 className="text-2xl md:text-[26px] font-bold text-slate-900 tracking-tight">Pending reviews</h1>
                <p className="mt-1 text-sm text-ui-muted">
                    {pendingReviews.length === 0
                        ? "Nothing to review right now."
                        : `${pendingReviews.length} exercise${pendingReviews.length !== 1 ? "s" : ""} to review — oldest first.`}
                </p>
            </div>

            {/* EXERCISES LIST */}
            {pendingReviews.length === 0 ? (
                <div className="bg-white rounded-xl border border-ui-line p-14 text-center flex flex-col items-center">
                    <div className="h-12 w-12 bg-emerald-50 rounded-lg flex items-center justify-center mb-4">
                        <Check className="h-6 w-6 text-emerald-600" />
                    </div>
                    <h2 className="text-base font-semibold text-slate-900">No pending reviews</h2>
                    <p className="text-sm text-ui-muted mt-1">Great job, all exercises have been reviewed!</p>
                </div>
            ) : (
                pendingReviews.map((review) => (
                    <article key={review.id} className="bg-white rounded-xl border border-ui-line overflow-hidden">
                        {/* Contexte : module, leçon, élève et date de soumission */}
                        <header className="px-5 py-4 border-b border-ui-line flex flex-col md:flex-row md:items-center justify-between gap-3">
                            <div className="min-w-0">
                                <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-ui-accent">
                                    <BookOpen className="h-3.5 w-3.5" />
                                    {review.courseTitle}
                                </p>
                                <h2 className="mt-1 text-[17px] font-semibold text-slate-900">
                                    {review.chapterTitle} — {review.lessonTitle}
                                </h2>
                            </div>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-slate-600 shrink-0">
                                <span className="flex items-center gap-1.5">
                                    <User className="h-3.5 w-3.5 text-slate-400" />
                                    <span className="font-semibold text-slate-900">{review.studentName}</span>
                                </span>
                                {/* updated_at = date de la dernière soumission (la ligne est mise à jour à chaque envoi) */}
                                {review.updatedAt && (
                                    <span className="flex items-center gap-1.5">
                                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                                        <time dateTime={review.updatedAt}>
                                            {new Date(review.updatedAt).toLocaleString("en-GB", {
                                                dateStyle: "medium",
                                                timeStyle: "short",
                                                timeZone: "Europe/Paris",
                                            })}
                                        </time>
                                    </span>
                                )}
                            </div>
                        </header>

                        {/* Solution soumise */}
                        <div className="p-5">
                            <p className="text-[13px] font-semibold text-ui-muted mb-2.5">Submitted solution</p>
                            <pre className="bg-ui-ink rounded-lg p-4 overflow-x-auto font-mono text-[13px] leading-relaxed text-emerald-400 whitespace-pre-wrap">
                                <code>{review.exerciseAnswer}</code>
                            </pre>
                        </div>

                        {/* Feedback + décision */}
                        <div className="px-5 py-4 bg-ui-page/60 border-t border-ui-line">
                            <ReviewActionButtons progressId={review.id} />
                        </div>
                    </article>
                ))
            )}
        </div>
    );
}
