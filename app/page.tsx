import Link from "next/link";
import {
    ArrowRight,
    CheckCircle2,
    CirclePlay,
    MessagesSquare,
    Quote,
    Sparkles,
    Terminal,
} from "lucide-react";
import { LogoCtIcon } from "@/components/logo-ct-icon";
import { SiteFooter } from "@/components/site-footer";
import { Badge } from "@/components/ui/badge";
import { WorkspaceShowcase } from "@/components/workspace-showcase";
import { createClient } from "@/utils/supabase/server";
import {
    DEFAULT_SUBSCRIPTION_OFFER,
    formatOfferPrice,
    getAddonRenewalPrice,
    type OfferKind,
    type OfferRow,
} from "@/utils/offers";

export const metadata = {
    description: "Learn COBOL, JCL, DB2 and CICS step by step, and practice on a real mainframe with personal support from your trainer.",
};

const FEATURES = [
    {
        icon: Terminal,
        title: "With Mainframe Access",
        text: "Practice on a real mainframe, just like in the enterprise world.",
    },
    {
        icon: CirclePlay,
        title: "100% Video Training",
        text: "Learn at your own pace with clear, step-by-step video lessons.",
    },
    {
        icon: MessagesSquare,
        title: "Trainer Support",
        text: "Ask questions anytime, get personalized feedback anytime.",
    },
];

const STEPS: { title: string; detail?: string }[] = [
    { title: "Getting Started", detail: "TSO / ISPF" },
    { title: "Hello World", detail: "Write, compile, run" },
    { title: "COBOL Basics", detail: "Data types, variables, control structures" },
    { title: "JCL Basics" },
    { title: "Files and Libraries", detail: "Datasets, PDS" },
    { title: "COBOL Advanced", detail: "Arrays, strings, copybooks" },
    { title: "DB2 with COBOL", detail: "Embedded SQL" },
    { title: "JCL Advanced" },
    { title: "CICS Programming", detail: "Transaction processing" },
    { title: "Project - Quiz App", detail: "Put everything into practice" },
];

const UPCOMING = ["Working with VSAM", "Managing GDG Files"];

const INCLUDED = [
    "COBOL programming from scratch",
    "DB2 for database operations",
    "CICS for transactional systems",
    "JCL to manage jobs",
    "VSAM, TSO, and ISPF for working on mainframe systems",
];

const TESTIMONIALS = [
    {
        name: "Gabriel S.",
        country: "Romania",
        text: "The course is good especially because you have the possibility to do your exercises in real time on the mainframe. Kevin helped me every time I encountered problems in performing the exercises.",
    },
    {
        name: "Michael T.",
        country: "USA",
        text: "As a developer switching to mainframe, this course gave me exactly what I needed. Highly recommended.",
    },
    {
        name: "Rahul M.",
        country: "India",
        text: "For now the content is excellent! I am waiting for the rest of the modules to be available.",
    },
    {
        name: "Rajesh P.",
        country: "India",
        text: "Very well-structured. Mix of theory and practice makes learning easy.",
    },
    {
        name: "Carlos",
        country: "Spain",
        text: "I would highly recommend this training to anyone looking to start or grow their career in mainframe development.",
    },
    {
        name: "Priya S.",
        country: "India",
        text: "The instructor explained complex concepts like JCL, DB2, and CICS in a clear and practical way.",
    },
];

// Dégradé de l'ancien site : bleu nuit en haut, bleu vif en bas (from/to calés sur 21 % / 98 %).
const brandGradient = "bg-linear-to-b from-brand-deep from-21% to-brand-sky to-98%";

const primaryButton =
    "inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-sm font-bold h-12 px-6 text-base transition-colors";
const lightButton =
    "inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-100 text-slate-900 rounded-xl shadow-sm font-bold h-12 px-6 text-base transition-colors";
const ghostButton =
    "inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/25 rounded-xl font-bold h-12 px-6 text-base transition-colors";

type Tone = "white" | "tint" | "navy";

const bandTones: Record<Tone, string> = {
    white: "bg-white",
    tint: "bg-brand-tint",
    navy: "bg-brand-navy",
};

/** Bande pleine largeur : le fond alterne d'une section à l'autre, le contenu reste centré. */
function Band({ id, tone, children }: { id?: string; tone: Tone; children: React.ReactNode }) {
    return (
        <section id={id} className={`${bandTones[tone]} ${id ? "scroll-mt-16" : ""} py-16 md:py-24`}>
            <div className="max-w-6xl mx-auto px-4">{children}</div>
        </section>
    );
}

/** Vague blanche de l'ancien site, posée en bas (ou en haut, si `flip`) d'une section colorée. */
function WaveDivider({ flip = false }: { flip?: boolean }) {
    return (
        <svg
            aria-hidden="true"
            viewBox="0 0 1280 140"
            preserveAspectRatio="none"
            className={`absolute inset-x-0 h-10 md:h-[75px] w-full text-white ${flip ? "top-0 rotate-180" : "bottom-0"}`}
        >
            <path fill="currentColor" d="M1280 140V0S993.46 140 640 139 0 0 0 0v140z" />
        </svg>
    );
}

function SectionHeading({
    eyebrow,
    title,
    dark = false,
    children,
}: {
    eyebrow: string;
    title: string;
    dark?: boolean;
    children?: React.ReactNode;
}) {
    return (
        <div className="max-w-2xl mx-auto text-center mb-10">
            <p className={`text-xs font-bold uppercase tracking-wider mb-3 ${dark ? "text-blue-300" : "text-blue-700"}`}>{eyebrow}</p>
            <h2 className={`text-3xl md:text-4xl font-extrabold tracking-tight leading-tight ${dark ? "text-white" : "text-slate-900"}`}>
                {title}
            </h2>
            {children && <p className={`mt-4 ${dark ? "text-slate-300" : "text-slate-500"}`}>{children}</p>}
        </div>
    );
}

function IconTile({ icon: Icon }: { icon: React.ComponentType<{ className?: string }> }) {
    return (
        <div className="h-12 w-12 rounded-2xl bg-brand-blue flex items-center justify-center shadow-md shrink-0">
            <Icon className="h-6 w-6 text-white" />
        </div>
    );
}

/** Fenêtre d'éditeur décorative (barre de titre + code). `className` porte le fond et le positionnement. */
function CodeWindow({
    title,
    language,
    className = "",
    lineHeightClassName = "leading-6 sm:leading-7",
    children,
}: {
    title: string;
    language: string;
    className?: string;
    /** Interligne du code : large pour le COBOL, serré pour le JCL (une ligne = une carte, comme sur le vrai système). */
    lineHeightClassName?: string;
    children: React.ReactNode;
}) {
    return (
        <div className={`rounded-3xl ring-1 ring-white/10 shadow-2xl overflow-hidden transition duration-300 ${className}`}>
            <div className="flex items-center gap-2 px-5 py-3 border-b border-white/10">
                <span className="h-3 w-3 rounded-full bg-red-400/80" />
                <span className="h-3 w-3 rounded-full bg-amber-400/80" />
                <span className="h-3 w-3 rounded-full bg-emerald-400/80" />
                <span className="ml-3 text-xs font-semibold text-slate-400">{title}</span>
                <span className="ml-auto rounded-md bg-white/10 px-2 py-0.5 text-[10px] font-bold tracking-wider text-slate-300">
                    {language}
                </span>
            </div>
            <pre className={`overflow-x-auto p-4 sm:p-6 font-mono text-[11px] sm:text-sm text-slate-300 ${lineHeightClassName}`}>
                <code>{children}</code>
            </pre>
        </div>
    );
}

function PricingCard({
    kind,
    title,
    priceCents,
    originalPriceCents,
    features,
    mainframeMonths,
    addonRenewalPrice,
}: {
    kind: OfferKind;
    title: string;
    priceCents: number;
    originalPriceCents: number | null;
    features: string[];
    mainframeMonths: number | null;
    /** Tarif mensuel préférentiel Mainframe + Feedback (offre à vie uniquement), déjà formaté. */
    addonRenewalPrice: string | null;
}) {
    // Le prix barré n'a de sens que s'il est supérieur au prix affiché.
    const originalPrice = originalPriceCents != null && originalPriceCents > priceCents ? formatOfferPrice(originalPriceCents) : null;

    return (
        <div className="bg-white rounded-[2rem] shadow-md border border-slate-200 overflow-hidden flex flex-col">
            <div className="bg-brand-navy p-8 text-center">
                <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="h-6 w-6 text-emerald-400" />
                </div>
                <h3 className="text-xl font-extrabold text-white">{title}</h3>
                <div className="mt-4 flex items-end justify-center gap-1">
                    {originalPrice && (
                        <span className="text-xl font-bold text-slate-500 line-through decoration-2 mb-1 mr-2">
                            <span className="sr-only">Original price: </span>€{originalPrice}
                        </span>
                    )}
                    <span className="text-4xl font-extrabold text-white">€{formatOfferPrice(priceCents)}</span>
                    <span className="text-sm font-semibold text-slate-400 mb-1">{kind === "LIFETIME" ? " one-time" : " / month"}</span>
                </div>
            </div>

            <div className="p-8 flex flex-col flex-1">
                <ul className="space-y-4 mb-8">
                    {kind === "LIFETIME" && mainframeMonths && (
                        <li className="flex items-start gap-3">
                            <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                            <span className="text-sm font-bold text-slate-900">
                                {mainframeMonths} month{mainframeMonths > 1 ? "s" : ""}{" "}
                                of Mainframe access &amp; feedback on exercises
                                {addonRenewalPrice && (
                                    <span className="font-medium text-slate-500">
                                        {" "}(then preferential rate of €{addonRenewalPrice}/month on renewal)
                                    </span>
                                )}
                            </span>
                        </li>
                    )}
                    {features.map((feature) => (
                        <li key={feature} className="flex items-start gap-3">
                            <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                            <span className="text-sm font-medium text-slate-700">{feature}</span>
                        </li>
                    ))}
                </ul>

                <Link href="/auth/register" className={`${primaryButton} w-full mt-auto`}>
                    Start the Training
                </Link>
            </div>
        </div>
    );
}

export default async function HomePage() {
    let isLoggedIn = false;
    let offerRows: OfferRow[] = [];

    // La landing doit s'afficher même si Supabase est indisponible : on retombe alors sur les
    // valeurs par défaut de l'abonnement plutôt que de renvoyer une erreur au visiteur.
    try {
        const supabase = await createClient();
        const [{ data: userData }, { data: offers }] = await Promise.all([
            supabase.auth.getUser(),
            supabase
                .from("offer_settings")
                .select("kind, title, price_cents, original_price_cents, features, stripe_price_id, mainframe_months"),
        ]);
        isLoggedIn = !!userData.user;
        offerRows = (offers as OfferRow[] | null) ?? [];
    } catch (error) {
        console.error("Erreur de chargement de la landing page:", error);
    }

    const subscription = offerRows.find((offer) => offer.kind === "SUBSCRIPTION");
    // L'offre à vie n'est proposée que si l'admin l'a rendue achetable (prix Stripe renseigné),
    // comme sur /dashboard/subscribe.
    const lifetime = offerRows.find((offer) => offer.kind === "LIFETIME" && !!offer.stripe_price_id);
    const addonRenewalPrice = getAddonRenewalPrice(offerRows.find((offer) => offer.kind === "LIFETIME_ADDON"));

    const cards = [
        {
            kind: "SUBSCRIPTION" as const,
            title: subscription?.title || DEFAULT_SUBSCRIPTION_OFFER.title,
            priceCents: subscription?.price_cents ?? DEFAULT_SUBSCRIPTION_OFFER.priceCents,
            originalPriceCents: subscription?.original_price_cents ?? null,
            features: subscription?.features?.length ? subscription.features : DEFAULT_SUBSCRIPTION_OFFER.features,
            mainframeMonths: null,
            addonRenewalPrice: null,
        },
        ...(lifetime
            ? [
                  {
                      kind: "LIFETIME" as const,
                      title: lifetime.title,
                      priceCents: lifetime.price_cents,
                      originalPriceCents: lifetime.original_price_cents,
                      features: lifetime.features ?? [],
                      mainframeMonths: lifetime.mainframe_months,
                      addonRenewalPrice,
                  },
              ]
            : []),
    ];

    return (
        <div className="min-h-screen bg-white font-sans flex flex-col">
            {/* HEADER : même bleu nuit que le haut du dégradé du hero, pour qu'ils se fondent. */}
            <header className="sticky top-0 z-30 border-b border-white/10 bg-brand-deep/95 backdrop-blur">
                <div className="max-w-6xl mx-auto flex items-center justify-between gap-4 px-4 h-16">
                    <Link href="/" className="flex items-center gap-2.5 text-lg font-extrabold text-white tracking-tight">
                        {/* Le logo est sombre : on le pose sur une pastille blanche pour qu'il reste lisible. */}
                        <span className="h-9 w-9 rounded-xl bg-white flex items-center justify-center shrink-0">
                            <LogoCtIcon className="h-6 w-auto" />
                        </span>
                        <span>Cobol Training</span>
                    </Link>

                    <nav className="hidden md:flex items-center gap-7 text-sm font-semibold text-slate-300">
                        <a href="#curriculum" className="hover:text-white transition-colors">Curriculum</a>
                        <a href="#testimonials" className="hover:text-white transition-colors">Testimonials</a>
                        <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
                    </nav>

                    <Link
                        href={isLoggedIn ? "/dashboard" : "/auth/login"}
                        className="inline-flex items-center justify-center bg-white hover:bg-slate-100 text-slate-900 rounded-xl shadow-sm font-bold h-10 px-4 text-sm transition-colors"
                    >
                        {isLoggedIn ? "Dashboard" : "Login"}
                    </Link>
                </div>
            </header>

            <main className="flex-1">
                {/* HERO (coloré) */}
                <section className={`relative ${brandGradient}`}>
                    <div className="max-w-6xl mx-auto px-4 pt-12 pb-28 md:pt-20 md:pb-40 grid lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <p className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-3 py-1 text-xs font-bold text-white mb-6">
                                Learn the past, Build the future
                            </p>
                            <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
                                Learning Cobol is tough. Practicing it is even harder.{" "}
                            </h1>
                            <p className="mt-6 text-lg text-slate-200 max-w-xl">
                                A course that covers all the requirements to help you become a confident mainframe developer.
                            </p>

                            <div className="mt-8 flex flex-wrap gap-3">
                                <Link href="/auth/register" className={lightButton}>
                                    Start the Training
                                    <ArrowRight className="h-5 w-5" />
                                </Link>
                                <a href="#curriculum" className={ghostButton}>
                                    See the curriculum
                                </a>
                            </div>
                            <p className="mt-4 text-sm text-blue-100">Start with a 7-day free trial. No credit card required.</p>
                        </div>

                        {/* Illustration décorative : le programme HELLO et le JCL qui l'exécute, superposés à toutes
                            les tailles d'écran (JCL devant). Au survol de l'ensemble, le programme passe devant : les
                            variantes group-hover ne s'appliquent que sur les appareils qui savent survoler (pas au tactile).
                            Hauteur et corps de police réduits sous sm pour que la ligne la plus longue du JCL tienne. */}
                        <div className="group relative h-[16rem] sm:h-[19rem]" aria-hidden="true">
                            <CodeWindow
                                title="HELLO.cbl"
                                language="COBOL"
                                className="bg-brand-navy origin-top-left absolute top-0 left-0 w-[92%] sm:w-[90%] z-10 scale-[0.97] brightness-75 group-hover:z-20 group-hover:scale-100 group-hover:brightness-100 group-hover:-translate-y-1"
                            >
                                <span className="text-emerald-400">IDENTIFICATION DIVISION.</span>{"\n"}
                                {"    "}PROGRAM-ID. <span className="text-amber-300">HELLO</span>.{"\n"}
                                <span className="text-emerald-400">PROCEDURE DIVISION.</span>{"\n"}
                                {"    "}DISPLAY <span className="text-amber-300">&apos;HELLO, MAINFRAME!&apos;</span>.{"\n"}
                                {"    "}STOP RUN.
                            </CodeWindow>
                            <CodeWindow
                                title="HELLO.jcl"
                                language="JCL"
                                lineHeightClassName="leading-snug"
                                className="bg-slate-900 origin-bottom-right absolute bottom-0 right-0 w-[92%] sm:w-[90%] z-20 group-hover:z-10 group-hover:scale-[0.97] group-hover:brightness-75 group-hover:translate-y-1"
                            >
                                <span className="text-slate-500">{"//"}</span>HELLOJOB <span className="text-emerald-400">JOB</span>{" "}
                                <span className="text-amber-300">(ACCT),&apos;HELLO&apos;,CLASS=A</span>{"\n"}
                                <span className="text-slate-500">{"//"}</span>RUN{"      "}<span className="text-emerald-400">EXEC</span>{" "}
                                <span className="text-amber-300">PGM=HELLO</span>{"\n"}
                                <span className="text-slate-500">{"//"}</span>STEPLIB{"  "}<span className="text-emerald-400">DD</span>{" "}
                                <span className="text-amber-300">DSN=&amp;SYSUID..LOAD,DISP=SHR</span>{"\n"}
                                <span className="text-slate-500">{"//"}</span>SYSOUT{"   "}<span className="text-emerald-400">DD</span>{" "}
                                <span className="text-amber-300">SYSOUT=*</span>
                            </CodeWindow>
                        </div>
                    </div>
                    <WaveDivider />
                </section>

                {/* PRACTICE MAKES PERFECT (blanc) */}
                <Band tone="white">
                    <SectionHeading eyebrow="Practice makes perfect" title="Everything you need to actually practice" />
                    <div className="grid md:grid-cols-3 gap-6">
                        {FEATURES.map(({ icon, title, text }) => (
                            <div key={title} className="bg-brand-tint rounded-3xl border border-blue-100 p-8">
                                <IconTile icon={icon} />
                                <h3 className="mt-6 text-lg font-extrabold text-slate-900">{title}</h3>
                                <p className="mt-2 text-slate-600">{text}</p>
                            </div>
                        ))}
                    </div>
                </Band>

                {/* CURRICULUM (bleu pâle) */}
                <Band id="curriculum" tone="tint">
                    <SectionHeading eyebrow="Learning path" title="Learn step by step" />
                    <ol className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {STEPS.map((step, index) => (
                            <li key={step.title} className="bg-white rounded-3xl shadow-sm border border-blue-100 p-5 flex items-start gap-4">
                                <span className="h-10 w-10 rounded-xl bg-brand-navy text-white font-extrabold text-sm flex items-center justify-center shrink-0">
                                    {index + 1}
                                </span>
                                <div className="min-w-0 pt-0.5">
                                    <h3 className="font-bold text-slate-900">{step.title}</h3>
                                    {step.detail && <p className="mt-0.5 text-sm text-slate-500">{step.detail}</p>}
                                </div>
                            </li>
                        ))}
                        {UPCOMING.map((title) => (
                            <li
                                key={title}
                                className="rounded-3xl border border-dashed border-blue-300 p-5 flex items-center justify-between gap-4"
                            >
                                <h3 className="font-bold text-slate-500">{title}</h3>
                                <Badge className="border-none bg-amber-100 text-amber-700">Soon</Badge>
                            </li>
                        ))}
                    </ol>
                </Band>

                {/* WHAT'S INCLUDED (bleu nuit) */}
                <Band tone="navy">
                    <div className="grid md:grid-cols-2 gap-10 items-center">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-blue-300 mb-3">What&apos;s included</p>
                            <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
                                Self-paced, and deep enough to matter
                            </h2>
                            <p className="mt-4 text-slate-300">
                                Inside, you will learn step by step, even the concepts that many Cobol developers working today
                                don&apos;t fully master.
                            </p>
                        </div>
                        <ul className="space-y-4 rounded-3xl bg-white/5 border border-white/10 p-8">
                            {INCLUDED.map((item) => (
                                <li key={item} className="flex items-start gap-3">
                                    <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                                    <span className="font-medium text-slate-100">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </Band>

                {/* WORKSPACE : VS Code + TSO (blanc) */}
                <Band tone="white">
                    <SectionHeading eyebrow="Your workspace" title="Code in VS Code, or work in TSO">
                        Use the tool you&apos;re most comfortable with: both give you direct access to the mainframe.
                    </SectionHeading>
                    <WorkspaceShowcase />
                </Band>

                {/* TESTIMONIALS (bleu pâle) */}
                <Band id="testimonials" tone="tint">
                    <SectionHeading eyebrow="Testimonials" title="What students say" />
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {TESTIMONIALS.map(({ name, country, text }) => (
                            <figure key={name} className="bg-white rounded-3xl shadow-sm border border-blue-100 p-6 flex flex-col">
                                <Quote className="h-6 w-6 text-blue-300" />
                                <blockquote className="mt-4 text-slate-700 leading-relaxed flex-1">{text}</blockquote>
                                <figcaption className="mt-6 flex items-center gap-3">
                                    <span className="h-10 w-10 rounded-full bg-brand-tint border-2 border-white shadow-sm flex items-center justify-center font-bold text-blue-700">
                                        {name.charAt(0)}
                                    </span>
                                    <span>
                                        <span className="block text-sm font-bold text-slate-900">{name}</span>
                                        <span className="block text-xs text-slate-500">{country}</span>
                                    </span>
                                </figcaption>
                            </figure>
                        ))}
                    </div>
                </Band>

                {/* PRICING (blanc) */}
                <Band id="pricing" tone="white">
                    <SectionHeading eyebrow="Pricing" title="Enroll now.">
                        Create your account and start with a 7-day free trial. No credit card required.
                    </SectionHeading>
                    <div className={`grid gap-6 mx-auto ${cards.length > 1 ? "md:grid-cols-2 max-w-4xl" : "max-w-md"}`}>
                        {cards.map((card) => (
                            <PricingCard key={card.kind} {...card} />
                        ))}
                    </div>
                </Band>

                {/* FINAL CTA (coloré, dégradé inversé : bleu vif en haut, bleu nuit en bas) */}
                <section className="relative bg-linear-to-t from-brand-deep from-21% to-brand-sky to-98%">
                    <WaveDivider flip />
                    <div className="max-w-6xl mx-auto px-4 pt-28 pb-16 md:pt-36 md:pb-24 text-center">
                        <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight max-w-2xl mx-auto">
                            Ready to become a confident mainframe developer?
                        </h2>
                        <Link href="/auth/register" className={`${lightButton} mt-8`}>
                            Start the Training
                            <ArrowRight className="h-5 w-5" />
                        </Link>
                    </div>
                </section>
            </main>

            <SiteFooter variant="dark" />
        </div>
    );
}
