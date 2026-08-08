import Link from "next/link";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import {
    Terminal,
    Plus,
    Users,
    CheckCircle,
    Server,
    Pencil
} from "lucide-react";
// 🟢 Import du client serveur Supabase
import { createClient } from "@/utils/supabase/server";
import { TsoDeleteButton } from "@/components/tso-delete-button";

export default async function AdminTsoUsersPage() {
    const supabase = await createClient();

    // 1. SÉCURITÉ : Vérification stricte du rôle Admin
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

    // 2. FETCH SUPABASE : Récupération des comptes TSO et de l'email de l'étudiant assigné
    // L'alias `assignedToUser:users` permet de renommer la jointure pour que le code UI reste identique
    const { data: tsoUsers, error } = await supabase
        .from("tso_users")
        .select(`
            id,
            username,
            password,
            status,
            assignedToUser:users (
                email,
                name
            )
        `)
        .order("username", { ascending: true });

    if (error) {
        console.error("Erreur récupération comptes TSO:", error);
    }

    // 3. Calcul des statistiques
    // 3. Calcul des statistiques et formatage pour TypeScript
    const formattedTsoUsers = (tsoUsers || []).map(tso => {
        // Supabase peut renvoyer la jointure sous forme de tableau ou d'objet selon le schéma.
        // On s'assure de récupérer le premier élément si c'est un tableau.
        const user = Array.isArray(tso.assignedToUser)
            ? tso.assignedToUser[0]
            : tso.assignedToUser;

        return {
            ...tso,
            assignedToUser: user as { email: string; name: string | null } | null
        };
    });

    const totalAccounts = formattedTsoUsers.length;
    const availableAccounts = formattedTsoUsers.filter(t => t.status === "AVAILABLE").length;
    const assignedAccounts = formattedTsoUsers.filter(t => t.status === "ASSIGNED").length;

    // Helper pour générer les badges
    const getStatusBadge = (status: string) => {
        switch (status) {
            case "AVAILABLE":
                return <Badge className="border-none bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Available</Badge>;
            case "ASSIGNED":
                return <Badge className="border-none bg-blue-100 text-blue-700 hover:bg-blue-100">Assigned</Badge>;
            case "BLOCKED":
                return <Badge className="border-none bg-red-100 text-red-700 hover:bg-red-100">Blocked</Badge>;
            case "RESET_REQUIRED":
                return <Badge className="border-none bg-amber-100 text-amber-700 hover:bg-amber-100">Needs Reset</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
    };

    return (
        <div className="font-sans">

            {/* ADMIN HEADER */}
            <header className="mb-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-slate-900 rounded-xl flex items-center justify-center shadow-md">
                        <Terminal className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                            TSO Accounts
                        </h1>
                        <p className="text-sm text-slate-500">Mainframe access management</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Link
                        href="/dashboard/admin"
                        className="text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors px-4 py-2"
                    >
                        Back to admin
                    </Link>
                    <Link
                        href="/dashboard/admin/users-tso/new"
                        className="inline-flex items-center justify-center bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-sm h-10 px-5 text-sm font-medium transition-colors"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        New Account
                    </Link>
                </div>
            </header>

            <main className="w-full mx-auto">

                {/* QUICK STATS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
                        <div className="h-12 w-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-600">
                            <Server className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-500">Total Accounts</p>
                            <p className="text-2xl font-extrabold text-slate-900">{totalAccounts}</p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
                        <div className="h-12 w-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                            <CheckCircle className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-500">Available</p>
                            <p className="text-2xl font-extrabold text-slate-900">{availableAccounts}</p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
                        <div className="h-12 w-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                            <Users className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-500">Assigned</p>
                            <p className="text-2xl font-extrabold text-slate-900">{assignedAccounts}</p>
                        </div>
                    </div>
                </div>

                {/* TSO USERS LIST */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-6 border-b border-slate-100">
                        <h2 className="text-lg font-bold text-slate-900">Users List</h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                            <tr className="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-wider">
                                <th className="p-4 font-bold">Username</th>
                                <th className="p-4 font-bold">Password</th>
                                <th className="p-4 font-bold">Status</th>
                                <th className="p-4 font-bold">Assigned to</th>
                                <th className="p-4 font-bold text-right">Actions</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                            {formattedTsoUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-slate-500">
                                        No TSO accounts found. Click &quot;New Account&quot; to create one.
                                    </td>
                                </tr>
                            ) : (
                                formattedTsoUsers.map((tso) => (
                                    <tr key={tso.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <Terminal className="h-4 w-4 text-slate-400" />
                                                <p className="font-bold text-slate-900">{tso.username}</p>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className="font-mono text-sm bg-slate-100 text-slate-600 px-2 py-1 rounded">
                                                {tso.password}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            {getStatusBadge(tso.status)}
                                        </td>
                                        <td className="p-4">
                                            {/* Supabase renvoie les objets liés directement ! */}
                                            {tso.assignedToUser ? (
                                                <p className="text-sm font-medium text-slate-900">{tso.assignedToUser.email}</p>
                                            ) : (
                                                <p className="text-sm text-slate-400 italic">Unassigned</p>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    href={`/dashboard/admin/users-tso/${tso.id}`}
                                                    className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Link>
                                                <TsoDeleteButton id={tso.id} />
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </main>
        </div>
    );
}