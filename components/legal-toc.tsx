"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export interface LegalTocItem {
    id: string;
    label: string;
}

/** Sommaire « On this page » : surligne la section actuellement lue. */
export function LegalToc({ items }: { items: LegalTocItem[] }) {
    const [activeId, setActiveId] = useState(items[0]?.id);

    useEffect(() => {
        const sections = items
            .map((item) => document.getElementById(item.id))
            .filter((el): el is HTMLElement => el !== null);
        if (sections.length === 0) return;

        // Une section devient active quand son titre passe dans le tiers haut de l'écran.
        const observer = new IntersectionObserver(
            (entries) => {
                const visible = entries
                    .filter((entry) => entry.isIntersecting)
                    .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
                if (visible[0]) setActiveId(visible[0].target.id);
            },
            { rootMargin: "0px 0px -66% 0px" },
        );
        sections.forEach((section) => observer.observe(section));
        return () => observer.disconnect();
    }, [items]);

    return (
        <nav aria-label="On this page" className="flex flex-col gap-0.5">
            <p className="mb-2 px-2.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-ui-muted">
                On this page
            </p>
            {items.map((item) => {
                const isActive = item.id === activeId;
                return (
                    <a
                        key={item.id}
                        href={`#${item.id}`}
                        onClick={() => setActiveId(item.id)}
                        aria-current={isActive ? "location" : undefined}
                        className={cn(
                            "rounded-md px-2.5 py-2 text-sm transition-colors",
                            isActive
                                ? "bg-ui-accent-soft font-semibold text-slate-900"
                                : "text-slate-600 hover:bg-ui-page hover:text-slate-900",
                        )}
                    >
                        {item.label}
                    </a>
                );
            })}
        </nav>
    );
}
