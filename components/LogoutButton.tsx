"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut, Loader2 } from "lucide-react";

export default function LogoutButton() {
    const router = useRouter();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleLogout = async () => {
        setIsLoggingOut(true);

        try {
            const res = await fetch("/api/auth/logout", {
                method: "POST",
            });

            if (res.ok) {
                // Redirection vers la page de connexion après la suppression du cookie
                router.push("/auth/login");
                // Force Next.js à recharger l'état du serveur pour masquer les pages privées
                router.refresh();
            } else {
                console.error("Échec de la déconnexion, l'API a renvoyé une erreur.");
                setIsLoggingOut(false);
            }
        } catch (error) {
            console.error("Erreur réseau lors de la déconnexion :", error);
            setIsLoggingOut(false);
        }
    };

    return (
        <Button
            onClick={handleLogout}
            disabled={isLoggingOut}
            variant="outline"
            className="flex items-center gap-2 text-slate-700 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-colors"
        >
            {isLoggingOut ? (
                <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Déconnexion...</span>
                </>
            ) : (
                <>
                    <LogOut className="h-4 w-4" />
                    <span>Se déconnecter</span>
                </>
            )}
        </Button>
    );
}