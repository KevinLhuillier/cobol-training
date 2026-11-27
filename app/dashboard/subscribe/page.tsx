import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, CheckCircle2, Tag } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { CheckoutButton } from "@/components/checkout-button";
import {
    DEFAULT_SUBSCRIPTION_OFFER,
    formatOfferPrice,
    getAddonRenewalPrice,
    getPurchasableOffers,
    type OfferKind,
    type OfferRow,
} from "@/utils/offers";
import { getEffectiveStatus } from "@/utils/subscription";

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
    const addonRenewalPrice = getAddonRenewalPrice(addonOffer);

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

    // Libellés du design « Soft Structure » : petite ligne au-dessus du titre, accent violet pour l'offre à vie.
    const EYEBROW: Record<string, string> = {
        SUBSCRIPTION: "Monthly",
        LIFETIME: "Lifetime",
        LIFETIME_ADDON: "Special rate for lifetime members",
    };

    return (
        <div className={`${visibleKinds.length > 1 ? "max-w-4xl" : "max-w-xl"} mx-auto font-sans flex flex-col gap-8`}>
            <div>
                <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-ui-accent hover:underline mb-4"
                >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Back to dashboard
                </Link>
                <h1 className="text-2xl md:text-[26px] font-bold text-slate-900 tracking-tight">Choose your plan</h1>
                <p className="mt-1 text-sm text-ui-muted">Unlock every module, the mainframe and personal feedback.</p>
            </div>

            {visibleKinds.length === 0 ? (
                <div className="bg-white rounded-xl border border-ui-line p-8">
                    <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-emerald-50 text-emerald-800 text-sm font-semibold justify-center">
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
                        <p className="mt-4 text-sm text-ui-muted text-center">
                            Mainframe access and personalized feedback are included until {mainframeEndsOn}.
                        </p>
                    )}
                </div>
            ) : (
                <>
                {status === "ACTIVE" && (
                    <div className="px-4 py-3 rounded-lg bg-emerald-50 text-emerald-900 text-sm">
                        <span className="font-semibold">You&apos;re currently subscribed.</span>{" "}
                        If you buy the lifetime offer, your monthly subscription will stop at the end of your current billing period
                        and you won&apos;t be charged for it again.
                    </div>
                )}
                <div className={`grid gap-5 items-stretch ${visibleKinds.length > 1 ? "md:grid-cols-2" : ""}`}>
                    {visibleKinds.map((kind) => {
                        const offer = offersByKind.get(kind);
                        const isSubscription = kind === "SUBSCRIPTION";
                        const isLifetimeFamily = kind === "LIFETIME" || kind === "LIFETIME_ADDON";
                        const title = offer?.title || (isSubscription ? DEFAULT_SUBSCRIPTION_OFFER.title : "");
                        const priceCents = offer?.price_cents ?? DEFAULT_SUBSCRIPTION_OFFER.priceCents;
                        const features = offer?.features?.length ? offer.features : isSubscription ? DEFAULT_SUBSCRIPTION_OFFER.features : [];
                        // Le prix barré n'a de sens que s'il est supérieur au prix affiché.
                        const originalPriceCents = offer?.original_price_cents;
                        const originalPrice =
                            originalPriceCents != null && originalPriceCents > priceCents ? formatOfferPrice(originalPriceCents) : null;
                        const showPromo = isPromoValid && isSubscription;
                        const checkColor = isLifetimeFamily ? "text-violet-600" : "text-emerald-600";

                        return (
                            <div
                                key={kind}
                                className={`relative bg-white rounded-xl p-7 flex flex-col gap-5 ${
                                    kind === "LIFETIME" ? "border-[1.5px] border-violet-600" : "border border-ui-line"
                                }`}
                            >
                                {kind === "LIFETIME" && (
                                    <span className="absolute -top-3 left-6 bg-violet-600 text-white px-2.5 py-1 rounded-md text-xs font-semibold">
                                        One-time payment
                                    </span>
                                )}
                                <div>
                                    <p className={`text-xs font-semibold uppercase tracking-wider ${isLifetimeFamily ? "text-violet-700" : "text-ui-muted"}`}>
                                        {EYEBROW[kind]}
                                    </p>
                                    <h2 className="mt-2 text-xl font-bold text-slate-900">{title}</h2>
                                </div>

                                <p className="flex items-baseline gap-2">
                                    {originalPrice && (
                                        <span className="text-lg font-semibold text-slate-400 line-through">
                                            <span className="sr-only">Original price: </span>€{originalPrice}
                                        </span>
                                    )}
                                    <span className="text-[40px] leading-none font-bold text-slate-900 tracking-tight">€{formatOfferPrice(priceCents)}</span>
                                    <span className="text-sm text-ui-muted">{kind === "LIFETIME" ? "one-time" : "/ month"}</span>
                                </p>

                                <ul className="space-y-3">
                                    {kind === "LIFETIME" && offer?.mainframe_months && (
                                        <li className="flex items-start gap-2.5">
                                            <CheckCircle2 className={`h-4 w-4 shrink-0 mt-0.5 ${checkColor}`} />
                                            <span className="text-sm font-semibold text-slate-900">
                                                {offer.mainframe_months} month{offer.mainframe_months > 1 ? "s" : ""}{" "}
                                                of Mainframe access &amp; feedback on exercises
                                                {addonRenewalPrice && (
                                                    <span className="font-normal text-ui-muted">
                                                        {" "}(then preferential rate of €{addonRenewalPrice}/month on renewal)
                                                    </span>
                                                )}
                                            </span>
                                        </li>
                                    )}
                                    {features.map((feature: string) => (
                                        <li key={feature} className="flex items-start gap-2.5">
                                            <CheckCircle2 className={`h-4 w-4 shrink-0 mt-0.5 ${checkColor}`} />
                                            <span className="text-sm text-slate-700">{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <div className="mt-auto pt-1">
                                    {showPromo && (
                                        <div className="flex items-center gap-2 px-3 py-2.5 mb-3 rounded-lg bg-emerald-50 text-emerald-800 text-sm font-semibold justify-center">
                                            <Tag className="h-4 w-4 shrink-0" />
                                            20% discount applied at checkout
                                        </div>
                                    )}

                                    <CheckoutButton
                                        className={`w-full justify-center h-[46px] text-[15px] font-semibold ${
                                            isLifetimeFamily ? "bg-violet-600 hover:bg-violet-700" : ""
                                        }`}
                                        offerKind={kind}
                                        promoCode={showPromo ? promoCode : undefined}
                                    >
                                        {kind === "SUBSCRIPTION" ? "Subscribe" : kind === "LIFETIME" ? "Get lifetime access" : "Add Mainframe + Feedback"}
                                    </CheckoutButton>
                                </div>
                            </div>
                        );
                    })}
                </div>
                <p className="text-center text-[13px] text-ui-muted">
                    Secure payment with Stripe. Cancel your subscription anytime from Settings.
                </p>
                </>
            )}
        </div>
    );
}
