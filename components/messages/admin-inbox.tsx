"use client";

import Link from "next/link";
import { useSelectedLayoutSegment } from "next/navigation";
import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface InboxConversation {
    studentId: string;
    name: string;
    initial: string;
    preview: string;
    hasImage: boolean;
    /** Déjà formatée côté serveur (évite un écart d'hydratation lié au fuseau horaire). */
    dateLabel: string;
    unreadCount: number;
}

/**
 * Messagerie admin en deux volets : liste des conversations à gauche, fil sélectionné à droite
 * (cf. app/dashboard/admin/messages/layout.tsx). Le segment actif (= studentId) vient de l'URL.
 * Sous lg, un seul volet à la fois : la liste sur /messages, le fil sur /messages/[studentId].
 */
export function AdminInbox({ conversations, children }: { conversations: InboxConversation[]; children: React.ReactNode }) {
    const activeStudentId = useSelectedLayoutSegment();

    return (
        <div className="bg-white rounded-xl border border-ui-line overflow-hidden lg:grid lg:grid-cols-[340px_minmax(0,1fr)] lg:h-[calc(100vh-15rem)] lg:min-h-[560px]">
            <nav
                aria-label="Conversations"
                className={cn(
                    "lg:border-r border-ui-line overflow-y-auto scrollbar-site p-2",
                    activeStudentId ? "hidden lg:block" : "block"
                )}
            >
                {conversations.length === 0 ? (
                    <p className="p-8 text-center text-sm text-ui-muted">No messages yet.</p>
                ) : (
                    <ul className="flex flex-col gap-0.5">
                        {conversations.map((conversation) => {
                            const isActive = conversation.studentId === activeStudentId;
                            // Le fil ouvert marque ses messages comme lus : on masque aussitôt son badge
                            // plutôt que d'attendre un rechargement de la liste.
                            const unread = isActive ? 0 : conversation.unreadCount;

                            return (
                                <li key={conversation.studentId}>
                                    <Link
                                        href={`/dashboard/admin/messages/${conversation.studentId}`}
                                        aria-current={isActive ? "page" : undefined}
                                        className={cn(
                                            "flex items-center gap-3 p-3 rounded-lg transition-colors",
                                            isActive ? "bg-ui-accent-soft" : "hover:bg-ui-page"
                                        )}
                                    >
                                        <span className="h-10 w-10 shrink-0 rounded-full bg-slate-200 flex items-center justify-center text-sm font-bold text-slate-700">
                                            {conversation.initial}
                                        </span>
                                        <span className="min-w-0 flex-1">
                                            <span className="flex items-center justify-between gap-2">
                                                <span className={cn("truncate text-sm text-slate-900", unread > 0 ? "font-bold" : "font-semibold")}>
                                                    {conversation.name}
                                                </span>
                                                <span className="text-xs text-ui-muted shrink-0">{conversation.dateLabel}</span>
                                            </span>
                                            {/* Texte dans son propre span `truncate min-w-0` : un long message ne doit
                                                pas élargir la ligne (cf. correctif du scroll horizontal). */}
                                            <span className="mt-0.5 flex items-center gap-1.5 min-w-0">
                                                {conversation.hasImage && <ImageIcon className="h-3.5 w-3.5 shrink-0 text-slate-400" />}
                                                <span className={cn("truncate min-w-0 text-[13px]", unread > 0 ? "text-slate-700" : "text-ui-muted")}>
                                                    {conversation.preview}
                                                </span>
                                                {unread > 0 && (
                                                    <span className="ml-auto h-[18px] min-w-[18px] px-1.5 rounded-full bg-ui-ink text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                                                        {unread}
                                                    </span>
                                                )}
                                            </span>
                                        </span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </nav>

            {/* Hauteur bornée (aussi sous lg) pour que le fil défile à l'intérieur du volet. */}
            <div className={cn("min-w-0 h-[calc(100vh-13rem)] min-h-[480px] lg:h-auto lg:min-h-0 flex-col", activeStudentId ? "flex" : "hidden lg:flex")}>
                {children}
            </div>
        </div>
    );
}
