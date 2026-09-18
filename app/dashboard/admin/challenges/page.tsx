import Link from "next/link";
import { redirect } from "next/navigation";
import { Target, Plus, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ChallengeStatusBadge } from "@/components/admin/challenge-status-badge";
import { formatChallengeDate, todayIsoDate } from "@/components/challenges/types";
import { createClient } from "@/utils/supabase/server";

export default async function AdminChallengesPage() {
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

    // 2. FETCH : tous les challenges (brouillons compris) avec le nombre de solutions soumises.
    // Même ordre que la page étudiante, pour repérer correctement le challenge mis en avant.
    const { data: challenges, error } = await supabase
        .from("challenges")
        .select("id, title, language, startsAt:starts_at, isPublished:is_published, submissions:challenge_submissions(count)")
        .order("starts_at", { ascending: false })
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Erreur récupération challenges:", error);
    }

    // Le challenge de la semaine = le premier publié dont la date est atteinte (liste déjà triée)
    const today = todayIsoDate();
    const featuredId = (challenges || []).find((c) => c.isPublished && c.startsAt <= today)?.id;

    return (
        <div className="font-sans">
            <header className="mb-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-slate-900 rounded-xl flex items-center justify-center shadow-md">
                        <Target className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Challenges</h1>
                        <p className="text-sm text-slate-500">Weekly coding challenges</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Link
                        href="/dashboard/admin"
                        className="text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors px-4 py-2"
                    >
                        Back to admin
                    </Link>
                    <Link
                        href="/dashboard/admin/challenges/new"
                        className="inline-flex items-center justify-center bg-slate-900 hover:bg-slate-800 text-white rounded-xl h-10 px-4 text-sm font-bold transition-colors shadow-sm"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        New challenge
                    </Link>
                </div>
            </header>

            <main className="w-full mx-auto">
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                    {!challenges || challenges.length === 0 ? (
                        <p className="p-8 text-center text-slate-500">No challenges yet. Create your first one.</p>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {challenges.map((challenge) => {
                                // Comptage PostgREST : [{ count: n }]
                                const submissionsCount = challenge.submissions?.[0]?.count ?? 0;

                                return (
                                    <Link
                                        key={challenge.id}
                                        href={`/dashboard/admin/challenges/${challenge.id}`}
                                        className="flex items-center gap-4 p-5 hover:bg-slate-50/50 transition-colors"
                                    >
                                        <div className="min-w-0 flex-1">
                                            <p className="font-bold text-slate-900 truncate">{challenge.title}</p>
                                            <p className="text-xs text-slate-500 mt-1">
                                                Week of {formatChallengeDate(challenge.startsAt)}
                                            </p>
                                        </div>

                                        <Badge variant="secondary" className="border-none bg-slate-100 text-slate-700 shrink-0">
                                            {challenge.language}
                                        </Badge>
                                        <ChallengeStatusBadge
                                            isPublished={challenge.isPublished}
                                            startsAt={challenge.startsAt}
                                            isFeatured={challenge.id === featuredId}
                                        />
                                        <span
                                            className="flex items-center gap-1 text-sm text-slate-600 font-medium shrink-0"
                                            title="Submitted solutions"
                                        >
                                            <Users className="h-4 w-4 text-slate-400" />
                                            {submissionsCount}
                                        </span>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
