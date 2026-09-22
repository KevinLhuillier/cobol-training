import { Lightbulb, Lock } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { LessonBlocksView } from "./lesson-blocks-view";
import type { SolutionBlockData } from "./types";

interface SolutionBlockViewProps {
    data: SolutionBlockData;
    // Solution visible uniquement une fois déverrouillée — condition dépendant du contexte
    // d'usage : exercice approuvé (lesson_progress.exercise_status === "APPROVED", cf.
    // app/dashboard/courses/[courseId]/page.tsx) ou challenge devenu "previous" (cf.
    // components/challenges/challenge-board.tsx).
    isUnlocked: boolean;
    // Message affiché tant que la solution est verrouillée, adapté au contexte par l'appelant.
    lockedMessage?: string;
}

export function SolutionBlockView({
    data,
    isUnlocked,
    lockedMessage = "The solution will be available once your submission for this exercise is approved.",
}: SolutionBlockViewProps) {
    const title = data.title?.trim() || "Show solution";

    if (!isUnlocked) {
        return (
            <div className="flex items-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-slate-400">
                <Lock className="h-4 w-4 shrink-0" />
                <p className="text-sm">{lockedMessage}</p>
            </div>
        );
    }

    return (
        // @ts-expect-error - Contournement conflit type Radix/React 19
        <Accordion type="multiple" className="w-full rounded-2xl border border-slate-200 bg-white px-4">
            <AccordionItem value="solution" className="border-none">
                <AccordionTrigger className="hover:no-underline py-3 text-left cursor-pointer">
                    <span className="flex items-center gap-2 font-bold text-slate-900">
                        <Lightbulb className="h-4 w-4 text-amber-500" />
                        {title}
                    </span>
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                    {data.blocks.length > 0 ? (
                        <LessonBlocksView blocks={data.blocks} isSolutionUnlocked={isUnlocked} solutionLockedMessage={lockedMessage} />
                    ) : (
                        <p className="text-sm italic text-slate-400">No solution content yet.</p>
                    )}
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    );
}
