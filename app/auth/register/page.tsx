"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { AuthShell, authInputClass, authLabelClass, authButtonClass } from "@/components/auth/auth-shell";
import { CAPTCHA_ENABLED, Turnstile } from "@/components/turnstile";
import { notifyAdminNewRegistration, checkRegistrationAllowed, addStudentToResendAudience } from "@/app/actions/auth";

export default function RegisterPage() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [captchaToken, setCaptchaToken] = useState<string | null>(null);
    const [captchaReset, setCaptchaReset] = useState(0);

    // Un token Turnstile n'est valable qu'une fois : on en redemande un après chaque tentative.
    const resetCaptcha = () => {
        setCaptchaToken(null);
        setCaptchaReset((n) => n + 1);
    };

    // Initialize Supabase client
    const supabase = createClient();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        const formData = new FormData(e.currentTarget);
        const name = formData.get("name") as string;
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;
        const confirmPassword = formData.get("confirmPassword") as string;

        // 1. Local validation
        if (password.length < 8) {
            setError("Password must be at least 8 characters long.");
            setIsLoading(false);
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            setIsLoading(false);
            return;
        }

        // Même règle que le trigger anti-bot en base (block_bot_signup) : premier mot ≤ 15 caractères.
        if ((name.trim().split(/\s+/)[0] ?? "").length > 15) {
            setError("Please enter a valid name.");
            setIsLoading(false);
            return;
        }

// 2. Anti-abus : refuse l'inscription si cette IP a déjà servi à se connecter à un
        // autre compte (évite qu'une même personne cumule plusieurs essais gratuits).
        try {
            const { allowed } = await checkRegistrationAllowed(name, email);
            if (!allowed) {
                setError("Registration failed. Please try again later.");
                setIsLoading(false);
                return;
            }
        } catch (checkError) {
            console.error("checkRegistrationAllowed error:", checkError);
            // En cas d'échec de la vérification, on laisse l'inscription se poursuivre
            // plutôt que de bloquer un utilisateur légitime.
        }

        // 3. Supabase Auth call
        try {
            const { data, error: supabaseError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    // Send name to metadata so the SQL trigger can populate public.users
                    data: {
                        name: name,
                    },
                    emailRedirectTo: `${window.location.origin}/auth/login`,
                    captchaToken: captchaToken ?? undefined,
                },
            });
            resetCaptcha();

            // Erreur classique renvoyée par Supabase (ex: mot de passe trop faible)
            if (supabaseError) {
                // 🟢 Ajout d'un console.log pour voir l'erreur exacte dans la console du navigateur
                console.error("Supabase Auth Error:", supabaseError);

                if (supabaseError.message?.includes("already registered")) {
                    setError("This email address is already in use.");
                } else {
                    // 🟢 On s'assure d'avoir toujours un texte affiché, même si l'erreur est un objet
                    setError(supabaseError.message || "A server error occurred during registration.");
                }
                setIsLoading(false);
                return;
            }

            // 🟢 NOUVEAU : Détection de l'email déjà utilisé (Email Enumeration Protection)
            if (data.user && data.user.identities && data.user.identities.length === 0) {
                setError("This email address is already in use.");
                setIsLoading(false);
                return;
            }

            // 4. Notify the app owner of the new registration (best-effort, non-blocking)
            notifyAdminNewRegistration(email).catch((notifyError) => {
                console.error("Admin registration notification failed:", notifyError);
            });

            // 4bis. Add the new student to the Resend audience (best-effort, non-blocking)
            addStudentToResendAudience(email).catch((audienceError) => {
                console.error("Resend audience notification failed:", audienceError);
            });

            // 5. Success: Redirect
            router.push("/auth/login?registered=true");

        } catch (err) {
            console.error("Registration error:", err);
            resetCaptcha();
            setError("Unable to contact the server. Please try again.");
            setIsLoading(false);
        }
    };

    return (
        <AuthShell title="Create your account" subtitle={<>Start with a 7-day free trial. No credit card required.</>} footer={<>Already have an account?{" "}<Link href="/auth/login" className="font-semibold text-ui-accent hover:underline">Sign in</Link></>}>

                {/* ERROR DISPLAY */}
                {error && (
                    <div className="mb-5 p-3 bg-red-50 rounded-lg flex items-start gap-2.5 text-red-800">
                        <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                        <p className="text-sm font-medium">{error}</p>
                    </div>
                )}

                {/* FORM */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name" className={authLabelClass}>Full Name</Label>
                        <Input
                            id="name"
                            name="name"
                            type="text"
                            placeholder="John Doe"
                            required
                            disabled={isLoading}
                            className={authInputClass}
                        />
                    </div>

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

                    <div className="space-y-2">
                        <Label htmlFor="password" className={authLabelClass}>Password</Label>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="••••••••"
                            required
                            minLength={8}
                            disabled={isLoading}
                            className={authInputClass}
                        />
                        <p className="text-xs text-ui-muted">8 characters minimum</p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword" className={authLabelClass}>Confirm Password</Label>
                        <Input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            placeholder="••••••••"
                            required
                            minLength={8}
                            disabled={isLoading}
                            className={authInputClass}
                        />
                    </div>

                    <Button
                        type="submit"
                        disabled={isLoading || (CAPTCHA_ENABLED && !captchaToken)}
                        className={authButtonClass}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Creating account...
                            </>
                        ) : (
                            "Create Account"
                        )}
                    </Button>

                    <Turnstile action="signup" onToken={setCaptchaToken} resetSignal={captchaReset} />
                </form>
            </AuthShell>
    );
}
