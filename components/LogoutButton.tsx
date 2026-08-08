"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut, Loader2 } from "lucide-react";
// 🟢 Import du client Supabase
import { createClient } from "@/utils/supabase/client";

export default function LogoutButton() {
    const router = useRouter();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    // Initialisation du client Supabase
    const supabase = createClient();

    const handleLogout = async () => {
        setIsLoggingOut(true);

        try {
            // 🟢 Appel natif à Supabase pour détruire la session et le cookie
            const { error } = await supabase.auth.signOut();

            if (error) {
                console.error("Sign out error:", error.message);
                setIsLoggingOut(false);
                return;
            }

            // Redirection vers la page de connexion
            router.push("/auth/login");
            // Force Next.js à recharger l'état du serveur pour protéger les pages
            router.refresh();

        } catch (error) {
            console.error("Network error during sign out:", error);
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
                    <span>Signing out...</span>
                </>
            ) : (
                <>
                    <LogOut className="h-4 w-4" />
                    <span>Sign out</span>
                </>
            )}
        </Button>
    );
}