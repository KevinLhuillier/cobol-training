"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Terminal, AlertCircle, Loader2 } from "lucide-react";

export default function RegisterPage() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        const formData = new FormData(e.currentTarget);
        const name = formData.get("name") as string;
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;
        const confirmPassword = formData.get("confirmPassword") as string;

        // 1. Vérification côté client
        if (password.length < 8) {
            setError("Le mot de passe doit contenir au moins 8 caractères.");
            setIsLoading(false);
            return;
        }

        if (password !== confirmPassword) {
            setError("Les mots de passe ne correspondent pas.");
            setIsLoading(false);
            return;
        }

        // 2. Appel à l'API
        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ name, email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                // Affiche l'erreur renvoyée par le backend (ex: email déjà utilisé)
                setError(data.error || "Une erreur est survenue lors de l'inscription.");
                setIsLoading(false);
                return;
            }

            // 3. Succès : Redirection vers la page de connexion
            router.push("/auth/login?registered=true");

        } catch (err) {
            console.error("Erreur de requête:", err);
            setError("Impossible de contacter le serveur. Veuillez réessayer.");
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-sans">

            {/* CARTE D'INSCRIPTION */}
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
                        Créez votre compte pour démarrer votre formation.
                    </p>
                </div>

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
                        <Label htmlFor="name" className="text-slate-700 font-semibold">
                            Nom complet
                        </Label>
                        <Input
                            id="name"
                            name="name"
                            type="text"
                            placeholder="Jean Dupont"
                            required
                            disabled={isLoading}
                            className="rounded-xl border-slate-200 bg-slate-50 focus-visible:ring-slate-400 focus-visible:bg-white h-11 disabled:opacity-50"
                        />
                    </div>

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
                            className="rounded-xl border-slate-200 bg-slate-50 focus-visible:ring-slate-400 focus-visible:bg-white h-11 disabled:opacity-50"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password" className="text-slate-700 font-semibold">
                            Mot de passe
                        </Label>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="••••••••"
                            required
                            minLength={8}
                            disabled={isLoading}
                            className="rounded-xl border-slate-200 bg-slate-50 focus-visible:ring-slate-400 focus-visible:bg-white h-11 disabled:opacity-50"
                        />
                        <p className="text-xs text-slate-500 font-medium">8 caractères minimum</p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword" className="text-slate-700 font-semibold">
                            Confirmer le mot de passe
                        </Label>
                        <Input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            placeholder="••••••••"
                            required
                            minLength={8}
                            disabled={isLoading}
                            className="rounded-xl border-slate-200 bg-slate-50 focus-visible:ring-slate-400 focus-visible:bg-white h-11 disabled:opacity-50"
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
                                Création en cours...
                            </>
                        ) : (
                            "Créer mon compte"
                        )}
                    </Button>

                </form>

                {/* REDIRECTION CONNEXION */}
                <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                    <p className="text-sm text-slate-600">
                        Vous avez déjà un compte ?{" "}
                        <Link
                            href="/auth/login"
                            className="font-bold text-slate-900 hover:underline"
                        >
                            Se connecter
                        </Link>
                    </p>
                </div>

            </div>
        </div>
    );
}