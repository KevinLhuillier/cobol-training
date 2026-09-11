import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export default async function proxy(request: NextRequest) {
    // 1. On initialise la réponse que le proxy va renvoyer
    let supabaseResponse = NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

    // 2. On crée le client Supabase spécial pour le middleware
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    // Cette partie permet à Supabase de rafraîchir les cookies expirés
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
                    supabaseResponse = NextResponse.next({
                        request,
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    // 3. Supabase vérifie la validité du token dans ses propres cookies
    const { data: { user } } = await supabase.auth.getUser();

    const isDashboardRoute = request.nextUrl.pathname.startsWith('/dashboard');
    const isLoginRoute = request.nextUrl.pathname.startsWith('/auth/login');

    // On ne redirige QUE si l'utilisateur essaie de charger la page visuellement (GET)
    // On laisse passer toutes les autres méthodes (POST, PUT, DELETE) utilisées par les Server Actions et API
    if (request.method === 'GET') {

        // Si non connecté et essaie d'accéder au dashboard
        if (isDashboardRoute && !user) {
            return NextResponse.redirect(new URL('/auth/login', request.url));
        }

        // Si déjà connecté et essaie d'accéder au login
        if (isLoginRoute && user) {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }
    }

    // 6. Tout est en ordre, on laisse passer
    return supabaseResponse;
}

// On cible le dashboard ET la page de login pour gérer les deux sens de redirection
export const config = {
    matcher: [
        '/dashboard/:path*',
        '/auth/login'
    ],
};