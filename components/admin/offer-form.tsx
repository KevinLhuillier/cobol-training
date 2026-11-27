"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, X, AlertTriangle, Save } from "lucide-react";
import { updateOfferSettings } from "@/app/actions/offer";
import type { OfferKind } from "@/utils/offers";

interface OfferFormProps {
    kind: OfferKind;
    initialData: {
        title: string;
        priceCents: number;
        originalPriceCents: number | null;
        features: string[];
        stripePriceId: string;
        mainframeMonths: number | null;
    };
}

export function OfferForm({ kind, initialData }: OfferFormProps) {
    const router = useRouter();
    const isLifetime = kind === "LIFETIME";
    // L'abonnement standard ne peut pas exister sans prix Stripe ; les deux autres offres restent
    // masquées aux étudiants tant que ce champ est vide.
    const isPriceIdOptional = kind !== "SUBSCRIPTION";

    const [title, setTitle] = useState(initialData.title);
    const [price, setPrice] = useState((initialData.priceCents / 100).toFixed(2));
    const [originalPrice, setOriginalPrice] = useState(
        initialData.originalPriceCents !== null ? (initialData.originalPriceCents / 100).toFixed(2) : ""
    );
    const [features, setFeatures] = useState(initialData.features.length > 0 ? initialData.features : [""]);
    const [stripePriceId, setStripePriceId] = useState(initialData.stripePriceId);
    const [mainframeMonths, setMainframeMonths] = useState(String(initialData.mainframeMonths ?? 3));
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const updateFeature = (index: number, value: string) => {
        setFeatures((prev) => prev.map((feature, i) => (i === index ? value : feature)));
    };

    const addFeature = () => {
        setFeatures((prev) => [...prev, ""]);
    };

    const removeFeature = (index: number) => {
        setFeatures((prev) => prev.filter((_, i) => i !== index));
    };

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        const trimmedTitle = title.trim();
        const parsedPrice = parseFloat(price.replace(",", "."));
        const trimmedOriginalPrice = originalPrice.trim();
        const parsedOriginalPrice = trimmedOriginalPrice ? parseFloat(trimmedOriginalPrice.replace(",", ".")) : null;
        const cleanedFeatures = features.map((f) => f.trim()).filter(Boolean);

        if (!trimmedTitle) {
            setError("Please enter a title.");
            return;
        }
        if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
            setError("Please enter a valid price.");
            return;
        }
        if (parsedOriginalPrice !== null) {
            if (!Number.isFinite(parsedOriginalPrice) || parsedOriginalPrice < 0) {
                setError("Please enter a valid original price.");
                return;
            }
            if (Math.round(parsedOriginalPrice * 100) <= Math.round(parsedPrice * 100)) {
                setError("The original price must be higher than the current price.");
                return;
            }
        }
        if (cleanedFeatures.length === 0) {
            setError("Please add at least one feature.");
            return;
        }
        const trimmedPriceId = stripePriceId.trim();
        if (!trimmedPriceId && !isPriceIdOptional) {
            setError("Please enter a Stripe Price ID.");
            return;
        }
        const parsedMonths = isLifetime ? parseInt(mainframeMonths, 10) : null;
        if (isLifetime && (parsedMonths === null || !Number.isInteger(parsedMonths) || parsedMonths < 1)) {
            setError("Please enter a valid number of months (1 or more).");
            return;
        }

        setIsLoading(true);
        try {
            await updateOfferSettings({
                kind,
                mainframeMonths: parsedMonths,
                title: trimmedTitle,
                priceCents: Math.round(parsedPrice * 100),
                originalPriceCents: parsedOriginalPrice !== null ? Math.round(parsedOriginalPrice * 100) : null,
                features: cleanedFeatures,
                stripePriceId: trimmedPriceId,
            });

            setFeatures(cleanedFeatures);
            setSuccess(true);
            router.refresh();
        } catch (err) {
            console.error("Offer settings update error:", err);
            setError(err instanceof Error ? err.message : "Something went wrong.");
        } finally {
            setIsLoading(false);
        }
    };

    // Aperçu en direct de la carte vue par les élèves (cf. /dashboard/subscribe).
    const previewPrice = parseFloat(price.replace(",", "."));
    const previewOriginal = originalPrice.trim() ? parseFloat(originalPrice.replace(",", ".")) : null;
    const formatPreview = (value: number) => (Number.isFinite(value) ? value.toFixed(2).replace(/\.00$/, "") : "—");
    const previewFeatures = features.map((feature) => feature.trim()).filter(Boolean);

    return (
        <div className="flex flex-col xl:flex-row gap-6 items-start">
        <form onSubmit={onSubmit} className="flex-1 min-w-0 w-full bg-white rounded-xl border border-ui-line p-6 md:p-7 space-y-6">
            {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm font-medium border border-red-100">
                    {error}
                </div>
            )}
            {success && !error && (
                <div className="p-4 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium border border-emerald-100">
                    Offer updated successfully.
                </div>
            )}

            {/* TITLE */}
            <div className="space-y-2">
                <label htmlFor={`offer-title-${kind}`} className="text-[13px] font-semibold text-slate-900">
                    Title
                </label>
                <input
                    id={`offer-title-${kind}`}
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={isLoading}
                    className="text-slate-900 w-full h-11 px-4 rounded-lg border border-ui-line-strong bg-white focus:ring-2 focus:ring-ui-accent/30 focus:border-ui-accent transition-all outline-none"
                />
            </div>

            {/* PRICE */}
            <div className="space-y-2">
                <label htmlFor={`offer-price-${kind}`} className="text-[13px] font-semibold text-slate-900">
                    Price (€, excl. VAT{isLifetime ? ", one-time" : ", per month"})
                </label>
                <div className="relative max-w-[200px]">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">€</span>
                    <input
                        id={`offer-price-${kind}`}
                        type="number"
                        min="0"
                        step="0.01"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        disabled={isLoading}
                        className="text-slate-900 w-full h-11 pl-8 pr-4 rounded-lg border border-ui-line-strong bg-white focus:ring-2 focus:ring-ui-accent/30 focus:border-ui-accent transition-all outline-none"
                    />
                </div>
                <p className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg p-3 mt-2">
                    <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                    This is only what students see on the offer page. It must match the amount configured on the Stripe Price below — Stripe is what actually gets charged at checkout.
                </p>
            </div>

            {/* ORIGINAL PRICE (STRUCK THROUGH) */}
            <div className="space-y-2">
                <label htmlFor={`offer-original-price-${kind}`} className="text-[13px] font-semibold text-slate-900">
                    Original price (€, optional)
                </label>
                <div className="relative max-w-[200px]">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">€</span>
                    <input
                        id={`offer-original-price-${kind}`}
                        type="number"
                        min="0"
                        step="0.01"
                        value={originalPrice}
                        onChange={(e) => setOriginalPrice(e.target.value)}
                        disabled={isLoading}
                        placeholder="—"
                        className="text-slate-900 w-full h-11 pl-8 pr-4 rounded-lg border border-ui-line-strong bg-white focus:ring-2 focus:ring-ui-accent/30 focus:border-ui-accent transition-all outline-none"
                    />
                </div>
                <p className="text-xs text-slate-500">
                    If filled in, this price is shown struck through next to the current price on the offer page. It must be higher than the current price. Leave empty to show no struck-through price.
                </p>
            </div>

            {/* MAINFRAME DURATION (LIFETIME ONLY) */}
            {isLifetime && (
                <div className="space-y-2">
                    <label htmlFor={`offer-mainframe-months-${kind}`} className="text-[13px] font-semibold text-slate-900">
                        Mainframe + feedback included (months)
                    </label>
                    <input
                        id={`offer-mainframe-months-${kind}`}
                        type="number"
                        min="1"
                        step="1"
                        value={mainframeMonths}
                        onChange={(e) => setMainframeMonths(e.target.value)}
                        disabled={isLoading}
                        className="text-slate-900 w-full max-w-[200px] h-11 px-4 rounded-lg border border-ui-line-strong bg-white focus:ring-2 focus:ring-ui-accent/30 focus:border-ui-accent transition-all outline-none"
                    />
                    <p className="text-xs text-slate-500">
                        How long Mainframe (TSO) access and personalized feedback last after purchase. Read at purchase time: changing it only affects future buyers. The offer card shows it as &quot;N months of Mainframe access &amp; feedback on exercises&quot;, followed by the monthly price of the Mainframe + Feedback offer below (&quot;then preferential rate of €X/month on renewal&quot;) once that offer has a price and a Stripe Price ID.
                    </p>
                </div>
            )}

            {/* STRIPE PRICE ID */}
            <div className="space-y-2">
                <label htmlFor={`offer-stripe-price-id-${kind}`} className="text-[13px] font-semibold text-slate-900">
                    Stripe Price ID{isPriceIdOptional ? " (optional)" : ""}
                </label>
                <input
                    id={`offer-stripe-price-id-${kind}`}
                    type="text"
                    value={stripePriceId}
                    onChange={(e) => setStripePriceId(e.target.value)}
                    disabled={isLoading}
                    placeholder="price_..."
                    spellCheck={false}
                    className="text-slate-900 w-full h-11 px-4 rounded-lg border border-ui-line-strong bg-white focus:ring-2 focus:ring-ui-accent/30 focus:border-ui-accent transition-all outline-none font-mono text-sm"
                />
                <p className="text-xs text-slate-500">
                    {isLifetime
                        ? "The Price ID of a one-time price from the Stripe Dashboard."
                        : "The Price ID of a recurring (monthly) price from the Stripe Dashboard."}{" "}
                    Create the price in Stripe first, then paste its ID here — it is verified against Stripe when you save.
                    {isPriceIdOptional && " Leave empty to keep this offer hidden from students."}
                </p>
            </div>

            {/* FEATURES */}
            <div className="space-y-2">
                <label className="text-[13px] font-semibold text-slate-900">Features</label>
                <div className="space-y-2">
                    {features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <input
                                type="text"
                                value={feature}
                                onChange={(e) => updateFeature(index, e.target.value)}
                                disabled={isLoading}
                                placeholder="e.g., Access to all modules"
                                className="text-slate-900 w-full h-11 px-4 rounded-lg border border-ui-line-strong bg-white focus:ring-2 focus:ring-ui-accent/30 focus:border-ui-accent transition-all outline-none"
                            />
                            <button
                                type="button"
                                onClick={() => removeFeature(index)}
                                disabled={isLoading || features.length <= 1}
                                title="Remove feature"
                                className="h-11 w-11 shrink-0 flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:hover:text-slate-400 disabled:hover:bg-transparent"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    ))}
                </div>
                <button
                    type="button"
                    onClick={addFeature}
                    disabled={isLoading}
                    className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors mt-1"
                >
                    <Plus className="h-4 w-4" />
                    Add feature
                </button>
            </div>

            <div className="pt-4 flex items-center justify-end border-t border-ui-line">
                <button
                    type="submit"
                    disabled={isLoading}
                    className="px-5 h-10 rounded-lg font-semibold text-sm text-white bg-ui-ink hover:bg-ui-ink-hover transition-colors flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                        <>
                            <Save className="h-4 w-4 mr-2" />
                            Save changes
                        </>
                    )}
                </button>
            </div>
        </form>

        <aside aria-label="Preview" className="w-full xl:w-80 shrink-0 xl:sticky xl:top-6 flex flex-col gap-2.5">
            <p className="text-xs font-semibold uppercase tracking-wider text-ui-muted">Preview</p>
            <div className={`bg-white rounded-xl p-5 ${isLifetime ? "border-[1.5px] border-violet-600" : "border border-ui-line"}`}>
                <p className="text-base font-bold text-slate-900">{title.trim() || "Untitled offer"}</p>
                <p className="mt-3 mb-4 flex items-baseline gap-2">
                    {previewOriginal !== null && Number.isFinite(previewOriginal) && previewOriginal > previewPrice && (
                        <span className="text-sm font-semibold text-slate-400 line-through">€{formatPreview(previewOriginal)}</span>
                    )}
                    <span className="text-3xl font-bold text-slate-900 tracking-tight">€{formatPreview(previewPrice)}</span>
                    <span className="text-[13px] text-ui-muted">{isLifetime ? "one-time" : "/ month"}</span>
                </p>
                <ul className="space-y-1.5 text-[13px] text-slate-700 list-disc pl-4">
                    {isLifetime && mainframeMonths && (
                        <li className="font-semibold text-slate-900">
                            {mainframeMonths} month{Number(mainframeMonths) > 1 ? "s" : ""} of Mainframe access &amp; feedback on exercises
                        </li>
                    )}
                    {previewFeatures.map((feature, index) => (
                        <li key={index}>{feature}</li>
                    ))}
                </ul>
            </div>
            {isPriceIdOptional && !stripePriceId.trim() && (
                <p className="text-xs text-amber-800">Hidden from students until a Stripe Price ID is set.</p>
            )}
        </aside>
        </div>
    );
}
