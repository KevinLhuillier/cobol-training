"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Terminal, AlertCircle, Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export default function RegisterPage() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

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

// 2. Supabase Auth call
        try {
            const { data, error: supabaseError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    // Send name to metadata so the SQL trigger can populate public.users
                    data: {
                        name: name,
                    },
                    emailRedirectTo: `${window.location.origin}/auth/login`
                },
            });

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

            // 3. Success: Redirect
            router.push("/auth/login?registered=true");

        } catch (err) {
            console.error("Registration error:", err);
            setError("Unable to contact the server. Please try again.");
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-sans">
            {/* REGISTRATION CARD */}
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
                        Create your account to start your training.
                    </p>
                </div>

                {/* ERROR DISPLAY */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-600">
                        <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                        <p className="text-sm font-medium">{error}</p>
                    </div>
                )}

                {/* FORM */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-slate-700 font-semibold">Full Name</Label>
                        <Input
                            id="name"
                            name="name"
                            type="text"
                            placeholder="John Doe"
                            required
                            disabled={isLoading}
                            className="text-slate-900 rounded-xl border-slate-200 bg-slate-50 focus-visible:ring-slate-400 focus-visible:bg-white h-11 disabled:opacity-50"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-slate-700 font-semibold">Email Address</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="student@example.com"
                            required
                            disabled={isLoading}
                            className="text-slate-900 rounded-xl border-slate-200 bg-slate-50 focus-visible:ring-slate-400 focus-visible:bg-white h-11 disabled:opacity-50"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password" className="text-slate-700 font-semibold">Password</Label>
                        <Input
                            id="password"
                            name="password"
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
                        <Label htmlFor="confirmPassword" className="text-slate-700 font-semibold">Confirm Password</Label>
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

                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-md text-base font-semibold mt-4 disabled:opacity-80"
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
                </form>

                {/* LOGIN REDIRECTION */}
                <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                    <p className="text-sm text-slate-600">
                        Already have an account?{" "}
                        <Link href="/auth/login" className="font-bold text-slate-900 hover:underline">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}