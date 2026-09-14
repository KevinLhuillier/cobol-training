import Link from "next/link";
import { redirect } from "next/navigation";
import { MessageCircle, ImageIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/utils/supabase/server";

interface MessageRow {
    id: string;
    student_id: string;
    sender_id: string;
    content: string | null;
    image_path: string | null;
    read_at: string | null;
    created_at: string;
}

interface ConversationSummary {
    studentId: string;
    lastMessage: MessageRow;
    unreadCount: number;
}

export default async function AdminMessagesPage() {
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

    const summaries = new Map<string, ConversationSummary>();
    for (const message of (allMessages || []) as MessageRow[]) {
        const isUnreadFromStudent = message.sender_id === message.student_id && !message.read_at;
        const existing = summaries.get(message.student_id);
        if (!existing) {
            summaries.set(message.student_id, { studentId: message.student_id, lastMessage: message, unreadCount: isUnreadFromStudent ? 1 : 0 });
        } else if (isUnreadFromStudent) {
            existing.unreadCount += 1;
        }
    }

    const studentIds = Array.from(summaries.keys());
    const { data: students } = studentIds.length
        ? await supabase.from("users").select("id, name, email").in("id", studentIds)
        : { data: [] };

    const studentsById = new Map((students || []).map((s) => [s.id, s]));
    const conversations = Array.from(summaries.values());

    return (
        <div className="font-sans">
            <header className="mb-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-slate-900 rounded-xl flex items-center justify-center shadow-md">
                        <MessageCircle className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Messages</h1>
                        <p className="text-sm text-slate-500">Student conversations</p>
                    </div>
                </div>

                <Link
                    href="/dashboard/admin"
                    className="text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors px-4 py-2"
                >
                    Back to admin
                </Link>
            </header>

            <main className="w-full mx-auto">
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                    {conversations.length === 0 ? (
                        <p className="p-8 text-center text-slate-500">No messages yet.</p>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {conversations.map((conversation) => {
                                const student = studentsById.get(conversation.studentId);
                                const preview = conversation.lastMessage.content
                                    ? conversation.lastMessage.content
                                    : null;

                                return (
                                    <Link
                                        key={conversation.studentId}
                                        href={`/dashboard/admin/messages/${conversation.studentId}`}
                                        className="flex items-center gap-4 p-5 hover:bg-slate-50/50 transition-colors"
                                    >
                                        <div className="h-11 w-11 shrink-0 rounded-full bg-slate-200 flex items-center justify-center text-sm font-bold text-slate-600">
                                            {(student?.name || student?.email || "?").charAt(0).toUpperCase()}
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center justify-between gap-2">
                                                <p className="font-bold text-slate-900 truncate">
                                                    {student?.name || student?.email || "Unknown user"}
                                                </p>
                                                <span className="text-xs text-slate-400 shrink-0">
                                                    {new Date(conversation.lastMessage.created_at).toLocaleDateString("en-US", {
                                                        month: "short",
                                                        day: "numeric",
                                                    })}
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-500 truncate flex items-center gap-1.5 mt-0.5">
                                                {conversation.lastMessage.image_path && (
                                                    <ImageIcon className="h-3.5 w-3.5 shrink-0" />
                                                )}
                                                {preview || (conversation.lastMessage.image_path ? "Image" : "")}
                                            </p>
                                        </div>

                                        {conversation.unreadCount > 0 && (
                                            <Badge className="border-none bg-slate-900 text-white shrink-0">
                                                {conversation.unreadCount}
                                            </Badge>
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
