import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

// L'utilisation de "export default" règle le problème de détection de la fonction
export default async function proxy(request: NextRequest) {
    // 1. On cherche le cookie contenant notre JWT
    const token = request.cookies.get("session_token")?.value;

    // 2. S'il n'y a pas de token, on redirige immédiatement vers la connexion
    if (!token) {
        return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    try {
        // 3. On prépare notre clé secrète depuis le .env
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);

        // 4. On tente de décoder et vérifier la validité du token
        await jwtVerify(token, secret);

        // 5. Si la vérification réussit, on laisse passer la requête
        return NextResponse.next();

    } catch (error) {
        // 6. Si le token est faux, modifié, ou expiré
        console.error("Proxy : Token invalide ou expiré.");

        // On redirige vers la connexion ET on supprime le cookie corrompu
        const response = NextResponse.redirect(new URL('/auth/login', request.url));
        response.cookies.delete("session_token");

        return response;
    }
}

// Cibler uniquement la ou les routes qui doivent être protégées
export const config = {
    matcher: '/dashboard/:path*',
};