"use client";

import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import { Rocket, Terminal, MessageCircle, PlayCircle } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";
import {
    Popover,
    PopoverPortal,
    PopoverClose,
    PopoverPositioner,
    PopoverPopup,
    PopoverArrow,
} from "@/components/ui/popover";

type StepId = "tso" | "messages" | "course";

interface StepConfig {
    icon: LucideIcon;
    title: string;
    description: string;
    side: "top" | "bottom" | "left" | "right";
}

// Les ids DOM ciblés par chaque étape : "messages" vit dans la Sidebar (components/Sidebar.tsx),
// rendue par un tout autre arbre React (le layout) que "tso"/"course" (rendus par cette page) —
// on ancre donc par id via document.getElementById plutôt que par ref React, pour ne pas avoir
// à faire remonter un contexte entre layout et page pour une seule fonctionnalité ponctuelle.
const ANCHOR_IDS: Record<StepId, string> = {
    tso: "onboarding-tso-anchor",
    messages: "onboarding-messages-anchor",
    course: "onboarding-course-anchor",
};

const STEP_CONFIG: Record<StepId, StepConfig> = {
    tso: {
        icon: Terminal,
        title: "Request your TSO user",
        description: "Whenever you're ready, click here to unlock your own mainframe (TSO) account.",
        side: "bottom",
    },
    messages: {
        icon: MessageCircle,
        title: "Need a hand?",
        description: "You can reach out to me anytime from here if you have a question.",
        side: "right",
    },
    course: {
        icon: PlayCircle,
        title: "Start learning",
        description: "This is your first module — hit Start whenever you're ready to begin.",
        side: "top",
    },
};

interface OnboardingTourProps {
    active: boolean;
    studentName: string;
    hasTsoStep: boolean;
    hasCourseStep: boolean;
}

export function OnboardingTour({ active, studentName, hasTsoStep, hasCourseStep }: OnboardingTourProps) {
    // Figés au montage : une action de l'utilisateur pendant le tour (ex. déverrouiller son
    // compte TSO depuis l'étape "tso") peut déclencher un router.refresh() qui re-render cette
    // page avec des props différentes (isFirstVisit repasse à false, hasTsoStep aussi) — sans ce
    // gel, le tour se couperait ou sauterait une étape en plein milieu.
    const [tourActive] = useState(active);
    const [steps] = useState<StepId[]>(() => {
        const list: StepId[] = [];
        if (hasTsoStep) list.push("tso");
        list.push("messages");
        if (hasCourseStep) list.push("course");
        return list;
    });

    const [showWelcome, setShowWelcome] = useState(tourActive);
    const [stepIndex, setStepIndex] = useState(-1);

    if (!tourActive) return null;

    const advance = () => setStepIndex((i) => i + 1);
    const currentStep = stepIndex >= 0 && stepIndex < steps.length ? steps[stepIndex] : null;

    return (
        <>
            <Dialog
                open={showWelcome}
                onOpenChange={(open) => {
                    setShowWelcome(open);
                    if (!open) advance();
                }}
            >
                <DialogContent showClose={false}>
                    <DialogHeader>
                        <div className="h-12 w-12 bg-slate-900 rounded-xl flex items-center justify-center mb-3">
                            <Rocket className="h-6 w-6 text-white" />
                        </div>
                        <DialogTitle>Welcome aboard, {studentName}!</DialogTitle>
                        <DialogDescription>
                            Welcome to our dedicated Cobol and Mainframe learning platform. You&apos;ll find
                            comprehensive courses and hands-on exercises, with the opportunity to practice
                            directly on a live TSO environment. Feel free to reach out if you have any
                            questions along the way — I&apos;m here to help!
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <DialogClose className="h-10 px-4 rounded-xl font-bold text-white bg-slate-900 hover:bg-slate-800 transition-colors w-full sm:w-auto">
                            Let&apos;s go
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {steps.map((id) => {
                if (id !== currentStep) return null;
                const config = STEP_CONFIG[id];
                const Icon = config.icon;
                return (
                    <Popover
                        key={id}
                        open
                        onOpenChange={(open) => {
                            if (!open) advance();
                        }}
                    >
                        <PopoverPortal>
                            <PopoverPositioner
                                anchor={() => document.getElementById(ANCHOR_IDS[id])}
                                side={config.side}
                                sideOffset={12}
                            >
                                <PopoverPopup>
                                    <PopoverArrow />
                                    <div className="flex items-start gap-3">
                                        <div className="h-9 w-9 shrink-0 bg-white/10 rounded-lg flex items-center justify-center">
                                            <Icon className="h-4 w-4 text-emerald-400" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-sm mb-1">{config.title}</p>
                                            <p className="text-xs text-slate-300 mb-3">{config.description}</p>
                                            <PopoverClose className="text-xs font-bold bg-white text-slate-900 rounded-lg px-3 py-1.5 hover:bg-slate-100 transition-colors cursor-pointer">
                                                Got it
                                            </PopoverClose>
                                        </div>
                                    </div>
                                </PopoverPopup>
                            </PopoverPositioner>
                        </PopoverPortal>
                    </Popover>
                );
            })}
        </>
    );
}
