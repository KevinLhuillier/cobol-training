import Link from "next/link";
import { redirect } from "next/navigation";
import { BookOpen, Users, Terminal, Tag, Settings, ChevronRight, MessageCircle, Dumbbell } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { getMaintenanceMode } from "@/app/actions/maintenance";
import { MaintenanceModeToggle } from "@/components/admin/maintenance-mode-toggle";

const TILES = [
    {
        href: "/dashboard/admin/courses",
        icon: BookOpen,
        label: "Courses",
        description: "Manage courses and projects, chapters and lessons",
        color: "bg-blue-50 text-blue-600",
    },
    {
        href: "/dashboard/admin/users",
        icon: Users,
        label: "Users",
        description: "Students, subscriptions and access",
        color: "bg-emerald-50 text-emerald-600",
    },
    {
        href: "/dashboard/admin/users-tso",
        icon: Terminal,
        label: "TSO Accounts",
        description: "Mainframe accounts pool",
        color: "bg-purple-50 text-purple-600",
    },
    {
        href: "/dashboard/admin/offer",
        icon: Tag,
        label: "Offer",
        description: "Title, price and features of the subscription",
        color: "bg-amber-50 text-amber-600",
    },
    {
        href: "/dashboard/admin/messages",
        icon: MessageCircle,
        label: "Messages",
        description: "Student conversations",
        color: "bg-slate-100 text-slate-600",
    },
    {
        href: "/dashboard/review",
        icon: Dumbbell,
        label: "Exercises",
        description: "Pending reviews",
        color: "bg-orange-50 text-orange-600",
    },
];

export default async function AdminHomePage() {
    const supabase = await createClient();

    // SÉCURITÉ : Vérification stricte du rôle Admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return redirect("/auth/login");

    const { data: profile } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();

    if (!profile || profile.role !== "ADMIN") {
        return redirect("/dashboard"); // Renvoie les étudiants normaux vers leur dashboard
    }

    // Chiffres clés : comptages seuls (head: true), lancés en parallèle avec l'état de maintenance.
    const [maintenanceMode, studentsRes, activeRes, pendingRes, freeTsoRes] = await Promise.all([
        getMaintenanceMode(),
        supabase.from("users").select("id", { count: "exact", head: true }).neq("role", "ADMIN"),
        supabase
            .from("users")
            .select("id", { count: "exact", head: true })
            .in("subscription_status", ["ACTIVE", "LIFETIME", "LIFETIME_ADDON"]),
        supabase
            .from("lesson_progress")
            .select("id", { count: "exact", head: true })
            .eq("exercise_status", "PENDING_REVIEW"),
        supabase.from("tso_users").select("id", { count: "exact", head: true }).eq("status", "AVAILABLE"),
    ]);

    const stats = [
        { label: "Students", value: studentsRes.count ?? 0, href: "/dashboard/admin/users" },
        { label: "Active subscriptions", value: activeRes.count ?? 0, href: "/dashboard/admin/users" },
        { label: "Exercises to review", value: pendingRes.count ?? 0, href: "/dashboard/review", highlight: (pendingRes.count ?? 0) > 0 },
        { label: "Free TSO accounts", value: freeTsoRes.count ?? 0, href: "/dashboard/admin/users-tso", warn: (freeTsoRes.count ?? 0) === 0 },
    ];

    return (
        <div className="font-sans flex flex-col gap-8">
            {/* HEADER */}
            <header className="flex items-center gap-4">
                <div className="h-12 w-12 bg-ui-ink rounded-lg flex items-center justify-center">
                    <Settings className="h-6 w-6 text-white" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                        Administration
                    </h1>
                    <p className="text-sm text-ui-muted">Choose a section to manage</p>
                </div>
            </header>

            {/* KEY NUMBERS */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat) => (
                    <Link
                        key={stat.label}
                        href={stat.href}
                        className="bg-white rounded-xl border border-ui-line px-5 py-4 hover:border-ui-line-strong transition-colors"
                    >
                        <p className="text-[13px] text-ui-muted">{stat.label}</p>
                        <p
                            className={`mt-1.5 text-[26px] font-bold tracking-tight ${
                                stat.highlight ? "text-amber-700" : stat.warn ? "text-red-700" : "text-slate-900"
                            }`}
                        >
                            {stat.value}
                        </p>
                    </Link>
                ))}
            </div>

            {/* TILES */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {TILES.map((tile) => {
                    const TileIcon = tile.icon;
                    return (
                        <Link
                            key={tile.href}
                            href={tile.href}
                            className="group bg-white rounded-xl border border-ui-line p-5 flex items-center gap-4 hover:border-ui-line-strong transition-colors"
                        >
                            <div className={`h-12 w-12 shrink-0 rounded-lg flex items-center justify-center ${tile.color}`}>
                                <TileIcon className="h-6 w-6" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-base font-semibold text-slate-900">{tile.label}</p>
                                <p className="text-sm text-slate-500">{tile.description}</p>
                            </div>
                            <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-slate-500 transition-colors shrink-0" />
                        </Link>
                    );
                })}
            </div>

            <MaintenanceModeToggle initialEnabled={maintenanceMode} />
        </div>
    );
}
