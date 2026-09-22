import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Users } from "lucide-react";
import { ChallengeForm } from "@/components/admin/challenge-form";
import { ChallengeBuilder } from "@/components/admin/challenge-builder";
import { ChallengeDeleteButton } from "@/components/admin/challenge-delete-button";
import { ChallengeStatusBadge } from "@/components/admin/challenge-status-badge";
import { PublishToggleButton } from "@/components/courses/publish-toggle-button";
import { todayIsoDate } from "@/components/challenges/types";
import type { LessonBlock } from "@/components/courses/lesson-blocks/types";
import { createClient } from "@/utils/supabase/server";

interface SubmissionRow {
    id: string;
    solution: string;
    updatedAt: string;
    user: { name: string | null; email: string } | { name: string | null; email: string }[] | null;
}

export default async function AdminChallengeDetailsPage({
    params,
}: {
    params: Promise<{ challengeId: string }>;
}) {
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

    const { challengeId } = await params;

    // 2. FETCH : le challenge, ses solutions soumises (plus récentes d'abord) et le challenge
    // actuellement mis en avant (pour afficher le bon statut "This week")
    const [{ data: challenge }, { data: rawSubmissions }, { data: featured }] = await Promise.all([
        supabase
            .from("challenges")
            .select("id, title, contentBlocks:content_blocks, language, startsAt:starts_at, isPublished:is_published")
            .eq("id", challengeId)
            .maybeSingle(),
        supabase
            .from("challenge_submissions")
            .select("id, solution, updatedAt:updated_at, user:users (name, email)")
            .eq("challenge_id", challengeId)
            .order("updated_at", { ascending: false }),
        supabase
            .from("challenges")
            .select("id")
            .eq("is_published", true)
            .lte("starts_at", todayIsoDate())
            .order("starts_at", { ascending: false })
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle(),
    ]);

    if (!challenge) {
        return notFound();
    }

    const submissions = (rawSubmissions || []) as unknown as SubmissionRow[];

    return (
        <div className="max-w-4xl mx-auto font-sans">
            {/* HEADER */}
            <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link
                        href="/dashboard/admin/challenges"
                        className="h-10 w-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-sm"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Edit challenge</h1>
                        <p className="text-sm text-slate-500">
                            Update the instructions and review the submitted solutions.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <ChallengeStatusBadge
                        isPublished={challenge.isPublished}
                        startsAt={challenge.startsAt}
                        isFeatured={featured?.id === challenge.id}
                        className="px-3 py-1.5 font-bold shadow-sm"
                    />
                    <PublishToggleButton table="challenges" id={challenge.id} isPublished={challenge.isPublished} />
                    <ChallengeDeleteButton challengeId={challenge.id} challengeTitle={challenge.title} />
                </div>
            </div>

            <div className="space-y-8">
                {/* FORMULAIRE */}
                <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8">
                    <ChallengeForm challenge={challenge} />
                </div>

                {/* INSTRUCTIONS — mêmes composants que le builder de leçon, avec un bloc Solution
                    dont le contenu n'est révélé aux élèves qu'une fois le challenge passé en "previous". */}
                <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6 lg:p-8">
                    <p className="text-sm font-bold text-slate-500 mb-3">Instructions</p>
                    <ChallengeBuilder
                        initialBlocks={(challenge.contentBlocks as LessonBlock[] | null) ?? []}
                        challengeId={challenge.id}
                    />
                </div>

                {/* SOLUTIONS SOUMISES */}
                <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6">
                    <div className="flex items-center gap-2 text-slate-900 font-bold text-lg mb-6">
                        <Users className="h-5 w-5 text-emerald-600" />
                        Submissions ({submissions.length})
                    </div>

                    {submissions.length === 0 ? (
                        <p className="text-sm text-slate-500 italic text-center py-6">No solutions submitted yet.</p>
                    ) : (
                        <div className="space-y-3">
                            {submissions.map((submission) => {
                                // Relation to-one : objet ou tableau selon le sens d'embedding PostgREST
                                const student = Array.isArray(submission.user) ? submission.user[0] : submission.user;

                                return (
                                    <details
                                        key={submission.id}
                                        className="group bg-slate-50 rounded-xl border border-slate-200 overflow-hidden"
                                    >
                                        <summary className="flex items-center justify-between gap-4 p-4 cursor-pointer list-none">
                                            <span className="font-bold text-slate-900 text-sm truncate">
                                                {student?.name || student?.email || "Unknown user"}
                                            </span>
                                            <span className="text-xs text-slate-400 shrink-0">
                                                {new Date(submission.updatedAt).toLocaleString("en-US", {
                                                    dateStyle: "medium",
                                                    timeStyle: "short",
                                                })}
                                            </span>
                                        </summary>
                                        <div className="bg-slate-900 p-4 overflow-x-auto border-t border-slate-800">
                                            <pre className="text-emerald-400 font-mono text-sm whitespace-pre-wrap">
                                                <code>{submission.solution}</code>
                                            </pre>
                                        </div>
                                    </details>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
