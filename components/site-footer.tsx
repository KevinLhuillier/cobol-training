import Link from "next/link";
import { cn } from "@/lib/utils";

export function SiteFooter({ className, variant = "light" }: { className?: string; variant?: "light" | "dark" }) {
    const isDark = variant === "dark";

    return (
        <footer
            className={cn(
                "w-full px-4 py-6 text-center text-xs",
                isDark ? "bg-brand-black text-slate-400" : "text-slate-500",
                className,
            )}
        >
            <span>&copy; {new Date().getFullYear()} Cobol Training</span>
            <span aria-hidden="true" className="mx-2">&middot;</span>
            <Link href="/terms" className={cn("font-medium hover:underline", isDark ? "hover:text-white" : "hover:text-slate-900")}>
                Terms and Conditions
            </Link>
            <span aria-hidden="true" className="mx-2">&middot;</span>
            <Link href="/privacy" className={cn("font-medium hover:underline", isDark ? "hover:text-white" : "hover:text-slate-900")}>
                Privacy Policy
            </Link>
        </footer>
    );
}
