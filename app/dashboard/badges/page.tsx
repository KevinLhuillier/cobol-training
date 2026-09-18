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
        <div className="max-w-5xl mx-auto">
            <div className="mb-8 flex items-center gap-4">
                <Link
                    href="/dashboard"
                    className="h-10 w-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-sm shrink-0"
                >
                    <ChevronLeft className="h-5 w-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Your Badges</h1>
                    <p className="text-sm text-slate-500">
                        {unlockedCount} / {badges.length} badges unlocked
                    </p>
                </div>
            </div>

            {badges.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center shadow-sm">
                    <Lock className="h-10 w-10 text-slate-400 mx-auto mb-3" />
                    <h3 className="text-lg font-bold text-slate-900">No badges available yet</h3>
                    <p className="text-sm text-slate-500 mt-1">Badges will appear here as they are added to courses.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {badges.map((badge) => {
                        const isUnlocked = !!badge.unlockedAt;
                        return (
                            <div
                                key={badge.id}
                                className={`bg-white rounded-2xl border p-6 shadow-sm flex flex-col items-center text-center gap-3 ${
                                    isUnlocked ? "border-amber-100" : "border-slate-100"
                                }`}
                            >
                                <div
                                    className={`h-16 w-16 rounded-2xl flex items-center justify-center ${
                                        isUnlocked ? "bg-amber-100 text-amber-600" : "bg-slate-100 text-slate-300"
                                    }`}
                                >
                                    {isUnlocked ? (
                                        <BadgeIcon icon={badge.icon} className="h-8 w-8" />
                                    ) : (
                                        <Lock className="h-7 w-7" />
                                    )}
                                </div>
                                <div>
                                    <p className={`font-bold ${isUnlocked ? "text-slate-900" : "text-slate-400"}`}>
                                        {badge.name}
                                    </p>
                                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                                        {badge.description || `Complete "${badge.course?.title}" to unlock.`}
                                    </p>
                                </div>
                                {isUnlocked ? (
                                    <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full">
                                        Unlocked {new Date(badge.unlockedAt!).toLocaleDateString()}
                                    </span>
                                ) : (
                                    <span className="text-[11px] font-semibold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-full">
                                        Locked
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
