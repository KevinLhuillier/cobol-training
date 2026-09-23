"use client";

import { useState } from "react";
import { Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CAPTCHA_ENABLED, Turnstile } from "@/components/turnstile";
import { changePassword } from "@/app/actions/auth";

export function PasswordForm() {
    const [isLoading, setIsLoading] = useState(false);
    const [captchaToken, setCaptchaToken] = useState<string | null>(null);
    const [captchaReset, setCaptchaReset] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        const form = e.currentTarget;
        const formData = new FormData(form);
        const currentPassword = formData.get("currentPassword") as string;
        const newPassword = formData.get("newPassword") as string;
        const confirmPassword = formData.get("confirmPassword") as string;

        if (newPassword.length < 8) {
            setError("New password must be at least 8 characters long.");
            return;
        }
        if (newPassword !== confirmPassword) {
            setError("New passwords do not match.");
            return;
        }

        setIsLoading(true);
        const result = await changePassword(currentPassword, newPassword, captchaToken ?? undefined);
        setIsLoading(false);
        // Un token Turnstile n'est valable qu'une fois : on en redemande un après chaque tentative.
        setCaptchaToken(null);
        setCaptchaReset((n) => n + 1);

        if (result?.error) {
            setError(result.error);
        } else {
            setSuccess(true);
            form.reset();
        }
    };

    return (
        <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="currentPassword" className="text-slate-700 font-semibold">Current Password</Label>
                <Input
                    id="currentPassword"
                    name="currentPassword"
                    type="password"
                    placeholder="••••••••"
                    required
                    disabled={isLoading}
                    className="text-slate-900 rounded-xl border-slate-200 bg-slate-50 focus-visible:ring-slate-400 focus-visible:bg-white h-11 disabled:opacity-50"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-slate-700 font-semibold">New Password</Label>
                <Input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    placeholder="••••••••"
                    required
                    minLength={8}
                    disabled={isLoading}
                    className="text-slate-900 rounded-xl border-slate-200 bg-slate-50 focus-visible:ring-slate-400 focus-visible:bg-white h-11 disabled:opacity-50"
                />
                <p className="text-xs text-slate-500 font-medium">8 characters minimum</p>
            </div>

            <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-slate-700 font-semibold">Confirm New Password</Label>
                <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    required
                    minLength={8}
                    disabled={isLoading}
                    className="text-slate-900 rounded-xl border-slate-200 bg-slate-50 focus-visible:ring-slate-400 focus-visible:bg-white h-11 disabled:opacity-50"
                />
            </div>

            {error && <p className="text-sm text-red-500 font-medium">{error}</p>}
            {success && (
                <p className="flex items-center gap-1.5 text-sm text-emerald-600 font-medium">
                    <Check className="h-4 w-4" /> Password updated
                </p>
            )}

            <Button
                type="submit"
                disabled={isLoading || (CAPTCHA_ENABLED && !captchaToken)}
                className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-sm h-11 px-5 disabled:opacity-50"
            >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update password
            </Button>

            <Turnstile action="change-password" onToken={setCaptchaToken} resetSignal={captchaReset} />
        </form>
    );
}
