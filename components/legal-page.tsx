import { Children, isValidElement, type ReactElement, type ReactNode } from "react";
import Link from "next/link";
import { LogoCtIcon } from "@/components/logo-ct-icon";
import { SiteFooter } from "@/components/site-footer";
import { LegalToc, type LegalTocItem } from "@/components/legal-toc";
import { createClient } from "@/utils/supabase/server";

export const CONTACT_EMAIL = "kevin@cobol-training.com";

type SectionProps = { title: string; children: ReactNode };

/** « 3. Free Trial, Subscriptions » -> « free-trial-subscriptions » */
function slugify(title: string) {
    return title
        .replace(/^\d+\.\s*/, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
}

export async function LegalPage({
    title,
    lastUpdated,
    children,
}: {
    title: string;
    lastUpdated: string;
    children: ReactNode;
}) {
    // Le sommaire est construit à partir des <LegalSection> passées en enfants.
    const toc: LegalTocItem[] = Children.toArray(children)
        .filter((child): child is ReactElement<SectionProps> => isValidElement(child) && child.type === LegalSection)
        .map((child) => ({
            id: slugify(child.props.title),
            label: child.props.title.replace(/^\d+\.\s*/, ""),
        }));

    // Comme sur la landing : un visiteur connecté voit « Dashboard » au lieu de « Login ».
    // La page reste consultable même si Supabase est indisponible.
    let isLoggedIn = false;
    try {
        const supabase = await createClient();
        const { data } = await supabase.auth.getUser();
        isLoggedIn = !!data.user;
    } catch {
        isLoggedIn = false;
    }

    return (
        <div className="min-h-screen bg-white font-sans text-slate-900 flex flex-col">
            <header className="border-b border-ui-line">
                <div className="mx-auto flex h-16 max-w-[1120px] items-center justify-between px-6">
                    <Link href="/" className="flex items-center gap-2.5 text-base font-bold text-slate-900">
                        <LogoCtIcon className="h-8 w-auto shrink-0" />
                        Cobol Training
                    </Link>
                    <Link
                        href={isLoggedIn ? "/dashboard" : "/auth/login"}
                        className="inline-flex h-[38px] items-center rounded-lg border border-ui-line-strong px-3.5 text-sm font-semibold text-slate-900 transition-colors hover:bg-ui-page"
                    >
                        {isLoggedIn ? "Dashboard" : "Login"}
                    </Link>
                </div>
            </header>

            <div className="mx-auto flex w-full max-w-[1120px] flex-1 flex-col gap-12 px-6 pb-20 pt-12 lg:flex-row lg:items-start">
                {toc.length > 0 && (
                    <aside className="hidden lg:block lg:w-[240px] lg:shrink-0 lg:sticky lg:top-8">
                        <LegalToc items={toc} />
                    </aside>
                )}

                <article className="min-w-0 max-w-[720px] flex-1">
                    <p className="text-[13px] text-ui-muted">Last updated {lastUpdated}</p>
                    <h1 className="mb-8 mt-2 text-4xl font-bold tracking-[-0.025em] text-slate-900">{title}</h1>

                    <div className="space-y-8 text-base leading-[1.7] text-slate-700">{children}</div>
                </article>
            </div>

            <SiteFooter className="border-t border-ui-line" />
        </div>
    );
}

export function LegalSection({ title, children }: SectionProps) {
    return (
        <section id={slugify(title)} className="scroll-mt-8 space-y-3">
            <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
            {children}
        </section>
    );
}

export function LegalList({ children }: { children: ReactNode }) {
    return <ul className="list-disc space-y-1.5 pl-5 leading-[1.8] marker:text-slate-400">{children}</ul>;
}

export function Strong({ children }: { children: ReactNode }) {
    return <strong className="font-semibold text-slate-900">{children}</strong>;
}

export function ContactLink() {
    return (
        <a href={`mailto:${CONTACT_EMAIL}`} className="font-semibold text-ui-accent hover:text-[#0f4f88] hover:underline">
            {CONTACT_EMAIL}
        </a>
    );
}

export function InlineLink({ href, children }: { href: string; children: ReactNode }) {
    return (
        <Link href={href} className="font-semibold text-ui-accent hover:text-[#0f4f88] hover:underline">
            {children}
        </Link>
    );
}
