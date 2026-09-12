"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateName } from "@/app/actions/auth";

interface ProfileFormProps {
    initialName: string;
}

export function ProfileForm({ initialName }: ProfileFormProps) {
    const router = useRouter();
    const [name, setName] = useState(initialName);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setSuccess(false);

        const result = await updateName(name);

        if (result?.error) {
            setError(result.error);
        } else {
            setSuccess(true);
            router.refresh();
        }
        setIsLoading(false);
    };

    return (
        <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-700 font-semibold">Full Name</Label>
                <Input
                    id="name"
                    name="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={isLoading}
                    className="text-slate-900 rounded-xl border-slate-200 bg-slate-50 focus-visible:ring-slate-400 focus-visible:bg-white h-11 disabled:opacity-50"
                />
            </div>

            {error && <p className="text-sm text-red-500 font-medium">{error}</p>}
            {success && (
                <p className="flex items-center gap-1.5 text-sm text-emerald-600 font-medium">
                    <Check className="h-4 w-4" /> Name updated
                </p>
            )}

            <Button
                type="submit"
                disabled={isLoading || name.trim() === initialName.trim() || name.trim().length === 0}
                className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-sm h-11 px-5 disabled:opacity-50"
            >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save changes
            </Button>
        </form>
    );
}
