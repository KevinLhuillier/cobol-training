import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export default async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

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

    const isDashboardRoute = pathname.startsWith('/dashboard');
    const isLoginRoute = pathname.startsWith('/auth/login');

    // Chemins qui doivent rester joignables même en mode maintenance : la page de maintenance
    // elle-même (sinon boucle de redirection), tout /auth (sinon un admin déconnecté ne pourrait
    // plus jamais se reconnecter pour désactiver le mode) et les endpoints API appelés par des
    // services externes (webhook Stripe, cron) qui doivent continuer à fonctionner. Les conditions
    // d'utilisation et la politique de confidentialité (/terms, /privacy) restent aussi consultables :
    // la page de maintenance y renvoie depuis son pied de page.
    const isMaintenanceExempt = pathname === '/maintenance' || pathname === '/terms' || pathname === '/privacy' || pathname.startsWith('/auth') || pathname.startsWith('/api');

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

        // Mode maintenance (cf. /dashboard/admin, bouton géré par app/actions/maintenance.ts) :
        // redirige tout le monde vers /maintenance, sauf les admins déjà connectés — qui doivent
        // pouvoir continuer à naviguer normalement pour repasser le bouton en OFF.
        if (!isMaintenanceExempt) {
            const { data: settings } = await supabase
                .from('app_settings')
                .select('maintenance_mode')
                .eq('id', 1)
                .single();

            if (settings?.maintenance_mode) {
                let isAdmin = false;
                if (user) {
                    const { data: profile } = await supabase
                        .from('users')
                        .select('role')
                        .eq('id', user.id)
                        .single();
                    isAdmin = profile?.role === 'ADMIN';
                }

                if (!isAdmin) {
                    return NextResponse.redirect(new URL('/maintenance', request.url));
                }
            }
        }
    }

    // 6. Tout est en ordre, on laisse passer
    return supabaseResponse;
}

// Le mode maintenance doit pouvoir s'appliquer à toutes les pages (pas seulement au dashboard) :
// le matcher couvre donc tout, sauf les assets statiques Next.js.
export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};