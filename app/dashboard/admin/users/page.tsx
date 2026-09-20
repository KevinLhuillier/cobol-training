import Link from "next/link";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Users, UserCheck, Clock, AlertTriangle, Infinity as InfinityIcon } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { cn } from "@/lib/utils";
import { InviteUserDialog } from "@/components/admin/invite-user-dialog";
import { isLifetimeStatus } from "@/utils/subscription";

const STATUS_FILTERS = [
    { value: "ALL", label: "All" },
    { value: "INVITE_PENDING", label: "Invite pending" },
    { value: "TRIAL", label: "Trial" },
    { value: "ACTIVE", label: "Active" },
    { value: "UNPAID", label: "Unpaid" },
    { value: "LIFETIME", label: "Lifetime" },
    { value: "LIFETIME_EXPIRED", label: "Lifetime expired" },
    { value: "LIFETIME_ADDON", label: "Lifetime + Mainframe" },
    { value: "CANCELED", label: "Canceled" },
    { value: "EXPIRED", label: "Expired" },
] as const;

function getStatusBadge(status: string | null) {
    switch (status) {
        case "ACTIVE":
            return <Badge className="border-none bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Active</Badge>;
        case "TRIAL":
            return <Badge className="border-none bg-amber-100 text-amber-700 hover:bg-amber-100">Trial</Badge>;
        case "UNPAID":
            return <Badge className="border-none bg-red-100 text-red-700 hover:bg-red-100">Unpaid</Badge>;
        case "CANCELED":
            return <Badge className="border-none bg-slate-200 text-slate-600 hover:bg-slate-200">Canceled</Badge>;
        case "EXPIRED":
            return <Badge className="border-none bg-slate-100 text-slate-500 hover:bg-slate-100">Expired</Badge>;
        case "LIFETIME":
            return <Badge className="border-none bg-violet-100 text-violet-700 hover:bg-violet-100">Lifetime</Badge>;
        case "LIFETIME_EXPIRED":
            return <Badge className="border-none bg-violet-50 text-violet-600 hover:bg-violet-50">Lifetime expired</Badge>;
        case "LIFETIME_ADDON":
            return <Badge className="border-none bg-violet-100 text-violet-700 hover:bg-violet-100">Lifetime + Mainframe</Badge>;
        case "INVITE_PENDING":
            return <Badge className="border-none bg-blue-100 text-blue-700 hover:bg-blue-100">Invite pending</Badge>;
        default:
            return <Badge className="border-none bg-slate-100 text-slate-400 hover:bg-slate-100">No subscription</Badge>;
    }
}

export default async function AdminUsersPage({
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

    // 2. FETCH SUPABASE : Récupération de tous les utilisateurs
    const { data: allUsers, error } = await supabase
        .from("users")
        .select("id, name, email, subscription_status, created_at")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Erreur récupération utilisateurs:", error);
    }

    const users = allUsers || [];

    // 2bis. Dernière connexion de chaque utilisateur (pour la colonne "Last login") : on lit tout
    // l'historique trié du plus récent au plus ancien et on ne garde que la première occurrence
    // (= la plus récente) par utilisateur.
    const { data: recentLogins } = await supabase
        .from("login_events")
        .select("user_id, signed_in_at")
        .order("signed_in_at", { ascending: false });

    const lastLoginByUserId = new Map<string, string>();
    for (const event of recentLogins || []) {
        if (!lastLoginByUserId.has(event.user_id)) {
            lastLoginByUserId.set(event.user_id, event.signed_in_at);
        }
    }

    // 3. Statistiques (calculées sur l'ensemble des utilisateurs, indépendamment du filtre actif)
    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.subscription_status === "ACTIVE").length;
    const trialUsers = users.filter(u => u.subscription_status === "TRIAL").length;
    const unpaidUsers = users.filter(u => u.subscription_status === "UNPAID").length;
    const lifetimeUsers = users.filter(u => isLifetimeStatus(u.subscription_status)).length;

    // 4. Filtre par statut (piloté par l'URL : ?status=ACTIVE)
    const resolvedSearchParams = await searchParams;
    const activeStatus = resolvedSearchParams.status?.toUpperCase() || "ALL";
    const filteredUsers = activeStatus === "ALL"
        ? users
        : users.filter(u => u.subscription_status === activeStatus);

    return (
        <div className="font-sans">

            {/* ADMIN HEADER */}
            <header className="mb-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-slate-900 rounded-xl flex items-center justify-center shadow-md">
                        <Users className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                            Users
                        </h1>
                        <p className="text-sm text-slate-500">Students & subscriptions overview</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <InviteUserDialog />
                    <Link
                        href="/dashboard/admin"
                        className="text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors px-4 py-2"
                    >
                        Back to admin
                    </Link>
                </div>
            </header>

            <main className="w-full mx-auto">

                {/* QUICK STATS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
                        <div className="h-12 w-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-600">
                            <Users className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-500">Total Users</p>
                            <p className="text-2xl font-extrabold text-slate-900">{totalUsers}</p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
                        <div className="h-12 w-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                            <UserCheck className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-500">Active</p>
                            <p className="text-2xl font-extrabold text-slate-900">{activeUsers}</p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
                        <div className="h-12 w-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
                            <Clock className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-500">Trial</p>
                            <p className="text-2xl font-extrabold text-slate-900">{trialUsers}</p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
                        <div className="h-12 w-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-600">
                            <AlertTriangle className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-500">Unpaid</p>
                            <p className="text-2xl font-extrabold text-slate-900">{unpaidUsers}</p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
                        <div className="h-12 w-12 bg-violet-50 rounded-2xl flex items-center justify-center text-violet-600">
                            <InfinityIcon className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-500">Lifetime</p>
                            <p className="text-2xl font-extrabold text-slate-900">{lifetimeUsers}</p>
                        </div>
                    </div>
                </div>

                {/* STATUS FILTER */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {STATUS_FILTERS.map((filter) => (
                        <Link
                            key={filter.value}
                            href={filter.value === "ALL" ? "/dashboard/admin/users" : `/dashboard/admin/users?status=${filter.value}`}
                            className={cn(
                                "inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold transition-colors border",
                                activeStatus === filter.value
                                    ? "bg-slate-900 text-white border-slate-900"
                                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                            )}
                        >
                            {filter.label}
                        </Link>
                    ))}
                </div>

                {/* USERS LIST */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-6 border-b border-slate-100">
                        <h2 className="text-lg font-bold text-slate-900">Users List</h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                            <tr className="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-wider">
                                <th className="p-4 font-bold">Name</th>
                                <th className="p-4 font-bold">Email</th>
                                <th className="p-4 font-bold">Status</th>
                                <th className="p-4 font-bold">Last login</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-slate-500">
                                        No users found for this status.
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((u) => {
                                    const lastLogin = lastLoginByUserId.get(u.id);
                                    return (
                                        <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="p-0">
                                                <Link href={`/dashboard/admin/users/${u.id}`} className="block p-4">
                                                    <p className="font-bold text-slate-900">{u.name || "—"}</p>
                                                </Link>
                                            </td>
                                            <td className="p-0">
                                                <Link href={`/dashboard/admin/users/${u.id}`} className="block p-4">
                                                    <p className="text-sm text-slate-600">{u.email}</p>
                                                </Link>
                                            </td>
                                            <td className="p-0">
                                                <Link href={`/dashboard/admin/users/${u.id}`} className="block p-4">
                                                    {getStatusBadge(u.subscription_status)}
                                                </Link>
                                            </td>
                                            <td className="p-0">
                                                <Link href={`/dashboard/admin/users/${u.id}`} className="block p-4">
                                                    <span className="text-sm text-slate-600">
                                                        {lastLogin
                                                            ? new Date(lastLogin).toLocaleDateString("en-US", {
                                                                year: "numeric",
                                                                month: "short",
                                                                day: "numeric",
                                                            })
                                                            : "Never"}
                                                    </span>
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </main>
        </div>
    );
}
