"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Terminal, AlertCircle } from "lucide-react";

export default function RegisterPage() {
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);

        const formData = new FormData(e.currentTarget);
        const password = formData.get("password") as string;
        const confirmPassword = formData.get("confirmPassword") as string;

        // Vérification côté client
        if (password.length < 8) {
            setError("Le mot de passe doit contenir au moins 8 caractères.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Les mots de passe ne correspondent pas.");
            return;
        }

        // Si tout est bon, on peut appeler la Server Action ici
        console.log("Validation réussie, prêt pour l'inscription !");
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
                            className="rounded-xl border-slate-200 bg-slate-50 focus-visible:ring-slate-400 focus-visible:bg-white h-11"
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
                            className="rounded-xl border-slate-200 bg-slate-50 focus-visible:ring-slate-400 focus-visible:bg-white h-11"
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
                            className="rounded-xl border-slate-200 bg-slate-50 focus-visible:ring-slate-400 focus-visible:bg-white h-11"
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
                            className="rounded-xl border-slate-200 bg-slate-50 focus-visible:ring-slate-400 focus-visible:bg-white h-11"
                        />
                    </div>

                    <Button
                        type="submit"
                        className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-md text-base font-semibold mt-4"
                    >
                        Créer mon compte
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