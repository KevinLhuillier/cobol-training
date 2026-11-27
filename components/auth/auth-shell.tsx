import Link from "next/link";
import { LogoCtIcon } from "@/components/logo-ct-icon";

// Styles partagés des formulaires /auth/* (design « Soft Structure »).
export const authInputClass =
    "h-11 rounded-lg border-ui-line-strong bg-white text-slate-900 placeholder:text-slate-400 focus-visible:ring-ui-accent/30 focus-visible:border-ui-accent disabled:opacity-50";
export const authLabelClass = "text-[13px] font-semibold text-slate-900";
export const authButtonClass =
    "w-full h-[46px] bg-ui-ink hover:bg-ui-ink-hover text-white rounded-lg text-[15px] font-semibold disabled:opacity-80";

/**
 * Coquille des pages d'authentification : logo au-dessus, carte bordée au centre, lien
 * secondaire (inscription, connexion…) sous la carte.
 */
export function AuthShell({
    title,
    subtitle,
    icon,
    footer,
    children,
}: {
    title: React.ReactNode;
    subtitle?: React.ReactNode;
    icon?: React.ReactNode;
    footer?: React.ReactNode;
    children: React.ReactNode;
}) {
    return (
        <div className="flex-1 flex flex-col items-center justify-center gap-6 px-4 py-12">
            <Link href="/" className="flex flex-col items-center gap-3 text-center text-[26px] font-bold text-slate-900 tracking-tight">
                <LogoCtIcon className="h-16 w-auto" />
                Cobol Training
            </Link>

            <main className="w-full max-w-[420px] bg-white rounded-xl border border-ui-line p-8">
                {icon && (
                    <span className="mb-4 h-11 w-11 rounded-lg bg-ui-accent-soft text-ui-accent flex items-center justify-center">
                        {icon}
                    </span>
                )}
                <h1 className="text-[22px] font-bold text-slate-900 tracking-tight">{title}</h1>
                {subtitle && <p className="mt-1.5 text-sm leading-relaxed text-ui-muted">{subtitle}</p>}
                <div className="mt-6">{children}</div>
            </main>

            {footer && <div className="text-sm text-ui-muted text-center">{footer}</div>}
        </div>
    );
}
