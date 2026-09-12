"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Loader2, CheckCircle2, ArrowLeft } from "lucide-react";
import { LogoCtIcon } from "@/components/logo-ct-icon";
import { requestPasswordReset } from "@/app/actions/auth";

export default function ForgotPasswordPage() {
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        const formData = new FormData(e.currentTarget);
        const email = formData.get("email") as string;

        try {
            const result = await requestPasswordReset(email);
            if (result?.error) {
                setError(result.error);
                setIsLoading(false);
                return;
            }
            setIsSubmitted(true);
        } catch (err) {
            console.error("Password reset request error:", err);
            setError("Unable to contact the server. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-sans">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-sm p-8 flex flex-col">
                <div className="flex flex-col items-center mb-8 text-center">
                    <LogoCtIcon className="h-14 w-auto mb-4" />
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                        Forgot your password?
                    </h1>
                    <p className="text-sm text-slate-500 mt-2">
                        Enter your email and we&apos;ll send you a link to reset it.
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-600">
                        <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                        <p className="text-sm font-medium">{error}</p>
                    </div>
                )}

                {isSubmitted ? (
                    <div className="p-4 bg-green-50 border border-green-100 rounded-xl flex items-start gap-3 text-green-700">
                        <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5 text-green-600" />
                        <p className="text-sm font-medium">
                            If an account exists for this email, we&apos;ve sent a link to reset your password.
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-slate-700 font-semibold">Email Address</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="student@example.com"
                                required
                                disabled={isLoading}
                                className="text-slate-900 placeholder:text-slate-400 rounded-xl border-slate-200 bg-slate-50 focus-visible:ring-slate-400 focus-visible:bg-white h-11 disabled:opacity-50"
                            />
                        </div>

                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-md text-base font-semibold disabled:opacity-80"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                "Send reset link"
                            )}
                        </Button>
                    </form>
                )}

                <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                    <Link href="/auth/login" className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-900 hover:underline">
                        <ArrowLeft className="h-4 w-4" />
                        Back to sign in
                    </Link>
                </div>
            </div>
        </div>
    );
}
