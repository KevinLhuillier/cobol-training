"use client";

import { useState, type CSSProperties } from "react";
import Image from "next/image";
import { ArrowLeftRight, ChevronLeft, ChevronRight, CodeXml, SquareTerminal } from "lucide-react";

const SLIDES = [
    {
        icon: CodeXml,
        tab: "VS Code",
        title: "Code directly in VS Code",
        text: "Edit your COBOL and JCL in a modern editor, and browse your mainframe datasets without leaving it.",
        src: "/vscode.png",
        width: 981,
        height: 404,
        alt: "VS Code with the Zowe Explorer extension, editing the COBOL program HELLO stored on the mainframe",
    },
    {
        icon: SquareTerminal,
        tab: "TSO",
        title: "Or work in TSO",
        text: "Get the real thing: the ISPF environment used in the enterprise world to edit, submit and manage your jobs.",
        src: "/tso.png",
        width: 1297,
        height: 443,
        alt: "The TSO/ISPF editor showing a JCL job that runs the HELLO program",
    },
];

/**
 * Captures VS Code / TSO. À partir de lg : un slider (une capture à la fois, flèches + onglets).
 * En dessous : les deux cartes sont empilées et chaque capture défile horizontalement, car un
 * slider et un défilement dans l'image se disputeraient le geste de balayage au doigt.
 */
export function WorkspaceShowcase() {
    const [index, setIndex] = useState(0);
    const goTo = (i: number) => setIndex((i + SLIDES.length) % SLIDES.length);

    return (
        <div role="region" aria-roledescription="carousel" aria-label="VS Code and TSO screenshots">
            {/* Commandes du slider (desktop uniquement) */}
            <div className="hidden lg:flex items-center justify-center gap-3 mb-6">
                <button
                    type="button"
                    onClick={() => goTo(index - 1)}
                    aria-label="Previous screenshot"
                    className="h-10 w-10 rounded-full bg-white border border-blue-100 shadow-sm text-slate-700 hover:bg-brand-tint flex items-center justify-center transition-colors"
                >
                    <ChevronLeft className="h-5 w-5" />
                </button>

                <div className="inline-flex rounded-full bg-brand-tint border border-blue-100 p-1">
                    {SLIDES.map(({ icon: Icon, tab }, i) => (
                        <button
                            key={tab}
                            type="button"
                            onClick={() => goTo(i)}
                            aria-pressed={i === index}
                            className={`inline-flex items-center gap-2 rounded-full px-5 h-9 text-sm font-bold transition-colors ${
                                i === index ? "bg-brand-navy text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
                            }`}
                        >
                            <Icon className="h-4 w-4" />
                            {tab}
                        </button>
                    ))}
                </div>

                <button
                    type="button"
                    onClick={() => goTo(index + 1)}
                    aria-label="Next screenshot"
                    className="h-10 w-10 rounded-full bg-white border border-blue-100 shadow-sm text-slate-700 hover:bg-brand-tint flex items-center justify-center transition-colors"
                >
                    <ChevronRight className="h-5 w-5" />
                </button>
            </div>

            {/* Sous lg, le fond de carte est porté par chaque slide ; à partir de lg, par l'ensemble du slider. */}
            <div className="lg:bg-brand-tint lg:rounded-3xl lg:border lg:border-blue-100 lg:p-6">
                <div className="lg:overflow-hidden">
                    {/* grid-cols-1 (minmax(0, 1fr)) : sans lui, la colonne s'élargit à la largeur minimale de la capture
                        (800 px) au lieu de laisser le conteneur défiler, et la page déborde sur mobile. */}
                    <div
                        className="grid grid-cols-1 gap-6 lg:flex lg:gap-0 lg:translate-x-[calc(var(--slide)*-100%)] lg:transition-transform lg:duration-500 lg:ease-out motion-reduce:lg:transition-none"
                        style={{ "--slide": index } as CSSProperties}
                    >
                        {SLIDES.map(({ icon: Icon, title, text, src, width, height, alt }, i) => (
                            <div
                                key={title}
                                role="group"
                                aria-roledescription="slide"
                                aria-label={`${i + 1} of ${SLIDES.length}`}
                                className="bg-brand-tint rounded-3xl border border-blue-100 p-4 md:p-6 lg:basis-full lg:shrink-0 lg:bg-transparent lg:border-0 lg:rounded-none lg:p-0"
                            >
                                {/* Captures jamais agrandies au-delà de leur taille native (sinon floues). Sous lg elles
                                    gardent une largeur lisible (800 px) et défilent horizontalement. À partir de lg on
                                    garde 1 rem de marge de chaque côté pour que l'ombre ne soit pas rognée par le slider.
                                    Texte de capture : servi tel quel (non optimisé) pour rester net ; chargement immédiat
                                    car la 2e slide, hors champ, ne serait sinon chargée qu'au premier clic. */}
                                <div className="mx-auto overflow-x-auto rounded-2xl shadow-lg lg:w-[calc(100%-2rem)]" style={{ maxWidth: width }}>
                                    <div className="min-w-[800px] lg:min-w-0">
                                        <Image
                                            src={src}
                                            alt={alt}
                                            width={width}
                                            height={height}
                                            unoptimized
                                            loading="eager"
                                            className="block h-auto w-full"
                                        />
                                    </div>
                                </div>
                                <p className="lg:hidden mt-2 flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-500">
                                    <ArrowLeftRight className="h-3.5 w-3.5" />
                                    Swipe to see the whole screenshot
                                </p>
                                <div className="flex items-start gap-3 px-2 pt-5 pb-2 lg:px-4">
                                    <div className="h-10 w-10 rounded-xl bg-brand-blue flex items-center justify-center shrink-0">
                                        <Icon className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-extrabold text-slate-900">{title}</h3>
                                        <p className="mt-1 text-slate-600">{text}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
