"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, AlertTriangle } from "lucide-react";
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
import { cancelSubscription } from "@/app/actions/stripe";

export function CancelSubscriptionButton() {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const onConfirmCancel = async () => {
        setIsLoading(true);
        setError(null);
        try {
            await cancelSubscription();
            setIsOpen(false);
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Button
                variant="outline"
                onClick={() => setIsOpen(true)}
                className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 rounded-xl h-11 px-5"
            >
                Cancel subscription
            </Button>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
                            Wait — before you cancel
                        </DialogTitle>
                        <DialogDescription>
                            Heads up: the price of this subscription is about to increase to{" "}
                            <span className="font-bold text-slate-700">$29/month</span>. Staying subscribed now locks in your current rate for as long as your subscription stays active.
                        </DialogDescription>
                    </DialogHeader>

                    <p className="text-sm text-slate-500">
                        If you cancel anyway, you&apos;ll keep full access until the end of your current billing period — you won&apos;t be charged again after that.
                    </p>

                    {error && <p className="mt-3 text-sm text-red-500 font-medium">{error}</p>}

                    <DialogFooter>
                        <DialogClose className="h-10 px-4 rounded-xl font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer">
                            Keep my subscription
                        </DialogClose>
                        <Button
                            onClick={onConfirmCancel}
                            disabled={isLoading}
                            variant="destructive"
                            className="h-10 px-4 rounded-xl font-bold disabled:opacity-50"
                        >
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Yes, cancel anyway
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
