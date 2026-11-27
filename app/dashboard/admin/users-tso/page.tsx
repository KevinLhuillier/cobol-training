import Link from "next/link";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Terminal, Plus, Pencil, ChevronLeft } from "lucide-react";
// 🟢 Import du client serveur Supabase
import { createClient } from "@/utils/supabase/server";
import { TsoDeleteButton } from "@/components/tso-delete-button";
import { cn } from "@/lib/utils";

const STATUS_FILTERS = [
    { value: "ALL", label: "All" },
    { value: "AVAILABLE", label: "Available" },
    { value: "ASSIGNED", label: "Assigned" },
    { value: "BLOCKED", label: "Blocked" },
    { value: "RESET_REQUIRED", label: "Needs Reset" },
] as const;

export default async function AdminTsoUsersPage({
    searchParams,
}: {
    searchParams: Promise<{ status?: string }>;
}) {
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
            host,
            port,
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

    // 3bis. Filtre par statut (piloté par l'URL : ?status=AVAILABLE)
    const resolvedSearchParams = await searchParams;
    const activeStatus = resolvedSearchParams.status?.toUpperCase() || "ALL";
    const filteredTsoUsers = activeStatus === "ALL"
        ? formattedTsoUsers
        : formattedTsoUsers.filter(t => t.status === activeStatus);

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
            <header className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <Link href="/dashboard/admin" className="inline-flex items-center gap-1 text-[13px] font-semibold text-ui-accent hover:underline mb-2">
                        <ChevronLeft className="h-4 w-4" />
                        Admin
                    </Link>
                    <h1 className="text-2xl md:text-[26px] font-bold text-slate-900 tracking-tight">TSO Accounts</h1>
                    <p className="mt-1 text-sm text-ui-muted">Mainframe access management</p>
                </div>
                <div className="flex items-center gap-2">
                    <Link
                        href="/dashboard/admin/users-tso/new"
                        className="inline-flex items-center justify-center bg-ui-ink hover:bg-ui-ink-hover text-white rounded-lg h-10 px-5 text-sm font-medium transition-colors"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        New Account
                    </Link>
                </div>
            </header>

            <main className="w-full mx-auto">

                {/* QUICK STATS */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white rounded-xl border border-ui-line px-5 py-4"><p className="text-[13px] text-ui-muted">Total Accounts</p><p className="mt-1 text-2xl font-bold text-slate-900 tracking-tight">{totalAccounts}</p></div>
                    <div className="bg-white rounded-xl border border-ui-line px-5 py-4"><p className="text-[13px] text-ui-muted">Available</p><p className="mt-1 text-2xl font-bold text-slate-900 tracking-tight">{availableAccounts}</p></div>
                    <div className="bg-white rounded-xl border border-ui-line px-5 py-4"><p className="text-[13px] text-ui-muted">Assigned</p><p className="mt-1 text-2xl font-bold text-slate-900 tracking-tight">{assignedAccounts}</p></div>
                </div>

                {/* TSO USERS LIST */}
                <div className="bg-white rounded-xl border border-ui-line overflow-hidden">
                    <nav aria-label="Filter by status" className="p-4 border-b border-ui-line flex flex-wrap gap-1.5">
                    {STATUS_FILTERS.map((filter) => (
                        <Link
                            key={filter.value}
                            href={filter.value === "ALL" ? "/dashboard/admin/users-tso" : `/dashboard/admin/users-tso?status=${filter.value}`}
                            className={cn(
                                "inline-flex items-center h-8 px-3 rounded-md text-[13px] transition-colors border",
                                activeStatus === filter.value
                                    ? "bg-ui-ink text-white border-ui-ink font-semibold"
                                    : "bg-white text-slate-600 border-ui-line font-medium hover:bg-ui-page"
                            )}
                        >
                            {filter.label}
                        </Link>
                    ))}
                    </nav>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                            <tr className="bg-ui-page/70 text-ui-muted text-xs">
                                <th className="px-4 py-2.5 font-semibold">Username</th>
                                <th className="px-4 py-2.5 font-semibold">Password</th>
                                <th className="px-4 py-2.5 font-semibold">Host</th>
                                <th className="px-4 py-2.5 font-semibold">Status</th>
                                <th className="px-4 py-2.5 font-semibold">Assigned to</th>
                                <th className="px-4 py-2.5 font-semibold text-right">Actions</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-ui-line">
                            {filteredTsoUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-slate-500">
                                        {formattedTsoUsers.length === 0
                                            ? <>No TSO accounts found. Click &quot;New Account&quot; to create one.</>
                                            : "No TSO accounts found for this status."}
                                    </td>
                                </tr>
                            ) : (
                                filteredTsoUsers.map((tso) => (
                                    <tr key={tso.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <Terminal className="h-4 w-4 text-slate-400" />
                                                <p className="font-mono text-sm font-semibold text-slate-900">{tso.username}</p>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="font-mono text-[13px] text-slate-600">
                                                {tso.password}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            {tso.host ? (
                                                <span className="font-mono text-sm text-slate-600">
                                                    {tso.host}{tso.port ? `:${tso.port}` : ""}
                                                </span>
                                            ) : (
                                                <span className="text-sm text-slate-400 italic">Not set</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            {getStatusBadge(tso.status)}
                                        </td>
                                        <td className="px-4 py-3">
                                            {/* Supabase renvoie les objets liés directement ! */}
                                            {tso.assignedToUser ? (
                                                <p className="text-sm font-medium text-slate-900">{tso.assignedToUser.email}</p>
                                            ) : (
                                                <p className="text-sm text-slate-400 italic">Unassigned</p>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    href={`/dashboard/admin/users-tso/${tso.id}`}
                                                    className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-md text-[13px] font-semibold text-ui-accent hover:bg-ui-accent-soft transition-colors"
                                                    title="Edit"
                                                >
                                                    <Pencil className="h-3.5 w-3.5" />
                                                    Edit
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