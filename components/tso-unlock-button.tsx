"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Unlock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";
import { unlockTsoAccount } from "@/app/actions/tso";

interface TsoAccount {
    username: string;
    password: string;
    host: string | null;
    port: number | null;
}

type TsoAccess = { type: "subscription" } | { type: "trial"; endsAt: string };

function formatAccessMessage(access: TsoAccess | null): string {
    if (!access) return "";
    if (access.type === "subscription") {
        return "This account remains active for as long as your subscription is active.";
    }
    const formattedDate = new Date(access.endsAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
    });
    return `This account is valid until your trial ends on ${formattedDate}.`;
}

export function TsoUnlockButton() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [account, setAccount] = useState<TsoAccount | null>(null);
    const [access, setAccess] = useState<TsoAccess | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const onUnlock = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await unlockTsoAccount();
            setAccount(result.account);
            setAccess(result.access);
            setIsDialogOpen(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong.");
        } finally {
            setIsLoading(false);
        }
    };

    // On ne rafraîchit la page (et donc ne remplace ce bouton par les identifiants) qu'à la
    // fermeture de la popup — sinon router.refresh() démonte ce composant pendant qu'elle est ouverte.
    const onDialogOpenChange = (open: boolean) => {
        setIsDialogOpen(open);
        if (!open && account) {
            router.refresh();
        }
    };

    return (
        <>
            <div className="flex flex-col items-end gap-2">
                <Button
                    onClick={onUnlock}
                    disabled={isLoading}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm h-11 px-5"
                >
                    {isLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Unlock className="mr-2 h-4 w-4" />
                    )}
                    Unlock a TSO User
                </Button>
                {error && <p className="text-xs text-red-400 font-medium max-w-[260px] text-right">{error}</p>}
            </div>

            <Dialog open={isDialogOpen} onOpenChange={onDialogOpenChange}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>TSO account unlocked 🎉</DialogTitle>
                        <DialogDescription>
                            {formatAccessMessage(access)} We&apos;ve also sent these details to your email.
                        </DialogDescription>
                    </DialogHeader>

                    {account && (
                        <div className="bg-slate-900 rounded-xl p-4 space-y-3">
                            <div>
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Username</p>
                                <p className="font-mono text-emerald-400 font-bold text-sm">{account.username}</p>
                            </div>
                            <div>
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Password</p>
                                <p className="font-mono text-white font-bold text-sm">{account.password}</p>
                            </div>
                            {account.host && (
                                <div>
                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Host</p>
                                    <p className="font-mono text-white font-bold text-sm">{account.host}</p>
                                </div>
                            )}
                            {account.port && (
                                <div>
                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Port</p>
                                    <p className="font-mono text-white font-bold text-sm">{account.port}</p>
                                </div>
                            )}
                        </div>
                    )}

                    <DialogFooter>
                        <DialogClose className="h-10 px-4 rounded-xl font-bold text-white bg-slate-900 hover:bg-slate-800 transition-colors">
                            Got it
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
