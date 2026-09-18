"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Award, Loader2, X } from "lucide-react";
// 🟢 Import du client Supabase
import { createClient } from "@/utils/supabase/client";
import { BadgeIcon, BADGE_ICON_NAMES } from "@/components/badges/badge-icon";

interface CourseBadgeFormProps {
    courseId: string;
    initialData: {
        id: string;
        name: string;
        description: string | null;
        icon: string;
    } | null;
}

export function CourseBadgeForm({ courseId, initialData }: CourseBadgeFormProps) {
    const router = useRouter();
    const supabase = createClient();

    const [enabled, setEnabled] = useState(!!initialData);
    const [isEditing, setIsEditing] = useState(!initialData);
    const [name, setName] = useState(initialData?.name || "Module Complete");
    const [description, setDescription] = useState(initialData?.description || "");
    const [icon, setIcon] = useState(initialData?.icon || "Award");
    const [isLoading, setIsLoading] = useState(false);

    const toggleEdit = () => {
        setIsEditing((prev) => !prev);
        setName(initialData?.name || "Module Complete");
        setDescription(initialData?.description || "");
        setIcon(initialData?.icon || "Award");
    };

    // Décoche = supprime le badge (et, par cascade, les badges déjà débloqués par des
    // étudiants pour ce cours) : cohérent avec le fait qu'un cours sans badge configuré n'en
    // attribue plus aucun.
    const onToggleEnabled = async () => {
        if (enabled && initialData) {
            if (!confirm("Removing this badge will also revoke it from students who already unlocked it. Continue?")) {
                return;
            }
            try {
                setIsLoading(true);
                const { error } = await supabase.from("badges").delete().eq("id", initialData.id);
                if (error) throw error;
                setEnabled(false);
                setIsEditing(false);
                router.refresh();
            } catch (error) {
                console.error("Badge delete error:", error);
                alert("An error occurred while removing the badge.");
            } finally {
                setIsLoading(false);
            }
            return;
        }

        setEnabled(true);
        setIsEditing(true);
    };

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        try {
            setIsLoading(true);

            if (initialData) {
                const { error } = await supabase
                    .from("badges")
                    .update({
                        name: name.trim(),
                        description: description.trim() || null,
                        icon,
                    })
                    .eq("id", initialData.id);
                if (error) throw error;
            } else {
                const { error } = await supabase.from("badges").insert({
                    course_id: courseId,
                    name: name.trim(),
                    description: description.trim() || null,
                    icon,
                });
                if (error) throw error;
            }

            setIsEditing(false);
            router.refresh();
        } catch (error) {
            console.error("Badge save error:", error);
            alert("An error occurred while saving the badge.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-lg">
                    <div className="h-8 w-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                        <Award className="h-4 w-4" />
                    </div>
                    Completion Badge
                </div>
                <label className="inline-flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        checked={enabled}
                        disabled={isLoading}
                        onChange={onToggleEnabled}
                        className="sr-only peer"
                    />
                    <div className="h-6 w-11 bg-slate-200 rounded-full peer peer-checked:bg-emerald-600 transition-colors relative after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:h-5 after:w-5 after:bg-white after:rounded-full after:shadow-sm after:transition-transform peer-checked:after:translate-x-5" />
                </label>
            </div>
            <p className="text-xs text-slate-500 mb-4">
                Award this badge automatically when a student completes every lesson, quiz and exercise in the course.
            </p>

            {!enabled ? null : isEditing ? (
                <form onSubmit={onSubmit} className="space-y-4">
                    <div className="space-y-1">
                        <label htmlFor="badge-name" className="text-sm font-bold text-slate-500">
                            Badge Name
                        </label>
                        <input
                            id="badge-name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            disabled={isLoading}
                            className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none text-slate-900 text-sm font-medium"
                            autoFocus
                        />
                    </div>

                    <div className="space-y-1">
                        <label htmlFor="badge-description" className="text-sm font-bold text-slate-500">
                            Description
                        </label>
                        <textarea
                            id="badge-description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            disabled={isLoading}
                            rows={2}
                            className="w-full p-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none text-slate-900 text-sm resize-none"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-bold text-slate-500">Icon</label>
                        <div className="flex flex-wrap gap-2">
                            {BADGE_ICON_NAMES.map((name_) => (
                                <button
                                    type="button"
                                    key={name_}
                                    onClick={() => setIcon(name_)}
                                    disabled={isLoading}
                                    className={`h-10 w-10 flex items-center justify-center rounded-lg border transition-colors ${
                                        icon === name_
                                            ? "border-slate-900 bg-slate-900 text-white"
                                            : "border-slate-200 text-slate-500 hover:bg-slate-50"
                                    }`}
                                >
                                    <BadgeIcon icon={name_} className="h-5 w-5" />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2">
                        {initialData && (
                            <button
                                type="button"
                                onClick={toggleEdit}
                                disabled={isLoading}
                                className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                        <button
                            type="submit"
                            disabled={isLoading || !name.trim()}
                            className="h-9 px-4 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 disabled:opacity-50 flex items-center"
                        >
                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
                        </button>
                    </div>
                </form>
            ) : (
                <button
                    type="button"
                    onClick={toggleEdit}
                    className="w-full flex items-center gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
                >
                    <div className="h-12 w-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                        <BadgeIcon icon={icon} className="h-6 w-6" />
                    </div>
                    <div className="min-w-0">
                        <p className="font-bold text-slate-900 truncate">{name}</p>
                        <p className="text-xs text-slate-500 line-clamp-1">
                            {description || "No description provided."}
                        </p>
                    </div>
                </button>
            )}
        </div>
    );
}
