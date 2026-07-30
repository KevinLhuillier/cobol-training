"use client";

import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

interface EditorProps {
    onChange: (value: string) => void;
    value: string;
}

export const Editor = ({ onChange, value }: EditorProps) => {
    return (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm transition-all focus-within:ring-2 focus-within:ring-slate-900 focus-within:border-transparent">
            {/* 🟢 Refonte complète du design de Quill via Tailwind */}
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
                />
            </div>
        </div>
    );
};