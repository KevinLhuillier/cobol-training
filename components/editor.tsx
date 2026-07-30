"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import "react-quill-new/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

interface EditorProps {
    onChange: (value: string) => void;
    value: string;
}

export const Editor = ({ onChange, value }: EditorProps) => {
    // 🟢 Configuration de la barre d'outils (mémorisée pour éviter de perdre le focus)
    const modules = useMemo(() => ({
        toolbar: [
            [{ header: [1, 2, 3, 4, 5, 6, false] }],
            ["bold", "italic", "underline", "strike"],
            [{ list: "ordered" }, { list: "bullet" }],
            // 🟢 Ajout de l'image et du bloc de code ici
            ["link", "image", "code-block"],
            [{ color: [] }, { background: [] }],
            ["clean"],
        ],
    }), []);

    return (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm transition-all focus-within:ring-2 focus-within:ring-slate-900 focus-within:border-transparent">
            {/* Ton design Tailwind conservé intact */}
            <div className="
                [&_.ql-toolbar.ql-snow]:border-none
                [&_.ql-toolbar.ql-snow]:border-b
                [&_.ql-toolbar.ql-snow]:border-slate-200
                [&_.ql-toolbar.ql-snow]:bg-slate-50/50
                [&_.ql-toolbar.ql-snow]:p-3

                [&_.ql-container.ql-snow]:border-none
                [&_.ql-editor]:text-slate-900
                [&_.ql-editor]:text-sm
                [&_.ql-editor]:min-h-[200px]
                [&_.ql-editor]:p-4

                [&_.ql-editor.ql-blank::before]:text-slate-400
                [&_.ql-editor.ql-blank::before]:font-style-normal
            ">
                <ReactQuill
                    theme="snow"
                    value={value}
                    onChange={onChange}
                    modules={modules} // 🟢 Injection des modules
                />
            </div>
        </div>
    );
};