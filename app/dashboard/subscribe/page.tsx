import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, CheckCircle2, Sparkles, Tag } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { CheckoutButton } from "@/components/checkout-button";

const DEFAULT_OFFER = {
    title: "Cobol Training subscription",
    priceCents: 1500,
    features: [
        "Access to all modules",
        "Quizzes, exercises, and a final project",
        "Mainframe Access",
        "Personalized feedback on exercises",
        "Support on Teams with the instructor",
    ],
};

export default async function SubscribePage({
    searchParams,
}: {
    searchParams: Promise<{ promo?: string }>;
}) {
    const supabase = await createClient();
    const { promo: promoCode } = await searchParams;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return redirect("/auth/login");

    const [{ data: profile }, { data: offer }] = await Promise.all([
        supabase.from("users").select("subscription_status, trial_discount_code, trial_discount_expires_at").eq("id", user.id).single(),
        supabase.from("offer_settings").select("title, price_cents, original_price_cents, features").eq("id", 1).single(),
    ]);

    const isActive = profile?.subscription_status === "ACTIVE";
    const title = offer?.title || DEFAULT_OFFER.title;
    const priceCents = offer?.price_cents ?? DEFAULT_OFFER.priceCents;
    const features = offer?.features?.length ? offer.features : DEFAULT_OFFER.features;
    const formatPrice = (cents: number) =>
        (cents / 100).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
    const price = formatPrice(priceCents);
    // Le prix barré n'a de sens que s'il est supérieur au prix affiché.
    const originalPriceCents = offer?.original_price_cents;
    const originalPrice = originalPriceCents != null && originalPriceCents > priceCents ? formatPrice(originalPriceCents) : null;

    // On ne fait confiance au code de l'URL que s'il correspond au code -20%/48h qu'on a nous-même
    // généré pour cet utilisateur et qu'il n'est pas expiré — Stripe revalidera de toute façon au
    // checkout, mais ça évite d'afficher un bandeau "remise appliquée" trompeur sur un vieux lien.
    const isPromoValid = !!(
        promoCode &&
        profile?.trial_discount_code === promoCode &&
        profile.trial_discount_expires_at &&
        new Date(profile.trial_discount_expires_at) > new Date()
    );

    return (
        <div className="max-w-xl mx-auto font-sans">
            <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors mb-6"
            >
                <ArrowLeft className="h-4 w-4" />
                Back to dashboard
            </Link>

            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
                <div className="bg-slate-900 p-8 text-center">
                    <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-4">
                        <Sparkles className="h-6 w-6 text-emerald-400" />
                    </div>
                    <h1 className="text-xl font-extrabold text-white">{title}</h1>
                    <div className="mt-4 flex items-end justify-center gap-1">
                        {originalPrice && (
                            <span className="text-xl font-bold text-slate-500 line-through decoration-2 mb-1 mr-2">
                                <span className="sr-only">Original price: </span>€{originalPrice}
                            </span>
                        )}
                        <span className="text-4xl font-extrabold text-white">€{price}</span>
                        <span className="text-sm font-semibold text-slate-400 mb-1"> / month</span>
                    </div>
                </div>

                <div className="p-8">
                    <ul className="space-y-4 mb-8">
                        {features.map((feature: string) => (
                            <li key={feature} className="flex items-start gap-3">
                                <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                                <span className="text-sm font-medium text-slate-700">{feature}</span>
                            </li>
                        ))}
                    </ul>

                    {isPromoValid && !isActive && (
                        <div className="flex items-center gap-2 px-4 py-3 mb-4 rounded-xl bg-emerald-50 text-emerald-700 text-sm font-bold justify-center">
                            <Tag className="h-4 w-4 shrink-0" />
                            20% discount applied at checkout
                        </div>
                    )}

                    {isActive ? (
                        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-50 text-emerald-700 text-sm font-bold justify-center">
                            <CheckCircle2 className="h-4 w-4 shrink-0" />
                            You&apos;re already subscribed
                        </div>
                    ) : (
                        <CheckoutButton className="w-full justify-center h-12 text-base" promoCode={isPromoValid ? promoCode : undefined} />
                    )}
                </div>
            </div>
        </div>
    );
}
