import { SiteFooter } from "@/components/site-footer";

// Les pages /auth/* remplissent l'espace restant (flex-1) pour garder leur contenu centré
// tout en laissant le pied de page collé en bas de l'écran.
export default function AuthLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
            {children}
            <SiteFooter />
        </div>
    );
}
