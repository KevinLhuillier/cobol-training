import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, CheckCircle2, Sparkles, Tag } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { CheckoutButton } from "@/components/checkout-button";
import { formatOfferPrice, getPurchasableOffers, type OfferKind } from "@/utils/offers";
import { getEffectiveStatus } from "@/utils/subscription";

const DEFAULT_SUBSCRIPTION_OFFER = {
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

interface OfferRow {
    kind: OfferKind;
    title: string;
    price_cents: number;
    original_price_cents: number | null;
    features: string[];
    stripe_price_id: string | null;
    mainframe_months: number | null;
}

export default async function SubscribePage({
    searchParams,
}: {
    searchParams: Promise<{ promo?: string }>;
}) {
    const supabase = await createClient();
    const { promo: promoCode } = await searchParams;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return redirect("/auth/login");

    const [{ data: profile }, { data: offerRows }] = await Promise.all([
        supabase
            .from("users")
            .select("subscription_status, trial_discount_code, trial_discount_expires_at, mainframe_ends_at")
            .eq("id", user.id)
            .single(),
        supabase
            .from("offer_settings")
            .select("kind, title, price_cents, original_price_cents, features, stripe_price_id, mainframe_months"),
    ]);

    const status = getEffectiveStatus({
        subscription_status: profile?.subscription_status ?? null,
        trial_ends_at: null,
        mainframe_ends_at: profile?.mainframe_ends_at ?? null,
    });
    const offersByKind = new Map<OfferKind, OfferRow>(((offerRows as OfferRow[] | null) ?? []).map((row) => [row.kind, row]));

    // Tarif préférentiel rappelé sur la carte de l'offre à vie. Lu directement sur l'offre
    // "Mainframe + Feedback" (source unique : ce que voit l'acheteur ici est exactement ce qu'il
    // paiera plus tard). Omis tant que cette offre n'est pas configurée/achetable.
    const addonOffer = offersByKind.get("LIFETIME_ADDON");
    const addonRenewalPrice =
        addonOffer?.stripe_price_id && addonOffer.price_cents > 0 ? formatOfferPrice(addonOffer.price_cents) : null;

    // Une offre sans prix Stripe (offre à vie / préférentielle pas encore configurées par l'admin)
    // n'est pas encore achetable : on ne l'affiche pas. L'abonnement standard garde son texte par
    // défaut si sa ligne est introuvable, comme avant l'introduction des autres offres.
    const visibleKinds = getPurchasableOffers(status).filter(
        (kind) => kind === "SUBSCRIPTION" || !!offersByKind.get(kind)?.stripe_price_id
    );

    // On ne fait confiance au code de l'URL que s'il correspond au code -20%/48h qu'on a nous-même
    // généré pour cet utilisateur et qu'il n'est pas expiré — Stripe revalidera de toute façon au
    // checkout, mais ça évite d'afficher un bandeau "remise appliquée" trompeur sur un vieux lien.
    const isPromoValid = !!(
        promoCode &&
        profile?.trial_discount_code === promoCode &&
        profile.trial_discount_expires_at &&
        new Date(profile.trial_discount_expires_at) > new Date()
    );

    const mainframeEndsOn = profile?.mainframe_ends_at
        ? new Date(profile.mainframe_ends_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
        : null;

    return (
        <div className={`${visibleKinds.length > 1 ? "max-w-4xl" : "max-w-xl"} mx-auto font-sans`}>
            <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors mb-6"
            >
                <ArrowLeft className="h-4 w-4" />
                Back to dashboard
            </Link>

            {visibleKinds.length === 0 ? (
                <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-8">
                    <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-50 text-emerald-700 text-sm font-bold justify-center">
                        <CheckCircle2 className="h-4 w-4 shrink-0" />
                        {status === "LIFETIME"
                            ? "You have lifetime access"
                            : status === "LIFETIME_ADDON"
                                ? "Your Mainframe + Feedback plan is active"
                                : status === "LIFETIME_EXPIRED"
                                    ? "You have lifetime access to all modules"
                                    : "You're already subscribed"}
                    </div>
                    {status === "LIFETIME" && mainframeEndsOn && (
                        <p className="mt-4 text-sm text-slate-500 text-center">
                            Mainframe access and personalized feedback are included until {mainframeEndsOn}.
                        </p>
                    )}
                </div>
            ) : (
                <>
                {status === "ACTIVE" && (
                    <div className="mb-6 px-4 py-3 rounded-xl bg-emerald-50 text-emerald-800 text-sm font-medium">
                        <span className="font-bold">You&apos;re currently subscribed.</span>{" "}
                        If you buy the lifetime offer, your monthly subscription will stop at the end of your current billing period
                        and you won&apos;t be charged for it again.
                    </div>
                )}
                <div className={`grid gap-6 ${visibleKinds.length > 1 ? "md:grid-cols-2" : ""}`}>
                    {visibleKinds.map((kind) => {
                        const offer = offersByKind.get(kind);
                        const isSubscription = kind === "SUBSCRIPTION";
                        const title = offer?.title || (isSubscription ? DEFAULT_SUBSCRIPTION_OFFER.title : "");
                        const priceCents = offer?.price_cents ?? DEFAULT_SUBSCRIPTION_OFFER.priceCents;
                        const features = offer?.features?.length ? offer.features : isSubscription ? DEFAULT_SUBSCRIPTION_OFFER.features : [];
                        // Le prix barré n'a de sens que s'il est supérieur au prix affiché.
                        const originalPriceCents = offer?.original_price_cents;
                        const originalPrice =
                            originalPriceCents != null && originalPriceCents > priceCents ? formatOfferPrice(originalPriceCents) : null;
                        const showPromo = isPromoValid && isSubscription;

                        return (
                            <div key={kind} className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col">
                                <div className="bg-slate-900 p-8 text-center">
                                    <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-4">
                                        <Sparkles className="h-6 w-6 text-emerald-400" />
                                    </div>
                                    <h2 className="text-xl font-extrabold text-white">{title}</h2>
                                    {kind === "LIFETIME_ADDON" && (
                                        <p className="mt-1 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                                            Special rate for lifetime members
                                        </p>
                                    )}
                                    <div className="mt-4 flex items-end justify-center gap-1">
                                        {originalPrice && (
                                            <span className="text-xl font-bold text-slate-500 line-through decoration-2 mb-1 mr-2">
                                                <span className="sr-only">Original price: </span>€{originalPrice}
                                            </span>
                                        )}
                                        <span className="text-4xl font-extrabold text-white">€{formatOfferPrice(priceCents)}</span>
                                        <span className="text-sm font-semibold text-slate-400 mb-1">
                                            {kind === "LIFETIME" ? " one-time" : " / month"}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-8 flex flex-col flex-1">
                                    <ul className="space-y-4 mb-8">
                                        {kind === "LIFETIME" && offer?.mainframe_months && (
                                            <li className="flex items-start gap-3">
                                                <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                                                <span className="text-sm font-bold text-slate-900">
                                                    {offer.mainframe_months} month{offer.mainframe_months > 1 ? "s" : ""}{" "}
                                                    of Mainframe access &amp; feedback on exercises
                                                    {addonRenewalPrice && (
                                                        <span className="font-medium text-slate-500">
                                                            {" "}(then preferential rate of €{addonRenewalPrice}/month on renewal)
                                                        </span>
                                                    )}
                                                </span>
                                            </li>
                                        )}
                                        {features.map((feature: string) => (
                                            <li key={feature} className="flex items-start gap-3">
                                                <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                                                <span className="text-sm font-medium text-slate-700">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    <div className="mt-auto">
                                        {showPromo && (
                                            <div className="flex items-center gap-2 px-4 py-3 mb-4 rounded-xl bg-emerald-50 text-emerald-700 text-sm font-bold justify-center">
                                                <Tag className="h-4 w-4 shrink-0" />
                                                20% discount applied at checkout
                                            </div>
                                        )}

                                        <CheckoutButton
                                            className="w-full justify-center h-12 text-base"
                                            offerKind={kind}
                                            promoCode={showPromo ? promoCode : undefined}
                                        />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
                </>
            )}
        </div>
    );
}
