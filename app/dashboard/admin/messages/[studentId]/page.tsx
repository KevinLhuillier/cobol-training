import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { ChatThread, type ChatMessage } from "@/components/messages/chat-thread";

export default async function AdminMessageThreadPage({
    params,
}: {
    params: Promise<{ studentId: string }>;
}) {
    const { studentId } = await params;
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

    // 2. Récupère l'étudiant concerné par ce fil
    const { data: student } = await supabase
        .from("users")
        .select("id, name, email")
        .eq("id", studentId)
        .single();

    if (!student) {
        return redirect("/dashboard/admin/messages");
    }

    const { data: messages } = await supabase
        .from("messages")
        .select("id, student_id, sender_id, content, image_path, read_at, created_at")
        .eq("student_id", studentId)
        .order("created_at", { ascending: true });

    const studentName = student.name || student.email;

    // Volet de droite de la messagerie admin (la liste des conversations est rendue par layout.tsx).
    return (
        <>
            <div className="flex items-center gap-3 px-4 py-3 border-b border-ui-line">
                {/* Retour à la liste : utile sous lg, où un seul volet est affiché à la fois. */}
                <Link
                    href="/dashboard/admin/messages"
                    aria-label="Back to conversations"
                    className="lg:hidden h-9 w-9 flex items-center justify-center rounded-lg border border-ui-line bg-white text-slate-500 hover:text-slate-900 transition-colors shrink-0"
                >
                    <ArrowLeft className="h-4 w-4" />
                </Link>
                <div className="min-w-0 flex-1">
                    <h2 className="text-[15px] font-semibold text-slate-900 truncate">{studentName}</h2>
                    <p className="text-xs text-ui-muted truncate">{student.email}</p>
                </div>
                <Link
                    href={`/dashboard/admin/users/${studentId}`}
                    className="text-[13px] font-semibold text-ui-accent hover:underline shrink-0"
                >
                    View profile
                </Link>
            </div>

            <ChatThread
                currentUserId={user.id}
                studentId={studentId}
                isAdmin
                initialMessages={(messages || []) as ChatMessage[]}
                counterpartName={studentName}
                counterpartInitial={studentName.charAt(0).toUpperCase()}
                className="flex-1 min-h-0 h-auto rounded-none border-0"
            />
        </>
    );
}
