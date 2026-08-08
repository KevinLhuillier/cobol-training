import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Terminal } from "lucide-react";
import { TsoEditForm } from "@/components/tso-edit-form";
// 🟢 Import du client serveur Supabase
import { createClient } from "@/utils/supabase/server";

export default async function EditTsoUserPage({
                                                  params
                                              }: {
    params: Promise<{ tsoUserId: string }>
}) {
    const supabase = await createClient();

    // 1. SÉCURITÉ : Vérification du rôle Admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return redirect("/auth/login");

    const { data: profile } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();

    if (!profile || profile.role !== "ADMIN") {
        return redirect("/dashboard");
    }

    // 2. RÉSOLUTION DES PARAMÈTRES
    const resolvedParams = await params;
    const { tsoUserId } = resolvedParams;

    // 3. FETCH SUPABASE : Récupération parallèle du compte TSO et de la liste des utilisateurs
    const [tsoResult, usersResult] = await Promise.all([
        supabase
            .from("tso_users")
            .select(`
                id,
                username,
                password,
                status,
                assignedToUserId:assigned_to_user_id
            `)
            .eq("id", tsoUserId)
            .maybeSingle(),
        supabase
            .from("users")
            .select("id, email, name")
            .order("email", { ascending: true })
    ]);

    // Affichage des erreurs SQL si nécessaire
    if (tsoResult.error) {
        console.error("🔥 ERREUR SUPABASE (TSO Edit Fetch):", tsoResult.error);
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="bg-red-50 border border-red-200 text-red-700 p-8 rounded-2xl max-w-lg">
                    <h1 className="font-bold text-xl mb-4">Erreur SQL Supabase</h1>
                    <p className="font-mono text-sm bg-white p-4 rounded-lg border border-red-100">{tsoResult.error.message}</p>
                </div>
            </div>
        );
    }

    const tsoUser = tsoResult.data;
    const appUsers = usersResult.data || [];

    if (!tsoUser) {
        return notFound();
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans p-4 md:p-6 lg:p-8">
            <div className="max-w-2xl mx-auto">

                {/* EN-TÊTE */}
                <div className="mb-8 flex items-center gap-4">
                    <Link
                        href="/dashboard/admin/users-tso"
                        className="h-10 w-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-sm shrink-0"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                            Edit {tsoUser.username}
                        </h1>
                        <p className="text-sm text-slate-500">
                            Update credentials and assignments.
                        </p>
                    </div>
                </div>

                {/* CONTENEUR DU FORMULAIRE */}
                <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6 md:p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-2 text-slate-900 font-bold text-lg">
                            <div className="h-8 w-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
                                <Terminal className="h-4 w-4" />
                            </div>
                            Account Details
                        </div>
                        <span className="px-3 py-1 bg-slate-100 text-slate-600 font-mono text-sm rounded-lg font-bold">
                            {tsoUser.username}
                        </span>
                    </div>

                    {/* Formulaire Client */}
                    <TsoEditForm
                        initialData={tsoUser}
                        users={appUsers}
                    />
                </div>

            </div>
        </div>
    );
}