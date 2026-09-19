import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ChallengeForm } from "@/components/admin/challenge-form";
import { createClient } from "@/utils/supabase/server";

export default async function NewChallengePage() {
    const supabase = await createClient();

    // SÉCURITÉ : vérification stricte du rôle Admin
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

    return (
        <div className="max-w-3xl mx-auto font-sans">
            <div className="mb-8 flex items-center gap-4">
                <Link
                    href="/dashboard/admin/challenges"
                    className="h-10 w-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-sm"
                >
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">New challenge</h1>
                    <p className="text-sm text-slate-500">
                        It is created as a draft. Publish it when you are ready.
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8">
                <ChallengeForm />
            </div>
        </div>
    );
}
