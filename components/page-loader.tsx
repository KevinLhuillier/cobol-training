import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PageLoaderProps {
    fullScreen?: boolean;
    className?: string;
}

export function PageLoader({ fullScreen = false, className = "" }: PageLoaderProps) {
    return (
        <div
            className={cn(
                "flex flex-1 flex-col items-center justify-center gap-3",
                fullScreen ? "min-h-screen bg-slate-50" : "min-h-[50vh]",
                className
            )}
        >
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
    );
}
