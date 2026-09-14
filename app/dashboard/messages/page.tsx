import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { ChatThread, type ChatMessage } from "@/components/messages/chat-thread";

export default async function MessagesPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return redirect("/auth/login");
    }

    const { data: profile } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();

    if (!profile) {
        return redirect("/auth/login");
    }

    if (profile.role === "ADMIN") {
        return redirect("/dashboard/admin/messages");
    }

    const { data: messages } = await supabase
        .from("messages")
        .select("id, student_id, sender_id, content, image_path, read_at, created_at")
        .eq("student_id", user.id)
        .order("created_at", { ascending: true });

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Messages</h1>
                <p className="text-slate-500 mt-1">Ask your instructor anything about the course or your mainframe access.</p>
            </div>

            <ChatThread
                currentUserId={user.id}
                studentId={user.id}
                isAdmin={false}
                initialMessages={(messages || []) as ChatMessage[]}
                counterpartName="Kevin"
                counterpartInitial="K"
            />
        </div>
    );
}
