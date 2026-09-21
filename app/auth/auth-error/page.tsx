import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { LogoCtIcon } from "@/components/logo-ct-icon";

export default function AuthErrorPage() {
    return (
        <div className="flex-1 bg-slate-100 flex items-center justify-center p-4 font-sans">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-sm p-8 flex flex-col">
                <div className="flex flex-col items-center mb-8 text-center">
                    <LogoCtIcon className="h-14 w-auto mb-4" />
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                        Link expired or invalid
                    </h1>
                </div>

                <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-600 mb-6">
                    <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                    <p className="text-sm font-medium">
                        This link is no longer valid. It may have already been used or expired.
                    </p>
                </div>

                <div className="flex flex-col gap-3 text-center text-sm">
                    <Link href="/auth/forgot-password" className="font-bold text-slate-900 hover:underline">
                        Request a new password reset link
                    </Link>
                    <Link href="/auth/login" className="font-medium text-slate-500 hover:underline">
                        Back to sign in
                    </Link>
                </div>
            </div>
        </div>
    );
}
