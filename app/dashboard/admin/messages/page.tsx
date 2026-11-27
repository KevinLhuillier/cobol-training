import { MessageCircle } from "lucide-react";

// Volet de droite quand aucun fil n'est ouvert (visible à partir de lg seulement : en dessous, la
// liste des conversations occupe tout l'écran — cf. AdminInbox). La liste et le contrôle d'accès
// admin sont dans layout.tsx.
export default function AdminMessagesPage() {
    return (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 p-8 text-center bg-ui-page/40">
            <span className="h-12 w-12 rounded-lg bg-white border border-ui-line flex items-center justify-center">
                <MessageCircle className="h-5 w-5 text-slate-400" />
            </span>
            <p className="text-sm font-semibold text-slate-900">Select a conversation</p>
            <p className="text-sm text-ui-muted max-w-xs">Choose a student on the left to read and reply to their messages.</p>
        </div>
    );
}
