import Link from "next/link";
import { redirect } from "next/navigation";
import { BookOpen, Users, Terminal, Tag, Settings, ChevronRight } from "lucide-react";
import { createClient } from "@/utils/supabase/server";

const TILES = [
    {
        href: "/dashboard/admin/courses",
        icon: BookOpen,
        label: "Courses",
        description: "Manage modules, chapters and lessons",
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

    return (
        <div className="font-sans">
            {/* HEADER */}
            <header className="mb-10 flex items-center gap-4">
                <div className="h-12 w-12 bg-slate-900 rounded-xl flex items-center justify-center shadow-md">
                    <Settings className="h-6 w-6 text-white" />
                </div>
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                        Administration
                    </h1>
                    <p className="text-sm text-slate-500">Choose a section to manage</p>
                </div>
            </header>

            {/* TILES */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {TILES.map((tile) => {
                    const TileIcon = tile.icon;
                    return (
                        <Link
                            key={tile.href}
                            href={tile.href}
                            className="group bg-white rounded-3xl shadow-sm border border-slate-100 p-6 flex items-center gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all"
                        >
                            <div className={`h-14 w-14 shrink-0 rounded-2xl flex items-center justify-center ${tile.color}`}>
                                <TileIcon className="h-7 w-7" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-lg font-bold text-slate-900">{tile.label}</p>
                                <p className="text-sm text-slate-500">{tile.description}</p>
                            </div>
                            <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-slate-500 transition-colors shrink-0" />
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
