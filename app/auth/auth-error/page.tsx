import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";

export default function AuthErrorPage() {
    return (
        <AuthShell title="Link expired or invalid">

                <div className="mb-5 p-3 bg-red-50 rounded-lg flex items-start gap-2.5 text-red-800">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <p className="text-sm font-medium">
                        This link is no longer valid. It may have already been used or expired.
                    </p>
                </div>

                <div className="flex flex-col gap-3 text-center text-sm">
                    <Link href="/auth/forgot-password" className="font-semibold text-ui-accent hover:underline">
                        Request a new password reset link
                    </Link>
                    <Link href="/auth/login" className="font-medium text-ui-muted hover:text-slate-900 hover:underline">
                        Back to sign in
                    </Link>
                </div>
            </AuthShell>
    );
}
