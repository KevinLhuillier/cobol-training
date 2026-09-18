"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PartyPopper } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BadgeIcon } from "@/components/badges/badge-icon";
import { createClient } from "@/utils/supabase/client";

interface NewBadge {
    userBadgeId: string;
    name: string;
    description: string | null;
    icon: string;
    courseTitle: string;
}

interface NewBadgeDialogProps {
    badges: NewBadge[];
}

export function NewBadgeDialog({ badges }: NewBadgeDialogProps) {
    const router = useRouter();
    const supabase = createClient();
    const [open, setOpen] = useState(badges.length > 0);
    const [index, setIndex] = useState(0);

    if (badges.length === 0) return null;

    const current = badges[index];
    const isLast = index === badges.length - 1;

    const markSeen = async (userBadgeId: string) => {
        try {
            await supabase.from("user_badges").update({ seen_at: new Date().toISOString() }).eq("id", userBadgeId);
        } catch (error) {
            console.error("Failed to mark badge as seen:", error);
        }
    };

    const onContinue = async () => {
        await markSeen(current.userBadgeId);
        if (isLast) {
            setOpen(false);
            // Le compteur de badges du header (composant serveur dans le layout) doit être
            // rafraîchi explicitement : il n'est calculé qu'une fois au rendu et ne réagit pas
            // à cette mutation côté client (même logique que router.refresh() après les autres
            // mutations Supabase de l'app, cf. course-progress-button.tsx).
            router.refresh();
        } else {
            setIndex((prev) => prev + 1);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent showClose={false} className="text-center">
                <div className="mx-auto h-20 w-20 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mb-4">
                    <BadgeIcon icon={current.icon} className="h-10 w-10" />
                </div>
                <DialogTitle className="flex items-center justify-center gap-2 text-xl">
                    <PartyPopper className="h-5 w-5 text-amber-500" />
                    New badge unlocked!
                </DialogTitle>
                <DialogDescription className="mt-2">
                    You completed <span className="font-semibold text-slate-700">{current.courseTitle}</span> and earned the{" "}
                    <span className="font-semibold text-slate-700">{current.name}</span> badge.
                    {current.description ? ` ${current.description}` : ""}
                </DialogDescription>
                <div className="mt-6">
                    <Button onClick={onContinue} className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl w-full">
                        {isLast ? "Awesome!" : "Next badge"}
                    </Button>
                </div>
                {badges.length > 1 && (
                    <p className="mt-3 text-xs text-slate-400">
                        Badge {index + 1} of {badges.length}
                    </p>
                )}
            </DialogContent>
        </Dialog>
    );
}
