import Link from "next/link";
import { redirect } from "next/navigation";
import { ExternalLink, ChevronLeft } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { OfferForm } from "@/components/admin/offer-form";
import type { OfferKind } from "@/utils/offers";

export default async function AdminOfferPage({
    searchParams,
}: {
    searchParams: Promise<{ tab?: string }>;
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

    // 2. FETCH : Paramètres actuels des trois offres (une ligne par type, cf. offer_settings.kind)
    const { data: offerRows } = await supabase
        .from("offer_settings")
        .select("kind, title, price_cents, original_price_cents, features, stripe_price_id, mainframe_months");

    const offerByKind = new Map<OfferKind, NonNullable<typeof offerRows>[number]>((offerRows || []).map((row) => [row.kind as OfferKind, row]));

    const sections: { kind: OfferKind; heading: string; description: string; fallbackTitle: string }[] = [
        {
            kind: "SUBSCRIPTION",
            heading: "Subscription",
            description: "Monthly subscription: all modules, mainframe access and feedback while it stays active.",
            fallbackTitle: "Cobol Training subscription",
        },
        {
            kind: "LIFETIME",
            heading: "Lifetime",
            description: "One-time payment: lifetime access to all modules, plus mainframe access and feedback for a limited period.",
            fallbackTitle: "Cobol Training Lifetime",
        },
        {
            kind: "LIFETIME_ADDON",
            heading: "Mainframe + Feedback (lifetime members)",
            description: "Monthly subscription at a preferential rate. Only shown to lifetime members whose included mainframe period has ended.",
            fallbackTitle: "Mainframe + Feedback",
        },
    ];

    // Une offre à la fois, choisie par onglet (?tab=SUBSCRIPTION | LIFETIME | LIFETIME_ADDON).
    const { tab } = await searchParams;
    const activeSection = sections.find((section) => section.kind === tab?.toUpperCase()) ?? sections[0];
    const tabLabels: Record<OfferKind, string> = {
        SUBSCRIPTION: "Subscription",
        LIFETIME: "Lifetime",
        LIFETIME_ADDON: "Lifetime add-on",
    };

    return (
        <div className="font-sans">
            {/* HEADER */}
            <header className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <Link href="/dashboard/admin" className="inline-flex items-center gap-1 text-[13px] font-semibold text-ui-accent hover:underline mb-2">
                        <ChevronLeft className="h-4 w-4" />
                        Admin
                    </Link>
                    <h1 className="text-2xl md:text-[26px] font-bold text-slate-900 tracking-tight">Offer</h1>
                    <p className="mt-1 text-sm text-ui-muted">Manage what students see on the offers page</p>
                </div>
                <div className="flex items-center gap-2">
                    <Link
                        href="/dashboard/subscribe"
                        target="_blank"
                        className="inline-flex items-center justify-center bg-white border border-ui-line text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-lg h-10 px-4 text-sm font-medium transition-colors"
                    >
                        <ExternalLink className="mr-2 h-4 w-4 text-slate-500" />
                        Preview
                    </Link>
                </div>
            </header>

            <nav aria-label="Offers" className="mb-6 flex gap-1 border-b border-ui-line overflow-x-auto">
                {sections.map(({ kind }) => {
                    const isActive = kind === activeSection.kind;
                    return (
                        <Link
                            key={kind}
                            href={`/dashboard/admin/offer?tab=${kind}`}
                            aria-current={isActive ? "page" : undefined}
                            className={`px-3.5 py-2.5 text-sm whitespace-nowrap transition-colors ${
                                isActive
                                    ? "font-semibold text-slate-900 shadow-[inset_0_-2px_0_var(--color-ui-accent)]"
                                    : "font-medium text-ui-muted hover:text-slate-900"
                            }`}
                        >
                            {tabLabels[kind]}
                        </Link>
                    );
                })}
            </nav>

            <main className="w-full">
                <div className="mb-5">
                    <h2 className="text-base font-semibold text-slate-900">{activeSection.heading}</h2>
                    <p className="mt-1 text-sm text-ui-muted max-w-2xl">{activeSection.description}</p>
                </div>
                {(() => {
                    const offer = offerByKind.get(activeSection.kind);
                    return (
                        <OfferForm
                            key={activeSection.kind}
                            kind={activeSection.kind}
                            initialData={{
                                title: offer?.title ?? activeSection.fallbackTitle,
                                priceCents: offer?.price_cents ?? 0,
                                originalPriceCents: offer?.original_price_cents ?? null,
                                features: offer?.features ?? [],
                                stripePriceId: offer?.stripe_price_id ?? "",
                                mainframeMonths: offer?.mainframe_months ?? null,
                            }}
                        />
                    );
                })()}
            </main>
        </div>
    );
}
