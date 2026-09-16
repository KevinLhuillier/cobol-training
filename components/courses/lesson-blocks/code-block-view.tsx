import "prismjs/themes/prism-tomorrow.css";
import { Prism } from "./prism-languages";
import type { CodeBlockData } from "./types";

// Pas de "use client" : Prism.highlight() est une fonction pure (pas de DOM), ce composant est
// donc utilisable tel quel côté serveur pour le rendu élève (cf. lesson-blocks-view.tsx).
export function CodeBlockView({ code, language }: CodeBlockData) {
    const grammar = Prism.languages[language];
    const html = grammar ? Prism.highlight(code, grammar, language) : code;

    return (
        <pre
            className="
                rounded-2xl bg-[#2d2d2d] p-4 overflow-x-auto text-sm leading-relaxed
                [&_.token.jcl-marker]:text-slate-500
            "
        >
            <code
                className={`language-${language}`}
                dangerouslySetInnerHTML={{ __html: html }}
            />
        </pre>
    );
}
