"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Terminal, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
// 🟢 Import du client Supabase
import { createClient } from "@/utils/supabase/client";

export default function NewTsoUserPage() {
    const router = useRouter();
    const supabase = createClient();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsLoading(true);
            setError("");

            // 🟢 Insertion directe et sécurisée dans Supabase
            const { error: insertError } = await supabase
                .from("tso_users")
                .insert({
                    username: username.trim().toUpperCase(),
                    password: password.trim(),
                    status: "AVAILABLE" // Statut par défaut à la création
                });

            if (insertError) {
                // Gestion spécifique si le TSO existe déjà (violation de contrainte d'unicité PostgreSQL)
                if (insertError.code === '23505') {
                    throw new Error("This TSO username already exists in the database.");
                }
                throw insertError;
            }

            // Rediriger vers la liste et rafraîchir
            router.push("/dashboard/admin/users-tso");
            router.refresh();

        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("An unexpected error occurred");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans p-4 md:p-6 lg:p-8">
            <div className="max-w-2xl mx-auto">

                {/* EN-TÊTE */}
                <div className="mb-8 flex items-center gap-4">
                    {/* 🟢 Lien mis à jour */}
                    <Link
                        href="/dashboard/admin/users-tso"
                        className="h-10 w-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-sm shrink-0"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                            Create TSO Account
                        </h1>
                        <p className="text-sm text-slate-500">
                            Add a new Mainframe credential to your pool.
                        </p>
                    </div>
                </div>

                {/* FORMULAIRE */}
                <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6 md:p-8">
                    <div className="flex items-center gap-2 text-slate-900 font-bold text-lg mb-8">
                        <div className="h-8 w-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
                            <Terminal className="h-4 w-4" />
                        </div>
                        Account Details
                    </div>

                    <form onSubmit={onSubmit} className="space-y-6">

                        {/* Message d'erreur */}
                        {error && (
                            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 font-medium">
                                {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">
                                    TSO Username
                                </label>
                                <input
                                    type="text"
                                    required
                                    disabled={isLoading}
                                    placeholder="e.g. TSOUSER1"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value.toUpperCase())}
                                    className="text-slate-900 w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all uppercase"
                                />
                                <p className="text-xs text-slate-500 mt-1">
                                    Must match the exact Mainframe ID.
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">
                                    Initial Password
                                </label>
                                <input
                                    type="text"
                                    required
                                    disabled={isLoading}
                                    placeholder="Enter password..."
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="text-slate-900 w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all font-mono"
                                />
                            </div>
                        </div>

                        <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                            {/* 🟢 Lien mis à jour */}
                            <Link href="/dashboard/admin/users-tso">
                                <Button type="button" variant="ghost" disabled={isLoading} className="text-slate-500">
                                    Cancel
                                </Button>
                            </Link>
                            <Button
                                type="submit"
                                disabled={isLoading || !username || !password}
                                className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-sm px-6"
                            >
                                {isLoading ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <Save className="h-4 w-4 mr-2" />
                                )}
                                Save Account
                            </Button>
                        </div>
                    </form>
                </div>

            </div>
        </div>
    );
}