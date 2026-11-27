import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Lock } from "lucide-react";
import { BadgeIcon } from "@/components/badges/badge-icon";

// 🟢 Import du client serveur Supabase
import { createClient } from "@/utils/supabase/server";

export default async function BadgesPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return redirect("/auth/login");
    }

    // Tous les badges publiés (cours associé publié), avec le statut de déblocage de
    // l'utilisateur courant filtré côté JS (même approche que le player de cours pour
    // lesson_progress : PostgREST embarque toutes les lignes, on garde les siennes).
    const { data: rawBadges } = await supabase
        .from("badges")
        .select(`
            id,
            name,
            description,
            icon,
            course:courses (
                id,
                title,
                isPublished:is_published
            ),
            userBadges:user_badges (
                unlockedAt:unlocked_at,
                userId:user_id
            )
        `);

    type RawUserBadge = { unlockedAt: string; userId: string };

    const badges = (rawBadges || [])
        .map((b) => {
            const course = (Array.isArray(b.course) ? b.course[0] : b.course) as { id: string; title: string; isPublished: boolean } | null;
            const unlocked = (b.userBadges as RawUserBadge[] || []).find((ub) => ub.userId === user.id);
            return {
                id: b.id,
                name: b.name,
                description: b.description as string | null,
                icon: b.icon as string,
                course,
                unlockedAt: unlocked?.unlockedAt || null,
            };
        })
        .filter((b) => b.course?.isPublished);

    const unlockedCount = badges.filter((b) => b.unlockedAt).length;

    return (
        <div className="max-w-5xl mx-auto flex flex-col gap-6">
            <div>
                <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-1 text-[13px] font-semibold text-ui-accent hover:underline mb-3"
                >
                    <ChevronLeft className="h-4 w-4" />
                    Dashboard
                </Link>
                <h1 className="text-2xl md:text-[26px] font-bold text-slate-900 tracking-tight">Your badges</h1>
                <p className="mt-1 text-sm text-ui-muted">Earn a badge each time you complete a module.</p>
            </div>

            {badges.length > 0 && (
                <div className="bg-white rounded-xl border border-ui-line px-6 py-5 flex flex-wrap items-center gap-x-6 gap-y-3">
                    <p className="text-[32px] leading-none font-bold text-slate-900 tracking-tight">
                        {unlockedCount} <span className="text-base font-medium text-ui-muted">of {badges.length} earned</span>
                    </p>
                    <div className="flex-1 min-w-[200px] h-2 bg-slate-200/70 rounded-full overflow-hidden">
                        <div
                            className="h-full rounded-full bg-amber-500"
                            style={{ width: `${Math.round((unlockedCount / badges.length) * 100)}%` }}
                        />
                    </div>
                </div>
            )}

            {badges.length === 0 ? (
                <div className="bg-white rounded-xl border border-ui-line p-12 text-center">
                    <Lock className="h-10 w-10 text-slate-400 mx-auto mb-3" />
                    <h3 className="text-lg font-bold text-slate-900">No badges available yet</h3>
                    <p className="text-sm text-slate-500 mt-1">Badges will appear here as they are added to courses.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {badges.map((badge) => {
                        const isUnlocked = !!badge.unlockedAt;
                        return (
                            <div
                                key={badge.id}
                                className={`rounded-xl p-6 flex flex-col items-center text-center gap-3 ${
                                    isUnlocked ? "bg-white border border-ui-line" : "bg-white/60 border border-dashed border-ui-line-strong"
                                }`}
                            >
                                <div
                                    className={`h-[72px] w-[72px] rounded-full flex items-center justify-center ${
                                        isUnlocked ? "bg-amber-50 border border-amber-200 text-amber-600" : "bg-slate-100 text-slate-400"
                                    }`}
                                >
                                    {isUnlocked ? (
                                        <BadgeIcon icon={badge.icon} className="h-8 w-8" />
                                    ) : (
                                        <Lock className="h-7 w-7" />
                                    )}
                                </div>
                                <div>
                                    <p className={`text-[15px] font-semibold ${isUnlocked ? "text-slate-900" : "text-slate-600"}`}>
                                        {badge.name}
                                    </p>
                                    <p className="text-xs text-ui-muted mt-1 line-clamp-2">
                                        {badge.description || `Complete "${badge.course?.title}" to unlock.`}
                                    </p>
                                </div>
                                {isUnlocked ? (
                                    <span className="text-xs text-ui-muted">
                                        Earned on {new Date(badge.unlockedAt!).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                    </span>
                                ) : (
                                    <span className="text-xs text-ui-muted">Locked</span>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
