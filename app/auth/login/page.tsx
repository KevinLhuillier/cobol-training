import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Terminal } from "lucide-react";

export default function LoginPage() {
    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-sans">

            {/* CARTE DE CONNEXION (Panneau flottant) */}
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
                        Bon retour. Connectez-vous pour reprendre votre parcours.
                    </p>
                </div>

                {/* FORMULAIRE */}
                <form className="space-y-5">

                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-slate-700 font-semibold">
                            Adresse e-mail
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="etudiant@exemple.com"
                            required
                            className="text-slate-900 rounded-xl border-slate-200 bg-slate-50 focus-visible:ring-slate-400 focus-visible:bg-white h-11"
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password" className="text-slate-700 font-semibold">
                                Mot de passe
                            </Label>
                            <Link
                                href="/forgot-password"
                                className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
                            >
                                Oublié ?
                            </Link>
                        </div>
                        <Input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            required
                            className="text-slate-900 rounded-xl border-slate-200 bg-slate-50 focus-visible:ring-slate-400 focus-visible:bg-white h-11"
                        />
                    </div>

                    <Button
                        type="submit"
                        className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-md text-base font-semibold mt-2"
                    >
                        Se connecter
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
                            Créer un compte
                        </Link>
                    </p>
                </div>

            </div>
        </div>
    );
}