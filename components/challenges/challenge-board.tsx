"use client";

import { useState } from "react";
import { Flame, CheckCircle2, ChevronRight, Calendar, Target } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LessonBlocksView } from "@/components/courses/lesson-blocks/lesson-blocks-view";
import { ChallengeSubmissionForm } from "@/components/challenges/challenge-submission-form";
import { formatChallengeDate, type Challenge } from "@/components/challenges/types";

interface ChallengeBoardProps {
    // Déjà triés du plus récent au plus ancien : le premier est le challenge de la semaine.
    challenges: Challenge[];
    // Solution déjà soumise par l'utilisateur, indexée par id de challenge
    submissions: Record<string, string>;
    // Challenge à ouvrir d'emblée (lien ?challenge=<id> de la newsletter)
    initialOpenId?: string | null;
}

export function ChallengeBoard({ challenges, submissions, initialOpenId = null }: ChallengeBoardProps) {
    const [selectedId, setSelectedId] = useState<string | null>(
        challenges.some((c) => c.id === initialOpenId) ? initialOpenId : null
    );

    const [featured, ...previous] = challenges;
    const selected = challenges.find((c) => c.id === selectedId) || null;

    if (!featured) {
        return (
            <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center shadow-sm">
                <Target className="h-10 w-10 text-slate-400 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-900">No challenge yet</h3>
                <p className="text-sm text-slate-500 mt-1">The next coding challenge will arrive with the newsletter.</p>
            </div>
        );
    }

    const featuredSubmitted = featured.id in submissions;

    return (
        <>
            {/* CHALLENGE DE LA SEMAINE */}
            <div className="bg-slate-900 rounded-[2rem] p-6 md:p-8 shadow-md border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 uppercase tracking-wider">
                            <Flame className="h-4 w-4" />
                            Challenge of the week
                        </span>
                        <Badge className="border-none bg-slate-800 text-emerald-400">{featured.language}</Badge>
                    </div>
                    <h2 className="text-2xl font-bold text-white">{featured.title}</h2>
                    <p className="text-sm text-slate-400 mt-2 flex items-center gap-1.5">
                        <Calendar className="h-4 w-4" />
                        Week of {formatChallengeDate(featured.startsAt)}
                        {featuredSubmitted && (
                            <span className="ml-3 inline-flex items-center gap-1 text-emerald-400 font-medium">
                                <CheckCircle2 className="h-4 w-4" />
                                Solution submitted
                            </span>
                        )}
                    </p>
                </div>
                <Button
                    onClick={() => setSelectedId(featured.id)}
                    className="bg-white text-slate-900 hover:bg-slate-100 rounded-xl h-11 px-6 font-bold shrink-0"
                >
                    {featuredSubmitted ? "View my solution" : "Take the challenge"}
                </Button>
            </div>

            {/* CHALLENGES PRÉCÉDENTS */}
            {previous.length > 0 && (
                <div className="mt-10">
                    <h2 className="text-lg font-bold text-slate-900 mb-4">Previous challenges</h2>
                    <div className="bg-slate-50 rounded-2xl border border-slate-100 divide-y divide-slate-100 overflow-hidden">
                        {previous.map((challenge) => (
                            <button
                                key={challenge.id}
                                onClick={() => setSelectedId(challenge.id)}
                                className="w-full flex items-center gap-4 p-4 text-left hover:bg-slate-100/60 transition-colors"
                            >
                                <div className="min-w-0 flex-1">
                                    <p className="font-bold text-slate-900 truncate">{challenge.title}</p>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        Week of {formatChallengeDate(challenge.startsAt)}
                                    </p>
                                </div>
                                <Badge variant="secondary" className="border-none bg-slate-200 text-slate-700 shrink-0">
                                    {challenge.language}
                                </Badge>
                                {challenge.id in submissions && (
                                    <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                                )}
                                <ChevronRight className="h-5 w-5 text-slate-300 shrink-0" />
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* POPUP : détail du challenge + soumission */}
            <Dialog open={selected !== null} onOpenChange={(open) => { if (!open) setSelectedId(null); }}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    {selected && (
                        <div className="space-y-6">
                            <div className="pr-8">
                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                    <Badge className="border-none bg-slate-100 text-slate-700">{selected.language}</Badge>
                                    <span className="text-xs text-slate-500">
                                        Week of {formatChallengeDate(selected.startsAt)}
                                    </span>
                                </div>
                                <DialogTitle className="text-xl">{selected.title}</DialogTitle>
                                <DialogDescription className="sr-only">
                                    Challenge instructions and solution submission
                                </DialogDescription>
                            </div>

                            <div className="border border-slate-100 rounded-2xl p-4">
                                {selected.contentBlocks && selected.contentBlocks.length > 0 ? (
                                    <LessonBlocksView
                                        blocks={selected.contentBlocks}
                                        // La solution n'est révélée qu'une fois le challenge passé en "previous"
                                        // (il n'est plus celui mis en avant) — même règle que la soumission ci-dessous.
                                        isSolutionUnlocked={selected.id !== featured.id}
                                        solutionLockedMessage="The solution will be revealed once this challenge is no longer the current one."
                                    />
                                ) : (
                                    <p className="italic text-slate-500 p-4">No instructions provided.</p>
                                )}
                            </div>

                            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6">
                                {/* key : repart d'un état vierge à chaque changement de challenge */}
                                <ChallengeSubmissionForm
                                    key={selected.id}
                                    challengeId={selected.id}
                                    initialSolution={submissions[selected.id] ?? null}
                                    isCurrent={selected.id === featured.id}
                                />
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
