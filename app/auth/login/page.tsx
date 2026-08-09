"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Terminal, AlertCircle, Loader2, CheckCircle2 } from "lucide-react";

// Import du client Supabase
import { createClient } from "@/utils/supabase/client";

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Détecte si l'utilisateur vient d'être redirigé depuis la page register
    const isRegistered = searchParams.get("registered") === "true";

    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

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
            });

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

            fetch("/api/auth/welcome", { method: "POST" }).catch(err =>
                console.error("Welcome email trigger failed", err)
            );

            // Succès : Redirection vers le tableau de bord
            router.push("/dashboard");
            router.refresh();

        } catch (err) {
            console.error("Login Error:", err);
            setError("Unable to contact the server. Please try again.");
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md bg-white rounded-3xl shadow-sm p-8 flex flex-col">
            {/* HEADER / LOGO */}
            <div className="flex flex-col items-center mb-8 text-center">
                <div className="h-12 w-12 bg-slate-900 rounded-2xl flex items-center justify-center mb-4 shadow-md">
                    <Terminal className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                    Cobol Training
                </h1>
                <p className="text-sm text-slate-500 mt-2">
                    Sign in to your student workspace.
                </p>
            </div>

            {/* BANDEAU DE SUCCÈS */}
            {isRegistered && !error && (
                <div className="mb-6 p-4 bg-green-50 border border-green-100 rounded-xl flex items-start gap-3 text-green-700">
                    <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5 text-green-600" />
                    <p className="text-sm font-medium">
                        Account created successfully! A confirmation email has been sent to your inbox.
                    </p>
                </div>
            )}

            {/* AFFICHAGE DES ERREURS */}
            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-600">
                    <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                    <p className="text-sm font-medium">{error}</p>
                </div>
            )}

            {/* FORMULAIRE */}
            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-700 font-semibold">
                        Email Address
                    </Label>
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

                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="password" className="text-slate-700 font-semibold">
                            Password
                        </Label>
                        <Link href="/auth/reset-password" className="text-sm font-medium text-slate-500 hover:text-slate-900">
                            Forgot?
                        </Link>
                    </div>
                    <Input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="••••••••"
                        required
                        disabled={isLoading}
                        className="text-slate-900 placeholder:text-slate-400 rounded-xl border-slate-200 bg-slate-50 focus-visible:ring-slate-400 focus-visible:bg-white h-11 disabled:opacity-50"
                    />
                </div>

                <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-md text-base font-semibold mt-4 disabled:opacity-80"
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
            </form>

            {/* REDIRECTION INSCRIPTION */}
            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                <p className="text-sm text-slate-600">
                    Don&apos;t have an account?{" "}
                    <Link
                        href="/auth/register"
                        className="font-bold text-slate-900 hover:underline"
                    >
                        Sign Up
                    </Link>
                </p>
            </div>
        </div>
    );
}

// Export par défaut de la page avec la boundary Suspense
export default function LoginPage() {
    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-sans">
            <Suspense fallback={<div className="w-full max-w-md bg-white rounded-3xl shadow-sm h-[500px] animate-pulse"></div>}>
                <LoginForm />
            </Suspense>
        </div>
    );
}