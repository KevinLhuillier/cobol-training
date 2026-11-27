import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
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
                host,
                port,
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
                <div className="bg-red-50 border border-red-200 text-red-700 p-8 rounded-xl max-w-lg">
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
        <div className="font-sans">
            <div className="max-w-2xl mx-auto">

                {/* EN-TÊTE */}
                <div className="mb-8 flex items-center gap-4">
                    <div>
<Link href="/dashboard/admin/users-tso" className="inline-flex items-center gap-1 text-[13px] font-semibold text-ui-accent hover:underline mb-2"><ChevronLeft className="h-4 w-4" />TSO accounts</Link>
                        <h1 className="text-2xl md:text-[26px] font-bold text-slate-900 tracking-tight">
                            Edit {tsoUser.username}
                        </h1>
                        <p className="mt-1 text-sm text-ui-muted">
                            Update credentials and assignments.
                        </p>
                    </div>
                </div>

                {/* CONTENEUR DU FORMULAIRE */}
                <div className="bg-white rounded-xl border border-ui-line p-6 md:p-8">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2 text-slate-900 font-semibold text-base">
                            Account Details
                        </div>
                        <span className="px-2 py-0.5 bg-ui-page border border-ui-line text-slate-700 font-mono text-[13px] rounded-md font-semibold">
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