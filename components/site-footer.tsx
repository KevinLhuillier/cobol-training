import Link from "next/link";
import { cn } from "@/lib/utils";

export function SiteFooter({ className }: { className?: string }) {
    return (
        <footer className={cn("w-full px-4 py-6 text-center text-xs text-slate-500", className)}>
            <span>&copy; {new Date().getFullYear()} Cobol Training</span>
            <span aria-hidden="true" className="mx-2">&middot;</span>
            <Link href="/terms" className="font-medium hover:text-slate-900 hover:underline">
                Terms and Conditions
            </Link>
            <span aria-hidden="true" className="mx-2">&middot;</span>
            <Link href="/privacy" className="font-medium hover:text-slate-900 hover:underline">
                Privacy Policy
            </Link>
        </footer>
    );
}
