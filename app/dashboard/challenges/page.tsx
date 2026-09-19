import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { ChallengeBoard } from "@/components/challenges/challenge-board";
import { todayIsoDate, type Challenge } from "@/components/challenges/types";

export default async function ChallengesPage({
    searchParams,
}: {
    searchParams: Promise<{ challenge?: string }>;
}) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return redirect("/auth/login");
    }

    const { challenge: challengeParam } = await searchParams;

    // Le RLS ne montre déjà que les challenges publiés dont la date est atteinte, mais les admins
    // contournent le RLS : le filtre reste nécessaire pour qu'ils voient la même chose que les
    // étudiants (brouillons et challenges programmés se gèrent depuis l'espace admin).
    const { data: rawChallenges, error } = await supabase
        .from("challenges")
        .select("id, title, description, language, startsAt:starts_at")
        .eq("is_published", true)
        .lte("starts_at", todayIsoDate())
        .order("starts_at", { ascending: false })
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Erreur récupération challenges:", error);
    }

    const challenges = (rawChallenges || []) as Challenge[];

    // Filtré sur l'utilisateur courant (un admin lirait sinon les solutions de tout le monde)
    const { data: mySubmissions } = await supabase
        .from("challenge_submissions")
        .select("challenge_id, solution")
        .eq("user_id", user.id);

    const submissions = Object.fromEntries(
        (mySubmissions || []).map((s) => [s.challenge_id, s.solution])
    ) as Record<string, string>;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Challenges</h1>
                <p className="text-slate-500 mt-1">
                    A new coding challenge every week. Try it out and submit your solution.
                </p>
            </div>

            <ChallengeBoard
                challenges={challenges}
                submissions={submissions}
                initialOpenId={challengeParam ?? null}
            />
        </div>
    );
}
