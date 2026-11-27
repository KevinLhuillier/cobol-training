"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Loader2, CheckCircle2, ArrowLeft } from "lucide-react";
import { AuthShell, authInputClass, authLabelClass, authButtonClass } from "@/components/auth/auth-shell";
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
        <AuthShell title="Forgot your password?" subtitle={<>Enter your email and we&apos;ll send you a link to reset it.</>} footer={<Link href="/auth/login" className="inline-flex items-center gap-1.5 font-semibold text-ui-accent hover:underline"><ArrowLeft className="h-4 w-4" />Back to sign in</Link>}>

                {error && (
                    <div className="mb-5 p-3 bg-red-50 rounded-lg flex items-start gap-2.5 text-red-800">
                        <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                        <p className="text-sm font-medium">{error}</p>
                    </div>
                )}

                {isSubmitted ? (
                    <div className="p-3 bg-emerald-50 rounded-lg flex items-start gap-2.5 text-emerald-800">
                        <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-600" />
                        <p className="text-sm font-medium">
                            If an account exists for this email, we&apos;ve sent a link to reset your password.
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email" className={authLabelClass}>Email Address</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="student@example.com"
                                required
                                disabled={isLoading}
                                className={authInputClass}
                            />
                        </div>

                        <Button
                            type="submit"
                            disabled={isLoading}
                            className={authButtonClass}
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
            </AuthShell>
    );
}
