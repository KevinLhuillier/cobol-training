import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SubscribeButtonProps {
    className?: string;
    children?: React.ReactNode;
}

/**
 * Redirige vers la page de présentation de l'offre (/dashboard/subscribe), qui contient le
 * vrai bouton de paiement (CheckoutButton). Utilisé partout où un CTA "Upgrade" apparaît :
 * menu (SubscriptionStatus), cours réservés et cartouche TSO du dashboard.
 */
export function SubscribeButton({ className, children }: SubscribeButtonProps) {
    return (
        <Link href="/dashboard/subscribe" className="block">
            <Button
                className={cn("bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-sm h-11 px-5 cursor-pointer", className)}
            >
                <Sparkles className="mr-2 h-4 w-4" />
                {children || "Upgrade"}
            </Button>
        </Link>
    );
}
