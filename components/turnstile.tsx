"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";

// Clé de site Turnstile (publique par conception). La vérification du token est faite par
// Supabase Auth (Authentication > Attack Protection > Captcha), pas par ce projet : ne surtout
// pas appeler siteverify en plus côté serveur, un token n'est utilisable qu'une seule fois.
const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "0x4AAAAAAE-CThSQP2AIqckJ";

interface TurnstileApi {
    render: (container: HTMLElement, options: Record<string, unknown>) => string;
    reset: (widgetId: string) => void;
    remove: (widgetId: string) => void;
}

declare global {
    interface Window {
        turnstile?: TurnstileApi;
    }
}

interface TurnstileProps {
    /** Identifiant stable de la surface protégée (1-32 caractères : alphanumérique, - ou _). */
    action: string;
    /** Reçoit le token à usage unique, ou null quand il expire / échoue. */
    onToken: (token: string | null) => void;
    /** Incrémenter cette valeur après chaque tentative pour obtenir un nouveau token. */
    resetSignal?: number;
}

export function Turnstile({ action, onToken, resetSignal = 0 }: TurnstileProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetIdRef = useRef<string | null>(null);
    const onTokenRef = useRef(onToken);
    const [scriptReady, setScriptReady] = useState(
        () => typeof window !== "undefined" && Boolean(window.turnstile),
    );

    useEffect(() => {
        onTokenRef.current = onToken;
    }, [onToken]);

    useEffect(() => {
        if (!scriptReady || !containerRef.current || !window.turnstile) return;

        widgetIdRef.current = window.turnstile.render(containerRef.current, {
            sitekey: SITE_KEY,
            action,
            // Widget invisible tant que Cloudflare n'a pas besoin d'une interaction de l'utilisateur.
            appearance: "interaction-only",
            callback: (token: string) => onTokenRef.current(token),
            "expired-callback": () => onTokenRef.current(null),
            "error-callback": () => onTokenRef.current(null),
        });

        return () => {
            if (widgetIdRef.current && window.turnstile) {
                window.turnstile.remove(widgetIdRef.current);
            }
            widgetIdRef.current = null;
        };
    }, [scriptReady, action]);

    useEffect(() => {
        if (resetSignal > 0 && widgetIdRef.current && window.turnstile) {
            window.turnstile.reset(widgetIdRef.current);
        }
    }, [resetSignal]);

    return (
        <>
            <Script
                src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
                strategy="afterInteractive"
                onReady={() => setScriptReady(true)}
            />
            <div ref={containerRef} className="flex justify-center" />
        </>
    );
}
