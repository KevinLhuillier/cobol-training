import Link from "next/link";
import { Wrench } from "lucide-react";
import { SiteFooter } from "@/components/site-footer";

export const metadata = {
    title: "Maintenance - Cobol Training",
};

// Page sombre du design « Soft Structure ». Le lien de connexion permet à un admin déconnecté de
// revenir désactiver le mode maintenance (/auth reste accessible, cf. proxy.ts).
export default function MaintenancePage() {
    return (
        <div className="min-h-screen bg-ui-ink font-sans flex flex-col">
            <main className="flex-1 flex flex-col items-center justify-center gap-5 px-4 py-16 text-center">
                <div className="h-14 w-14 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center">
                    <Wrench className="h-6 w-6 text-amber-300" />
                </div>

                <h1 className="text-3xl md:text-[32px] font-bold text-white tracking-tight">
                    We&apos;ll be right back
                </h1>
                <p className="text-base leading-relaxed text-slate-300 max-w-md">
                    Cobol Training is currently undergoing scheduled maintenance. Your progress is safe — please check
                    back in a few minutes.
                </p>

                <Link
                    href="/auth/login"
                    className="mt-2 inline-flex items-center h-11 px-5 rounded-lg border border-white/25 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
                >
                    Admin sign in
                </Link>
            </main>
            <SiteFooter variant="dark" className="bg-transparent border-t border-white/10" />
        </div>
    );
}
