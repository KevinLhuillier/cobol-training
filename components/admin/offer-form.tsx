"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, X, AlertTriangle, Save } from "lucide-react";
import { updateOfferSettings } from "@/app/actions/offer";

interface OfferFormProps {
    initialData: {
        title: string;
        priceCents: number;
        features: string[];
        stripePriceId: string;
    };
}

export function OfferForm({ initialData }: OfferFormProps) {
    const router = useRouter();

    const [title, setTitle] = useState(initialData.title);
    const [price, setPrice] = useState((initialData.priceCents / 100).toFixed(2));
    const [features, setFeatures] = useState(initialData.features.length > 0 ? initialData.features : [""]);
    const [stripePriceId, setStripePriceId] = useState(initialData.stripePriceId);
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
        const cleanedFeatures = features.map((f) => f.trim()).filter(Boolean);

        if (!trimmedTitle) {
            setError("Please enter a title.");
            return;
        }
        if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
            setError("Please enter a valid price.");
            return;
        }
        if (cleanedFeatures.length === 0) {
            setError("Please add at least one feature.");
            return;
        }
        const trimmedPriceId = stripePriceId.trim();
        if (!trimmedPriceId) {
            setError("Please enter a Stripe Price ID.");
            return;
        }

        setIsLoading(true);
        try {
            await updateOfferSettings({
                title: trimmedTitle,
                priceCents: Math.round(parsedPrice * 100),
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

    return (
        <form onSubmit={onSubmit} className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8 space-y-6">
            {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100">
                    {error}
                </div>
            )}
            {success && !error && (
                <div className="p-4 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-medium border border-emerald-100">
                    Offer updated successfully.
                </div>
            )}

            {/* TITLE */}
            <div className="space-y-2">
                <label htmlFor="offer-title" className="text-sm font-bold text-slate-900">
                    Title
                </label>
                <input
                    id="offer-title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={isLoading}
                    className="text-slate-900 w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all outline-none"
                />
            </div>

            {/* PRICE */}
            <div className="space-y-2">
                <label htmlFor="offer-price" className="text-sm font-bold text-slate-900">
                    Price (€, excl. VAT)
                </label>
                <div className="relative max-w-[200px]">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">€</span>
                    <input
                        id="offer-price"
                        type="number"
                        min="0"
                        step="0.01"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        disabled={isLoading}
                        className="text-slate-900 w-full h-12 pl-8 pr-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all outline-none"
                    />
                </div>
                <p className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-xl p-3 mt-2">
                    <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                    This is only what students see on the offer page. It must match the amount configured on the Stripe Price below — Stripe is what actually gets charged at checkout.
                </p>
            </div>

            {/* STRIPE PRICE ID */}
            <div className="space-y-2">
                <label htmlFor="offer-stripe-price-id" className="text-sm font-bold text-slate-900">
                    Stripe Price ID
                </label>
                <input
                    id="offer-stripe-price-id"
                    type="text"
                    value={stripePriceId}
                    onChange={(e) => setStripePriceId(e.target.value)}
                    disabled={isLoading}
                    placeholder="price_..."
                    spellCheck={false}
                    className="text-slate-900 w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all outline-none font-mono text-sm"
                />
                <p className="text-xs text-slate-500">
                    The Price ID from the Stripe Dashboard used at checkout. Create the new price in Stripe first, then paste its ID here — it is verified against Stripe when you save.
                </p>
            </div>

            {/* FEATURES */}
            <div className="space-y-2">
                <label className="text-sm font-bold text-slate-900">Features</label>
                <div className="space-y-2">
                    {features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <input
                                type="text"
                                value={feature}
                                onChange={(e) => updateFeature(index, e.target.value)}
                                disabled={isLoading}
                                placeholder="e.g., Access to all modules"
                                className="text-slate-900 w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all outline-none"
                            />
                            <button
                                type="button"
                                onClick={() => removeFeature(index)}
                                disabled={isLoading || features.length <= 1}
                                title="Remove feature"
                                className="h-11 w-11 shrink-0 flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-30 disabled:hover:text-slate-400 disabled:hover:bg-transparent"
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

            <div className="pt-4 flex items-center justify-end border-t border-slate-100">
                <button
                    type="submit"
                    disabled={isLoading}
                    className="px-6 h-12 rounded-xl font-bold text-white bg-slate-900 hover:bg-slate-800 transition-colors flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
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
    );
}
