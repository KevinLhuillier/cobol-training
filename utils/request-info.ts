import { headers } from "next/headers";

/**
 * Récupère l'IP et le pays du visiteur à partir des en-têtes de la requête entrante
 * (jamais via un champ de formulaire, donc non falsifiable côté client) :
 * - x-real-ip / x-forwarded-for : posés par le proxy (Vercel ou tout reverse proxy standard).
 * - x-vercel-ip-country : posé par le edge network de Vercel, absent en local.
 */
export async function getClientIpAndCountry() {
    const headersList = await headers();

    const forwardedFor = headersList.get("x-forwarded-for");
    const ip =
        headersList.get("x-real-ip") ||
        (forwardedFor ? forwardedFor.split(",")[0].trim() : null) ||
        null;

    const country = headersList.get("x-vercel-ip-country") || null;

    return { ip, country };
}
