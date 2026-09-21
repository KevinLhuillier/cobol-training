import Link from "next/link";
import { LogoCtIcon } from "@/components/logo-ct-icon";
import { SiteFooter } from "@/components/site-footer";

export const CONTACT_EMAIL = "kevin@cobol-training.com";

export function LegalPage({
                              title,
                              lastUpdated,
                              children,
                          }: {
    title: string;
    lastUpdated: string;
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-slate-100 font-sans flex flex-col">
            <div className="flex-1 px-4 py-8 md:py-12">
                <div className="mx-auto w-full max-w-3xl">
                    <Link href="/" className="mb-6 inline-flex items-center gap-2.5 text-lg font-extrabold text-slate-800 tracking-tight">
                        <LogoCtIcon className="h-8 w-auto shrink-0" />
                        Cobol Training
                    </Link>

                    <article className="rounded-3xl bg-white p-6 shadow-sm sm:p-10">
                        <header className="mb-8 border-b border-slate-100 pb-6">
                            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{title}</h1>
                            <p className="mt-2 text-sm text-slate-500">Last updated: {lastUpdated}</p>
                        </header>

                        <div className="space-y-8 text-[15px] leading-relaxed text-slate-600">{children}</div>
                    </article>
                </div>
            </div>
            <SiteFooter />
        </div>
    );
}

export function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h2>
            {children}
        </section>
    );
}

export function LegalList({ children }: { children: React.ReactNode }) {
    return <ul className="list-disc space-y-1.5 pl-5 marker:text-slate-400">{children}</ul>;
}

export function Strong({ children }: { children: React.ReactNode }) {
    return <strong className="font-semibold text-slate-800">{children}</strong>;
}

export function ContactLink() {
    return (
        <a href={`mailto:${CONTACT_EMAIL}`} className="font-semibold text-slate-900 hover:underline">
            {CONTACT_EMAIL}
        </a>
    );
}

export function InlineLink({ href, children }: { href: string; children: React.ReactNode }) {
    return (
        <Link href={href} className="font-semibold text-slate-900 hover:underline">
            {children}
        </Link>
    );
}
