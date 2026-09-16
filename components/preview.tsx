"use client";

import dynamic from "next/dynamic";
// 🟢 On change les imports ici aussi :
import "react-quill-new/dist/quill.bubble.css";
const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

interface PreviewProps {
    value: string;
}

export const Preview = ({ value }: PreviewProps) => {
    return (
        // Sans cette couleur par défaut, le texte non explicitement coloré (ou coloré en noir,
        // que Quill traite comme "pas de couleur") hérite de la couleur de texte ambiante de la
        // page — proche du blanc ici car <html> force le thème sombre (cf. app/layout.tsx) — et
        // devient invisible sur les fonds clairs où cet aperçu est affiché côté élève.
        <div className="[&_.ql-editor]:text-slate-800">
            <ReactQuill
                theme="bubble"
                value={value}
                readOnly
            />
        </div>
    );
};