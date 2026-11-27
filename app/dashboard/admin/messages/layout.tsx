import Link from "next/link";
import { redirect } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { AdminInbox, type InboxConversation } from "@/components/messages/admin-inbox";

interface MessageRow {
    id: string;
    student_id: string;
    sender_id: string;
    content: string | null;
    image_path: string | null;
    read_at: string | null;
    created_at: string;
}

/**
 * Layout commun à la liste (/dashboard/admin/messages) et à un fil (/messages/[studentId]) :
 * la liste des conversations reste affichée à gauche pendant qu'on lit un fil à droite.
 */
export default async function AdminMessagesLayout({ children }: { children: React.ReactNode }) {
    const supabase = await createClient();

    // 1. SÉCURITÉ : vérification stricte du rôle Admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return redirect("/auth/login");

    const { data: profile } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();

    if (!profile || profile.role !== "ADMIN") {
        return redirect("/dashboard");
    }

    // 2. Regroupe les messages par étudiant (dernier message + nb de non-lus envoyés par l'étudiant)
    const { data: allMessages } = await supabase
        .from("messages")
        .select("id, student_id, sender_id, content, image_path, read_at, created_at")
        .order("created_at", { ascending: false });

    const summaries = new Map<string, { lastMessage: MessageRow; unreadCount: number }>();
    for (const message of (allMessages || []) as MessageRow[]) {
        const isUnreadFromStudent = message.sender_id === message.student_id && !message.read_at;
        const existing = summaries.get(message.student_id);
        if (!existing) {
            summaries.set(message.student_id, { lastMessage: message, unreadCount: isUnreadFromStudent ? 1 : 0 });
        } else if (isUnreadFromStudent) {
            existing.unreadCount += 1;
        }
    }

    const studentIds = Array.from(summaries.keys());
    const { data: students } = studentIds.length
        ? await supabase.from("users").select("id, name, email").in("id", studentIds)
        : { data: [] };
    const studentsById = new Map((students || []).map((s) => [s.id, s]));

    const conversations: InboxConversation[] = Array.from(summaries.entries()).map(([studentId, summary]) => {
        const student = studentsById.get(studentId);
        const name = student?.name || student?.email || "Unknown user";
        const { lastMessage } = summary;
        const fromAdmin = lastMessage.sender_id !== lastMessage.student_id;
        const text = lastMessage.content || (lastMessage.image_path ? "Image" : "");
        return {
            studentId,
            name,
            initial: name.charAt(0).toUpperCase(),
            preview: fromAdmin ? `You: ${text}` : text,
            hasImage: !!lastMessage.image_path,
            dateLabel: new Date(lastMessage.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            unreadCount: summary.unreadCount,
        };
    });

    return (
        <div className="font-sans flex flex-col gap-6">
            <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-ui-ink rounded-lg flex items-center justify-center">
                        <MessageCircle className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Messages</h1>
                        <p className="text-sm text-ui-muted">Student conversations</p>
                    </div>
                </div>

                <Link
                    href="/dashboard/admin"
                    className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors px-4 py-2"
                >
                    Back to admin
                </Link>
            </header>

            <AdminInbox conversations={conversations}>{children}</AdminInbox>
        </div>
    );
}
