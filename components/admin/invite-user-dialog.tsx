"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Loader2, UserPlus, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { inviteUser } from "@/app/actions/auth";

export function InviteUserDialog() {
    const router = useRouter();

    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [invitedEmail, setInvitedEmail] = useState<string | null>(null);

    const resetState = () => {
        setName("");
        setEmail("");
        setError("");
        setInvitedEmail(null);
    };

    const onOpenChange = (nextOpen: boolean) => {
        setOpen(nextOpen);
        if (!nextOpen) {
            // Laisse l'animation de fermeture se jouer avant de vider le formulaire.
            setTimeout(resetState, 200);
        }
    };

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        const result = await inviteUser(name, email);

        if (result?.error) {
            setError(result.error);
            setIsLoading(false);
            return;
        }

        setInvitedEmail(email.trim());
        setIsLoading(false);
        router.refresh();
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <Button
                onClick={() => setOpen(true)}
                className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-sm px-4"
            >
                <UserPlus className="h-4 w-4 mr-2" />
                Invite
            </Button>

            <DialogContent>
                {invitedEmail ? (
                    <>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                                Invitation sent
                            </DialogTitle>
                            <DialogDescription>
                                An email with login credentials was sent to <strong>{invitedEmail}</strong>.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button
                                onClick={() => setOpen(false)}
                                className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl"
                            >
                                Done
                            </Button>
                        </DialogFooter>
                    </>
                ) : (
                    <>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Mail className="h-5 w-5 text-slate-600" />
                                Invite a new user
                            </DialogTitle>
                            <DialogDescription>
                                An account is created immediately and an email with a login and
                                auto-generated password is sent to them.
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={onSubmit} className="space-y-4">
                            {error && (
                                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 font-medium">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="invite-name" className="text-slate-700 font-semibold">
                                    Name
                                </Label>
                                <Input
                                    id="invite-name"
                                    type="text"
                                    required
                                    disabled={isLoading}
                                    placeholder="John Doe"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="text-slate-900 h-11 rounded-xl border-slate-200 bg-slate-50 focus-visible:ring-slate-400 focus-visible:bg-white"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="invite-email" className="text-slate-700 font-semibold">
                                    Email
                                </Label>
                                <Input
                                    id="invite-email"
                                    type="email"
                                    required
                                    disabled={isLoading}
                                    placeholder="student@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="text-slate-900 h-11 rounded-xl border-slate-200 bg-slate-50 focus-visible:ring-slate-400 focus-visible:bg-white"
                                />
                            </div>

                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    disabled={isLoading}
                                    onClick={() => setOpen(false)}
                                    className="text-slate-500"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isLoading || !name || !email}
                                    className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-sm px-6"
                                >
                                    {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                    Send
                                </Button>
                            </DialogFooter>
                        </form>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
