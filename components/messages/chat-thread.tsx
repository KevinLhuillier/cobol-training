"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ImageIcon, Loader2, Send, X } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { uploadChatImage, getChatImageSignedUrl } from "@/utils/chat-storage";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export interface ChatMessage {
    id: string;
    student_id: string;
    sender_id: string;
    content: string | null;
    image_path: string | null;
    read_at: string | null;
    created_at: string;
}

interface ChatThreadProps {
    currentUserId: string;
    studentId: string;
    isAdmin: boolean;
    initialMessages: ChatMessage[];
    counterpartName: string;
    counterpartInitial: string;
}

function formatTime(isoDate: string) {
    return new Date(isoDate).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

function ChatImage({ path, onOpen }: { path: string; onOpen: (url: string) => void }) {
    const [url, setUrl] = useState<string | null>(null);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        let cancelled = false;
        getChatImageSignedUrl(path)
            .then((signedUrl) => {
                if (!cancelled) setUrl(signedUrl);
            })
            .catch((error) => {
                console.error("Failed to load chat image:", error);
                if (!cancelled) setFailed(true);
            });
        return () => {
            cancelled = true;
        };
    }, [path]);

    if (failed) {
        return (
            <div className="w-48 h-24 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-xs text-slate-400 text-center px-3">
                Image no longer available
            </div>
        );
    }

    if (!url) {
        return <div className="w-48 h-32 rounded-xl bg-slate-100 animate-pulse" />;
    }

    return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
            src={url}
            alt="Attachment"
            onClick={() => onOpen(url)}
            className="max-w-[240px] max-h-[240px] rounded-xl border border-slate-100 cursor-pointer object-cover"
        />
    );
}

export function ChatThread({
    currentUserId,
    studentId,
    isAdmin,
    initialMessages,
    counterpartName,
    counterpartInitial,
}: ChatThreadProps) {
    const supabase = useMemo(() => createClient(), []);

    const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
    const [text, setText] = useState("");
    const [pendingImage, setPendingImage] = useState<{ path: string; previewUrl: string } | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

    const bottomRef = useRef<HTMLDivElement>(null);

    // Abonnement temps réel : les nouveaux messages (texte ou image) de ce fil
    // apparaissent instantanément des deux côtés, sans recharger la page.
    useEffect(() => {
        const channel = supabase
            .channel(`messages-${studentId}`)
            .on(
                "postgres_changes",
                { event: "INSERT", schema: "public", table: "messages", filter: `student_id=eq.${studentId}` },
                (payload) => {
                    const newMessage = payload.new as ChatMessage;
                    setMessages((prev) => (prev.some((m) => m.id === newMessage.id) ? prev : [...prev, newMessage]));
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [supabase, studentId]);

    // Marque comme lus les messages reçus (envoyés par l'autre partie) dès qu'ils apparaissent.
    useEffect(() => {
        const unreadIds = messages.filter((m) => m.sender_id !== currentUserId && !m.read_at).map((m) => m.id);
        if (unreadIds.length === 0) return;

        const readAt = new Date().toISOString();
        supabase
            .from("messages")
            .update({ read_at: readAt })
            .in("id", unreadIds)
            .then(({ error }) => {
                if (error) {
                    console.error("Failed to mark messages as read:", error);
                    return;
                }
                setMessages((prev) => prev.map((m) => (unreadIds.includes(m.id) ? { ...m, read_at: readAt } : m)));
            });
    }, [messages, currentUserId, supabase]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages.length]);

    const handlePaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
        const items = e.clipboardData?.items;
        if (!items) return;

        for (const item of Array.from(items)) {
            if (item.type.startsWith("image/")) {
                e.preventDefault();
                const file = item.getAsFile();
                if (!file) return;

                setIsUploading(true);
                try {
                    const path = await uploadChatImage(file, studentId);
                    setPendingImage({ path, previewUrl: URL.createObjectURL(file) });
                } catch (error) {
                    console.error("Image upload failed:", error);
                    alert("Failed to upload the pasted image. Please try again.");
                } finally {
                    setIsUploading(false);
                }
                return;
            }
        }
    };

    const handleSend = async () => {
        const trimmed = text.trim();
        if (!trimmed && !pendingImage) return;

        setIsSending(true);
        try {
            const { data, error } = await supabase
                .from("messages")
                .insert({
                    student_id: studentId,
                    sender_id: currentUserId,
                    content: trimmed || null,
                    image_path: pendingImage?.path || null,
                })
                .select()
                .single();

            if (error) throw error;

            setMessages((prev) => (prev.some((m) => m.id === data.id) ? prev : [...prev, data as ChatMessage]));
            setText("");
            setPendingImage(null);
        } catch (error) {
            console.error("Failed to send message:", error);
            alert("Failed to send your message. Please try again.");
        } finally {
            setIsSending(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 flex flex-col h-[calc(100vh-14rem)]">
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.length === 0 && (
                    <p className="text-sm text-slate-400 text-center mt-10">
                        {isAdmin
                            ? "No messages yet in this conversation."
                            : `Say hello to ${counterpartName} — ask anything about the course or the mainframe access.`}
                    </p>
                )}

                {messages.map((message) => {
                    const isOwn = message.sender_id === currentUserId;
                    return (
                        <div key={message.id} className={`flex items-end gap-2 ${isOwn ? "justify-end" : "justify-start"}`}>
                            {!isOwn && (
                                <div className="h-8 w-8 shrink-0 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                                    {counterpartInitial}
                                </div>
                            )}
                            <div
                                className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                                    isOwn ? "bg-slate-900 text-white rounded-br-sm" : "bg-slate-100 text-slate-900 rounded-bl-sm"
                                }`}
                            >
                                {message.image_path && (
                                    <div className="mb-1.5">
                                        <ChatImage path={message.image_path} onOpen={setLightboxUrl} />
                                    </div>
                                )}
                                {message.content && (
                                    <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                                )}
                                <p className={`text-[11px] mt-1 ${isOwn ? "text-slate-300" : "text-slate-400"}`}>
                                    {formatTime(message.created_at)}
                                </p>
                            </div>
                        </div>
                    );
                })}
                <div ref={bottomRef} />
            </div>

            <div className="border-t border-slate-100 p-4">
                {pendingImage && (
                    <div className="mb-3 inline-flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-xl p-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={pendingImage.previewUrl} alt="Pending attachment" className="h-14 w-14 rounded-lg object-cover" />
                        <button
                            onClick={() => setPendingImage(null)}
                            className="text-slate-400 hover:text-slate-700 transition-colors p-1"
                            aria-label="Remove attachment"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                )}

                <div className="flex items-end gap-2">
                    <Textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onPaste={handlePaste}
                        onKeyDown={handleKeyDown}
                        placeholder={isUploading ? "Uploading image..." : "Write a message... (paste an image with Ctrl+V)"}
                        disabled={isUploading}
                        className="min-h-11 max-h-40 rounded-xl border-slate-200 bg-slate-50 text-slate-900 focus-visible:ring-slate-400 focus-visible:bg-white"
                    />
                    <Button
                        onClick={handleSend}
                        disabled={isSending || isUploading || (!text.trim() && !pendingImage)}
                        className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-sm h-11 w-11 shrink-0 p-0"
                    >
                        {isSending || isUploading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Send className="h-4 w-4" />
                        )}
                    </Button>
                </div>
                <p className="text-xs text-slate-400 mt-2 flex items-center gap-1.5">
                    <ImageIcon className="h-3.5 w-3.5" />
                    Paste a screenshot directly in the box to attach it.
                </p>
            </div>

            <Dialog open={!!lightboxUrl} onOpenChange={(open) => !open && setLightboxUrl(null)}>
                <DialogContent className="max-w-2xl p-2 bg-transparent border-none shadow-none">
                    {lightboxUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={lightboxUrl} alt="Attachment" className="w-full h-auto rounded-2xl" />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
