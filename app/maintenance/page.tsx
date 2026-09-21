import { Wrench } from "lucide-react";
import { LogoCtIcon } from "@/components/logo-ct-icon";
import { SiteFooter } from "@/components/site-footer";

export const metadata = {
    title: "Maintenance - Cobol Training",
};

export default function MaintenancePage() {
    return (
        <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
            <div className="flex-1 flex flex-col items-center justify-center px-4 text-center">
                <LogoCtIcon className="h-16 w-auto mb-10" />

                <div className="h-16 w-16 bg-slate-900 rounded-2xl flex items-center justify-center mb-6 shadow-md">
                    <Wrench className="h-8 w-8 text-white" />
                </div>

                <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
                    We&apos;ll be right back
                </h1>
                <p className="text-slate-500 max-w-md">
                    Cobol Training is currently undergoing scheduled maintenance. Please check back
                    in a few minutes.
                </p>
            </div>
            <SiteFooter />
        </div>
    );
}
