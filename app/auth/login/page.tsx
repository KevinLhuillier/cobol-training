"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Terminal, AlertCircle, Loader2, CheckCircle2 } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const isRegistered = searchParams.get("registered") === "true";

    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        const formData = new FormData(e.currentTarget);
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Identifiants incorrects.");
                setIsLoading(false);
                return;
            }

            // Succès : Le cookie est enregistré, on va vers le tableau de bord
            router.push("/");
            router.refresh();

        } catch (err) {
            console.error("Erreur de connexion:", err);
            setError("Impossible de contacter le serveur. Veuillez réessayer.");
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-sans">

            {/* CARTE DE CONNEXION */}
            <div className="w-full max-w-md bg-white rounded-3xl shadow-sm p-8 flex flex-col">

                {/* HEADER / LOGO */}
                <div className="flex flex-col items-center mb-8 text-center">
                    <div className="h-12 w-12 bg-slate-900 rounded-2xl flex items-center justify-center mb-4 shadow-md">
                        <Terminal className="h-6 w-6 text-white" />
                    </div>
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                        Code Legacy
                    </h1>
                    <p className="text-sm text-slate-500 mt-2">
                        Connectez-vous à votre espace étudiant.
                    </p>
                </div>

                {/* BANDEAU DE SUCCÈS (Si redirection depuis l'inscription) */}
                {isRegistered && !error && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-100 rounded-xl flex items-start gap-3 text-green-700">
                        <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
                        <p className="text-sm font-medium">Votre compte a été créé avec succès. Vous pouvez maintenant vous connecter.</p>
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
                            Adresse e-mail
                        </Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="etudiant@exemple.com"
                            required
                            disabled={isLoading}
                            // Classe corrigée avec text-slate-900 pour la visibilité
                            className="text-slate-900 placeholder:text-slate-400 rounded-xl border-slate-200 bg-slate-50 focus-visible:ring-slate-400 focus-visible:bg-white h-11 disabled:opacity-50"
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password" className="text-slate-700 font-semibold">
                                Mot de passe
                            </Label>
                            <Link href="#" className="text-sm font-medium text-slate-500 hover:text-slate-900">
                                Oublié ?
                            </Link>
                        </div>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="••••••••"
                            required
                            disabled={isLoading}
                            // Classe corrigée avec text-slate-900
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
                                Connexion en cours...
                            </>
                        ) : (
                            "Se connecter"
                        )}
                    </Button>

                </form>

                {/* REDIRECTION INSCRIPTION */}
                <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                    <p className="text-sm text-slate-600">
                        Vous n&apos;avez pas encore de compte ?{" "}
                        <Link
                            href="/auth/register"
                            className="font-bold text-slate-900 hover:underline"
                        >
                            S&apos;inscrire
                        </Link>
                    </p>
                </div>

            </div>
        </div>
    );
}