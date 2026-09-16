"use client";

import { useState } from "react";
import { Loader2, Wrench } from "lucide-react";
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
import { setMaintenanceMode } from "@/app/actions/maintenance";

interface MaintenanceModeToggleProps {
    initialEnabled: boolean;
}

export function MaintenanceModeToggle({ initialEnabled }: MaintenanceModeToggleProps) {
    const [enabled, setEnabled] = useState(initialEnabled);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const target = !enabled;

    const onConfirm = async () => {
        setIsSubmitting(true);
        setError(null);
        try {
            await setMaintenanceMode(target);
            setEnabled(target);
            setIsDialogOpen(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="mb-8 bg-slate-900 rounded-3xl p-6 shadow-md border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
                <div className="h-12 w-12 shrink-0 bg-slate-800 rounded-xl flex items-center justify-center border border-slate-700">
                    <Wrench className="h-6 w-6 text-amber-400" />
                </div>
                <div>
                    <h2 className="text-base font-bold text-white">Maintenance mode</h2>
                    <p className="text-sm text-slate-400 mt-0.5">
                        {enabled
                            ? "The site is currently in maintenance mode — visitors are redirected to the maintenance page."
                            : "The site is running normally for all visitors."}
                    </p>
                </div>
            </div>

            <Button
                variant={enabled ? "secondary" : "destructive"}
                onClick={() => {
                    setError(null);
                    setIsDialogOpen(true);
                }}
                className="rounded-xl h-10 shrink-0"
            >
                {enabled ? "Disable maintenance mode" : "Enable maintenance mode"}
            </Button>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {target ? "Enable maintenance mode?" : "Disable maintenance mode?"}
                        </DialogTitle>
                        <DialogDescription>
                            {target
                                ? "All visitors will be redirected to the maintenance page. Admins stay logged in and can keep using the site normally, including to turn this back off."
                                : "The site will become accessible to everyone again immediately."}
                        </DialogDescription>
                    </DialogHeader>

                    {error && <p className="text-sm text-red-500 font-medium">{error}</p>}

                    <DialogFooter>
                        <DialogClose className="h-10 px-4 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors">
                            Cancel
                        </DialogClose>
                        <Button
                            variant={target ? "destructive" : "default"}
                            disabled={isSubmitting}
                            onClick={onConfirm}
                            className="h-10 px-4 rounded-xl font-bold"
                        >
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {target ? "Yes, enable it" : "Yes, disable it"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
