"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Save, Loader2, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
// 🟢 Import du client Supabase
import { createClient } from "@/utils/supabase/client";

export default function NewTsoUserPage() {
    const router = useRouter();
    const supabase = createClient();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [host, setHost] = useState("");
    const [port, setPort] = useState("");
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
                    host: host.trim() || null,
                    port: port.trim() ? parseInt(port.trim(), 10) : null,
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
        <div className="font-sans">
            <div className="max-w-2xl mx-auto">

                {/* EN-TÊTE */}
                <div className="mb-8 flex items-center gap-4">
                    {/* 🟢 Lien mis à jour */}
                    <div>
<Link href="/dashboard/admin/users-tso" className="inline-flex items-center gap-1 text-[13px] font-semibold text-ui-accent hover:underline mb-2"><ChevronLeft className="h-4 w-4" />TSO accounts</Link>
                        <h1 className="text-2xl md:text-[26px] font-bold text-slate-900 tracking-tight">
                            Create TSO Account
                        </h1>
                        <p className="mt-1 text-sm text-ui-muted">
                            Add a new Mainframe credential to your pool.
                        </p>
                    </div>
                </div>

                {/* FORMULAIRE */}
                <div className="bg-white rounded-xl border border-ui-line p-6 md:p-8">
                    <div className="flex items-center gap-2 text-slate-900 font-semibold text-base mb-6">
                        Account Details
                    </div>

                    <form onSubmit={onSubmit} className="space-y-6">

                        {/* Message d'erreur */}
                        {error && (
                            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 font-medium">
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
                                    className="text-slate-900 w-full p-3 rounded-lg border border-ui-line-strong bg-white focus:ring-2 focus:ring-ui-accent/30 focus:border-ui-accent outline-none transition-all uppercase"
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
                                    className="text-slate-900 w-full p-3 rounded-lg border border-ui-line-strong bg-white focus:ring-2 focus:ring-ui-accent/30 focus:border-ui-accent outline-none transition-all font-mono"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-bold text-slate-700 mb-1">
                                        Host
                                    </label>
                                    <input
                                        type="text"
                                        disabled={isLoading}
                                        placeholder="e.g. mainframe.example.com"
                                        value={host}
                                        onChange={(e) => setHost(e.target.value)}
                                        className="text-slate-900 w-full p-3 rounded-lg border border-ui-line-strong bg-white focus:ring-2 focus:ring-ui-accent/30 focus:border-ui-accent outline-none transition-all font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">
                                        Port
                                    </label>
                                    <input
                                        type="number"
                                        disabled={isLoading}
                                        placeholder="e.g. 23"
                                        value={port}
                                        onChange={(e) => setPort(e.target.value)}
                                        className="text-slate-900 w-full p-3 rounded-lg border border-ui-line-strong bg-white focus:ring-2 focus:ring-ui-accent/30 focus:border-ui-accent outline-none transition-all font-mono"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 flex items-center justify-end gap-3 border-t border-ui-line">
                            {/* 🟢 Lien mis à jour */}
                            <Link href="/dashboard/admin/users-tso">
                                <Button type="button" variant="ghost" disabled={isLoading} className="text-slate-500">
                                    Cancel
                                </Button>
                            </Link>
                            <Button
                                type="submit"
                                disabled={isLoading || !username || !password}
                                className="bg-ui-ink hover:bg-ui-ink-hover text-white rounded-lg px-6"
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