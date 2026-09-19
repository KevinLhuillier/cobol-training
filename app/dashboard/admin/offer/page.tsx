import Link from "next/link";
import { redirect } from "next/navigation";
import { Tag, ExternalLink } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { OfferForm } from "@/components/admin/offer-form";

export default async function AdminOfferPage() {
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

    // 2. FETCH : Paramètres actuels de l'offre (ligne unique, id = 1)
    const { data: offer } = await supabase
        .from("offer_settings")
        .select("title, price_cents, original_price_cents, features, stripe_price_id")
        .eq("id", 1)
        .single();

    return (
        <div className="font-sans">
            {/* HEADER */}
            <header className="mb-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-slate-900 rounded-xl flex items-center justify-center shadow-md">
                        <Tag className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                            Offer
                        </h1>
                        <p className="text-sm text-slate-500">Manage what students see on the subscription page</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Link
                        href="/dashboard/subscribe"
                        target="_blank"
                        className="inline-flex items-center justify-center bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-xl shadow-sm h-10 px-4 text-sm font-medium transition-colors"
                    >
                        <ExternalLink className="mr-2 h-4 w-4 text-slate-500" />
                        Preview
                    </Link>
                    <Link
                        href="/dashboard/admin"
                        className="text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors px-4 py-2"
                    >
                        Back to admin
                    </Link>
                </div>
            </header>

            <main className="w-full max-w-2xl mx-auto">
                <OfferForm
                    initialData={{
                        title: offer?.title ?? "Cobol Training subscription",
                        priceCents: offer?.price_cents ?? 1500,
                        originalPriceCents: offer?.original_price_cents ?? null,
                        features: offer?.features ?? [],
                        stripePriceId: offer?.stripe_price_id ?? "",
                    }}
                />
            </main>
        </div>
    );
}
