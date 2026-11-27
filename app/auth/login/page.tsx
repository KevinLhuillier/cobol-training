"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Loader2, CheckCircle2 } from "lucide-react";
import { AuthShell, authInputClass, authLabelClass, authButtonClass } from "@/components/auth/auth-shell";
import { CAPTCHA_ENABLED, Turnstile } from "@/components/turnstile";

// Import du client Supabase
import { createClient } from "@/utils/supabase/client";

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Détecte si l'utilisateur vient d'être redirigé depuis la page register
    const isRegistered = searchParams.get("registered") === "true";

    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [captchaToken, setCaptchaToken] = useState<string | null>(null);
    const [captchaReset, setCaptchaReset] = useState(0);

    // Un token Turnstile n'est valable qu'une fois : on en redemande un après chaque tentative.
    const resetCaptcha = () => {
        setCaptchaToken(null);
        setCaptchaReset((n) => n + 1);
    };

    // Initialisation du client Supabase
    const supabase = createClient();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        const formData = new FormData(e.currentTarget);
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        try {
            // Appel à l'API Supabase pour l'authentification
            const { error: supabaseError } = await supabase.auth.signInWithPassword({
                email,
                password,
                options: { captchaToken: captchaToken ?? undefined },
            });
            resetCaptcha();

            if (supabaseError) {
                console.error("Supabase Login Error:", supabaseError);

                // Traduction et adaptation des erreurs courantes de Supabase
                if (supabaseError.message.includes("Invalid login credentials")) {
                    setError("Invalid email or password.");
                } else if (supabaseError.message.includes("Email not confirmed")) {
                    setError("Please verify your email address before signing in.");
                } else {
                    setError(supabaseError.message);
                }
                setIsLoading(false);
                return;
            }

            // Succès : redirection vers le tableau de bord.
            // L'envoi de l'email de bienvenue et le démarrage de l'essai sont gérés côté serveur
            // (dashboard/layout.tsx et dashboard/page.tsx), pas ici : juste après signInWithPassword,
            // la session peut ne pas encore être disponible pour un Server Action appelé depuis le
            // client, ce qui faisait échouer ces deux étapes en silence.
            router.push("/dashboard");

        } catch (err) {
            console.error("Login Error:", err);
            resetCaptcha();
            setError("Unable to contact the server. Please try again.");
            setIsLoading(false);
        }
    };

    return (
        <AuthShell title="Sign in" subtitle={<>Welcome back. Continue where you left off.</>} footer={<>New here?{" "}<Link href="/auth/register" className="font-semibold text-ui-accent hover:underline">Create an account</Link>{" "}— 7-day free trial.</>}>

            {/* BANDEAU DE SUCCÈS */}
            {isRegistered && !error && (
                <div className="mb-5 p-3 bg-emerald-50 rounded-lg flex items-start gap-2.5 text-emerald-800">
                    <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-600" />
                    <p className="text-sm font-medium">
                        Account created successfully! A confirmation email has been sent to your inbox.
                    </p>
                </div>
            )}

            {/* AFFICHAGE DES ERREURS */}
            {error && (
                <div className="mb-5 p-3 bg-red-50 rounded-lg flex items-start gap-2.5 text-red-800">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <p className="text-sm font-medium">{error}</p>
                </div>
            )}

            {/* FORMULAIRE */}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="email" className={authLabelClass}>
                        Email Address
                    </Label>
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
                    <div className="flex items-center justify-between">
                        <Label htmlFor="password" className={authLabelClass}>
                            Password
                        </Label>
                        <Link href="/auth/forgot-password" className="text-[13px] font-medium text-ui-accent hover:underline">
                            Forgot password?
                        </Link>
                    </div>
                    <Input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="••••••••"
                        required
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
                            Signing in...
                        </>
                    ) : (
                        "Sign In"
                    )}
                </Button>

                <Turnstile action="login" onToken={setCaptchaToken} resetSignal={captchaReset} />
            </form>
        </AuthShell>
    );
}

// Export par défaut de la page avec la boundary Suspense
export default function LoginPage() {
    return (
        <Suspense fallback={<div className="flex-1" />}>
                <LoginForm />
            </Suspense>
    );
}