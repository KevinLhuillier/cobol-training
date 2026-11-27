import Link from "next/link";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft } from "lucide-react";
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
    searchParams: Promise<{ status?: string; q?: string }>;
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
    // 4bis. Recherche texte (?q=…) sur le nom et l'email, combinable avec le filtre de statut.
    const query = (resolvedSearchParams.q ?? "").trim();
    const needle = query.toLowerCase();
    const filteredUsers = users.filter((u) => {
        if (activeStatus !== "ALL" && u.subscription_status !== activeStatus) return false;
        if (!needle) return true;
        return (u.name ?? "").toLowerCase().includes(needle) || (u.email ?? "").toLowerCase().includes(needle);
    });

    const filterHref = (status: string) => {
        const params = new URLSearchParams();
        if (status !== "ALL") params.set("status", status);
        if (query) params.set("q", query);
        const qs = params.toString();
        return qs ? `/dashboard/admin/users?${qs}` : "/dashboard/admin/users";
    };

    const stats = [
        { label: "Total users", value: totalUsers },
        { label: "Active", value: activeUsers },
        { label: "Trial", value: trialUsers },
        { label: "Unpaid", value: unpaidUsers },
        { label: "Lifetime", value: lifetimeUsers },
    ];

    return (
        <div className="font-sans">

            {/* ADMIN HEADER */}
            <header className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <Link href="/dashboard/admin" className="inline-flex items-center gap-1 text-[13px] font-semibold text-ui-accent hover:underline mb-2">
                        <ChevronLeft className="h-4 w-4" />
                        Admin
                    </Link>
                    <h1 className="text-2xl md:text-[26px] font-bold text-slate-900 tracking-tight">Users</h1>
                    <p className="mt-1 text-sm text-ui-muted">Students & subscriptions overview</p>
                </div>
                <div className="flex items-center gap-2">
                    <InviteUserDialog />
                </div>
            </header>

            <main className="w-full mx-auto">

                {/* QUICK STATS */}
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3 mb-6">
                    {stats.map((stat) => (
                        <div key={stat.label} className="bg-white rounded-xl border border-ui-line px-4 py-3.5">
                            <p className="text-xs text-ui-muted">{stat.label}</p>
                            <p className="mt-1 text-[22px] font-bold text-slate-900 tracking-tight">{stat.value}</p>
                        </div>
                    ))}
                </div>

                {/* USERS LIST */}
                <div className="bg-white rounded-xl border border-ui-line overflow-hidden">
                    {/* Recherche + filtres de statut, pilotés par l'URL (?q=…&status=…) */}
                    <div className="p-4 border-b border-ui-line flex flex-col gap-3">
                        <form action="/dashboard/admin/users" method="get" role="search" className="flex gap-2">
                            {activeStatus !== "ALL" && <input type="hidden" name="status" value={activeStatus} />}
                            <label htmlFor="user-search" className="sr-only">Search users</label>
                            <input
                                id="user-search"
                                name="q"
                                type="search"
                                defaultValue={query}
                                placeholder="Search by name or email"
                                className="flex-1 min-w-0 h-10 px-3 rounded-lg border border-ui-line-strong bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-ui-accent/30 focus:border-ui-accent"
                            />
                            <button
                                type="submit"
                                className="h-10 px-4 rounded-lg bg-ui-ink hover:bg-ui-ink-hover text-white text-sm font-semibold transition-colors shrink-0"
                            >
                                Search
                            </button>
                        </form>
                        <nav aria-label="Filter by status" className="flex flex-wrap gap-1.5">
                            {STATUS_FILTERS.map((filter) => (
                                <Link
                                    key={filter.value}
                                    href={filterHref(filter.value)}
                                    aria-current={activeStatus === filter.value ? "page" : undefined}
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
                        {query && (
                            <p className="text-xs text-ui-muted">
                                {filteredUsers.length} result{filteredUsers.length !== 1 ? "s" : ""} for &ldquo;{query}&rdquo; ·{" "}
                                <Link href={activeStatus === "ALL" ? "/dashboard/admin/users" : `/dashboard/admin/users?status=${activeStatus}`} className="font-semibold text-ui-accent hover:underline">
                                    Clear search
                                </Link>
                            </p>
                        )}
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                            <tr className="bg-ui-page/70 text-ui-muted text-xs">
                                <th className="px-4 py-2.5 font-semibold">Name</th>
                                <th className="px-4 py-2.5 font-semibold">Email</th>
                                <th className="px-4 py-2.5 font-semibold">Status</th>
                                <th className="px-4 py-2.5 font-semibold">Last login</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-ui-line">
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-slate-500">
                                        No users match these filters.
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((u) => {
                                    const lastLogin = lastLoginByUserId.get(u.id);
                                    return (
                                        <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="p-0">
                                                <Link href={`/dashboard/admin/users/${u.id}`} className="block px-4 py-3">
                                                    <p className="font-semibold text-slate-900">{u.name || "—"}</p>
                                                </Link>
                                            </td>
                                            <td className="p-0">
                                                <Link href={`/dashboard/admin/users/${u.id}`} className="block px-4 py-3">
                                                    <p className="text-sm text-slate-600">{u.email}</p>
                                                </Link>
                                            </td>
                                            <td className="p-0">
                                                <Link href={`/dashboard/admin/users/${u.id}`} className="block px-4 py-3">
                                                    {getStatusBadge(u.subscription_status)}
                                                </Link>
                                            </td>
                                            <td className="p-0">
                                                <Link href={`/dashboard/admin/users/${u.id}`} className="block px-4 py-3">
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
