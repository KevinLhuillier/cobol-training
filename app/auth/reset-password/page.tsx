"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Loader2 } from "lucide-react";
import { AuthShell, authInputClass, authLabelClass, authButtonClass } from "@/components/auth/auth-shell";
import { createClient } from "@/utils/supabase/client";

export default function ResetPasswordPage() {
    const router = useRouter();
    const [supabase] = useState(() => createClient());

    const [isCheckingSession, setIsCheckingSession] = useState(true);
    const [hasValidSession, setHasValidSession] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Le lien de récupération redirige ici avec la session dans le fragment d'URL
        // (#access_token=...&refresh_token=...&type=recovery) — confirmé en interceptant la
        // redirection 303 de Supabase. La détection automatique du SDK (detectSessionInUrl) s'est
        // révélée peu fiable avec le routeur client de Next.js App Router, donc on lit et échange
        // ce fragment nous-mêmes de façon déterministe plutôt que de compter dessus.
        const hash = window.location.hash;
        const params = new URLSearchParams(hash.startsWith("#") ? hash.slice(1) : hash);
        const accessToken = params.get("access_token");
        const refreshToken = params.get("refresh_token");

        if (params.get("type") === "recovery" && accessToken && refreshToken) {
            supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken }).then(({ data, error: sessionError }) => {
                setHasValidSession(!sessionError && !!data.session);
                setIsCheckingSession(false);
                // Retire le token de l'URL une fois consommé (il ne doit pas rester visible/rejouable).
                window.history.replaceState(null, "", window.location.pathname);
            });
            return;
        }

        // Pas de token dans l'URL (ex. rechargement de la page après un premier passage réussi) :
        // on vérifie s'il existe déjà une session valide.
        supabase.auth.getUser().then(({ data: { user } }) => {
            setHasValidSession(!!user);
            setIsCheckingSession(false);
        });
    }, [supabase]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);

        const formData = new FormData(e.currentTarget);
        const password = formData.get("password") as string;
        const confirmPassword = formData.get("confirmPassword") as string;

        if (password.length < 8) {
            setError("Password must be at least 8 characters long.");
            return;
        }
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setIsLoading(true);
        try {
            const { error: updateError } = await supabase.auth.updateUser({ password });
            if (updateError) {
                setError(updateError.message);
                setIsLoading(false);
                return;
            }
            router.push("/dashboard");
            router.refresh();
        } catch (err) {
            console.error("Reset password error:", err);
            setError("Unable to contact the server. Please try again.");
            setIsLoading(false);
        }
    };

    return (
        <AuthShell title="Choose a new password" subtitle={<>Make it something you don&apos;t use elsewhere.</>}>

                {error && (
                    <div className="mb-5 p-3 bg-red-50 rounded-lg flex items-start gap-2.5 text-red-800">
                        <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                        <p className="text-sm font-medium">{error}</p>
                    </div>
                )}

                {isCheckingSession ? (
                    <div className="flex justify-center py-6">
                        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                    </div>
                ) : !hasValidSession ? (
                    <div className="p-3 bg-amber-50 rounded-lg text-amber-800">
                        <p className="text-sm font-medium">
                            This reset link is invalid or has expired. Please request a new one.
                        </p>
                        <Link
                            href="/auth/forgot-password"
                            className="inline-block mt-2 text-sm font-semibold text-ui-accent hover:underline"
                        >
                            Request a new link
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="password" className={authLabelClass}>New Password</Label>
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
                            <Label htmlFor="confirmPassword" className={authLabelClass}>Confirm New Password</Label>
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
                            disabled={isLoading}
                            className={authButtonClass}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                "Update password"
                            )}
                        </Button>
                    </form>
                )}
            </AuthShell>
    );
}
