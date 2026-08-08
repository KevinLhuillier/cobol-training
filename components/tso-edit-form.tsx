"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";

interface TsoEditFormProps {
    initialData: {
        id: string;
        username: string;
        password: string;
        status: string;
        assignedToUserId: string | null;
    };
    users: { id: string; email: string }[];
}

export function TsoEditForm({ initialData, users }: TsoEditFormProps) {
    const router = useRouter();
    const supabase = createClient();
    const [password, setPassword] = useState(initialData.password);
    const [status, setStatus] = useState(initialData.status);
    const [assignedToUserId, setAssignedToUserId] = useState(initialData.assignedToUserId || "");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsLoading(true);
            setError("");

            // Si on assigne un user, on force le statut à ASSIGNED
            const finalStatus = assignedToUserId ? "ASSIGNED" : status;

            const { error } = await supabase
                .from("tso_users")
                .update({
                    password,
                    status: finalStatus,
                    assigned_to_user_id: assignedToUserId || null
                })
                .eq("id", initialData.id);

            if (error) throw error;

            router.refresh();
            router.push("/dashboard/admin/users-tso");
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unexpected error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={onSubmit} className="space-y-6">
            {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 font-medium">{error}</div>}

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Password</label>
                    <input
                        type="text"
                        required
                        disabled={isLoading}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="text-slate-900 w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-slate-900 outline-none font-mono"
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Account Status</label>
                    <select
                        disabled={isLoading}
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="text-slate-900 w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-slate-900 outline-none"
                    >
                        <option value="AVAILABLE">Available</option>
                        <option value="ASSIGNED">Assigned</option>
                        <option value="BLOCKED">Blocked</option>
                        <option value="RESET_REQUIRED">Needs Reset</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Assign to Student</label>
                    <select
                        disabled={isLoading}
                        value={assignedToUserId}
                        onChange={(e) => setAssignedToUserId(e.target.value)}
                        className="text-slate-900 w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-slate-900 outline-none"
                    >
                        <option value="">-- Unassigned --</option>
                        {users.map((user) => (
                            <option key={user.id} value={user.id}>{user.email}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <Link href="/dashboard/admin/users-tso">
                    <Button type="button" variant="ghost" disabled={isLoading} className="text-slate-500">Cancel</Button>
                </Link>
                <Button type="submit" disabled={isLoading || !password} className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-sm px-6">
                    {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                    Save Changes
                </Button>
            </div>
        </form>
    );
}