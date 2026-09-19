"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2 } from "lucide-react";
import { Editor } from "@/components/editor";
import { CHALLENGE_LANGUAGES, todayIsoDate, type Challenge } from "@/components/challenges/types";
// 🟢 Import du client Supabase
import { createClient } from "@/utils/supabase/client";

interface ChallengeFormProps {
    // Absent = création ; présent = édition du challenge existant
    challenge?: Challenge;
}

export function ChallengeForm({ challenge }: ChallengeFormProps) {
    const router = useRouter();
    const supabase = createClient();

    const [title, setTitle] = useState(challenge?.title ?? "");
    const [language, setLanguage] = useState(challenge?.language ?? CHALLENGE_LANGUAGES[0]);
    const [startsAt, setStartsAt] = useState(challenge?.startsAt ?? todayIsoDate());
    const [description, setDescription] = useState(challenge?.description ?? "");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [saved, setSaved] = useState(false);

    // Un langage déjà enregistré mais absent de la liste (valeur libre en base) reste sélectionnable
    const languageOptions = CHALLENGE_LANGUAGES.includes(language)
        ? CHALLENGE_LANGUAGES
        : [...CHALLENGE_LANGUAGES, language];

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        setSaved(false);

        try {
            const values = {
                title: title.trim(),
                language,
                starts_at: startsAt,
                description: description.trim() && description !== "<p><br></p>" ? description : null,
            };

            if (challenge) {
                const { error: updateError } = await supabase
                    .from("challenges")
                    .update(values)
                    .eq("id", challenge.id);

                if (updateError) throw updateError;

                setSaved(true);
                router.refresh();
            } else {
                // Brouillon par défaut : l'admin publie explicitement depuis la fiche du challenge
                const { data, error: insertError } = await supabase
                    .from("challenges")
                    .insert({ ...values, is_published: false })
                    .select("id")
                    .single();

                if (insertError) throw insertError;

                router.push(`/dashboard/admin/challenges/${data.id}`);
                router.refresh();
            }
        } catch (err) {
            console.error("Challenge save error:", err);
            setError(err instanceof Error ? err.message : "Failed to save the challenge");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={onSubmit} className="space-y-6">
            {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100">
                    {error}
                </div>
            )}

            {/* TITLE */}
            <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-bold text-slate-900">
                    Title <span className="text-red-500">*</span>
                </label>
                <input
                    id="title"
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Reverse a string in COBOL"
                    className="text-slate-900 w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all outline-none"
                />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* LANGUAGE */}
                <div className="space-y-2">
                    <label htmlFor="language" className="text-sm font-bold text-slate-900">
                        Language
                    </label>
                    <select
                        id="language"
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="text-slate-900 w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all outline-none"
                    >
                        {languageOptions.map((option) => (
                            <option key={option} value={option}>{option}</option>
                        ))}
                    </select>
                </div>

                {/* START DATE */}
                <div className="space-y-2">
                    <label htmlFor="startsAt" className="text-sm font-bold text-slate-900">
                        Start date <span className="text-red-500">*</span>
                    </label>
                    <input
                        id="startsAt"
                        type="date"
                        required
                        value={startsAt}
                        onChange={(e) => setStartsAt(e.target.value)}
                        className="text-slate-900 w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all outline-none"
                    />
                </div>
            </div>
            <p className="text-xs text-slate-500 font-medium -mt-3">
                Once published, students see the challenge from its start date. The most recent one becomes the challenge of the week.
            </p>

            {/* DESCRIPTION */}
            <div className="space-y-2">
                <label className="text-sm font-bold text-slate-900">Instructions</label>
                <Editor value={description} onChange={setDescription} />
            </div>

            <div className="pt-4 flex items-center justify-end gap-4 border-t border-slate-100">
                {saved && <p className="text-sm text-emerald-600 font-medium">Changes saved.</p>}
                <button
                    type="submit"
                    disabled={isLoading || !title.trim()}
                    className="px-6 h-12 rounded-xl font-bold text-white bg-slate-900 hover:bg-slate-800 transition-colors flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
                >
                    {isLoading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                        <>
                            <Save className="h-4 w-4 mr-2" />
                            {challenge ? "Save changes" : "Create challenge"}
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}
