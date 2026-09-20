"use client";

import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createCheckoutSession } from "@/app/actions/stripe";
import type { OfferKind } from "@/utils/offers";

interface CheckoutButtonProps {
    className?: string;
    children?: React.ReactNode;
    offerKind?: OfferKind;
    promoCode?: string;
}

/**
 * Déclenche réellement la session de paiement Stripe (contrairement à SubscribeButton,
 * qui se contente de rediriger vers la page de présentation de l'offre /dashboard/subscribe).
 */
export function CheckoutButton({ className, children, offerKind = "SUBSCRIPTION", promoCode }: CheckoutButtonProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const onClick = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const { url } = await createCheckoutSession(offerKind, promoCode);
            window.location.href = url;
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong.");
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center gap-2">
            <Button
                onClick={onClick}
                disabled={isLoading}
                className={cn("bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-sm h-11 px-5 cursor-pointer disabled:cursor-not-allowed", className)}
            >
                {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <Sparkles className="mr-2 h-4 w-4" />
                )}
                {children || "Upgrade"}
            </Button>
            {error && <p className="text-xs text-red-500 font-medium text-center max-w-[280px]">{error}</p>}
        </div>
    );
}
