import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, CheckCircle2, Sparkles } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { CheckoutButton } from "@/components/checkout-button";

const DEFAULT_OFFER = {
    title: "Cobol Training subscription",
    priceCents: 1500,
    features: [
        "Access to all modules",
        "Quizzes, exercises, and a final project",
        "Mainframe Access",
        "Personalized feedback on exercises",
        "Support on Teams with the instructor",
    ],
};

export default async function SubscribePage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return redirect("/auth/login");

    const [{ data: profile }, { data: offer }] = await Promise.all([
        supabase.from("users").select("subscription_status").eq("id", user.id).single(),
        supabase.from("offer_settings").select("title, price_cents, features").eq("id", 1).single(),
    ]);

    const isActive = profile?.subscription_status === "ACTIVE";
    const title = offer?.title || DEFAULT_OFFER.title;
    const priceCents = offer?.price_cents ?? DEFAULT_OFFER.priceCents;
    const features = offer?.features?.length ? offer.features : DEFAULT_OFFER.features;
    const price = (priceCents / 100).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 });

    return (
        <div className="max-w-xl mx-auto font-sans">
            <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors mb-6"
            >
                <ArrowLeft className="h-4 w-4" />
                Back to dashboard
            </Link>

            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
                <div className="bg-slate-900 p-8 text-center">
                    <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-4">
                        <Sparkles className="h-6 w-6 text-emerald-400" />
                    </div>
                    <h1 className="text-xl font-extrabold text-white">{title}</h1>
                    <div className="mt-4 flex items-end justify-center gap-1">
                        <span className="text-4xl font-extrabold text-white">€{price}</span>
                        <span className="text-sm font-semibold text-slate-400 mb-1"> / month</span>
                    </div>
                </div>

                <div className="p-8">
                    <ul className="space-y-4 mb-8">
                        {features.map((feature: string) => (
                            <li key={feature} className="flex items-start gap-3">
                                <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                                <span className="text-sm font-medium text-slate-700">{feature}</span>
                            </li>
                        ))}
                    </ul>

                    {isActive ? (
                        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-50 text-emerald-700 text-sm font-bold justify-center">
                            <CheckCircle2 className="h-4 w-4 shrink-0" />
                            You&apos;re already subscribed
                        </div>
                    ) : (
                        <CheckoutButton className="w-full justify-center h-12 text-base" />
                    )}
                </div>
            </div>
        </div>
    );
}
