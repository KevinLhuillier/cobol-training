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

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center gap-3">
                <Link
                    href="/dashboard/admin/messages"
                    className="h-9 w-9 flex items-center justify-center rounded-xl border border-slate-100 bg-white shadow-sm text-slate-500 hover:text-slate-900 transition-colors shrink-0"
                >
                    <ArrowLeft className="h-4 w-4" />
                </Link>
                <div>
                    <h1 className="text-xl font-bold text-slate-900">{studentName}</h1>
                    <p className="text-sm text-slate-500">{student.email}</p>
                </div>
            </div>

            <ChatThread
                currentUserId={user.id}
                studentId={studentId}
                isAdmin
                initialMessages={(messages || []) as ChatMessage[]}
                counterpartName={studentName}
                counterpartInitial={studentName.charAt(0).toUpperCase()}
            />
        </div>
    );
}
