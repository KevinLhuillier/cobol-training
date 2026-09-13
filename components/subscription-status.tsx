"use client";

import { Clock, CheckCircle2, Check, Settings, Mail } from "lucide-react";
import { SubscribeButton } from "@/components/subscribe-button";

interface SubscriptionStatusProps {
    subscriptionStatus: string | null;
    trialDaysLeft: number;
}

export function SubscriptionStatus({ subscriptionStatus, trialDaysLeft }: SubscriptionStatusProps) {
    if (subscriptionStatus === "ACTIVE") {
        return (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-50 text-emerald-700 text-sm font-bold">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                Subscribed
            </div>
        );
    }

    if (subscriptionStatus === "UNPAID") {
        return (
            <div className="space-y-3">
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 text-red-700 text-sm font-bold">
                    <Clock className="h-4 w-4 shrink-0" />
                    Payment failed
                </div>

                <SubscribeButton className="w-full justify-center bg-blue-800 hover:bg-blue-900 shadow-md" />

                <div className="px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                    <p className="flex items-start gap-2 text-xs text-slate-500 leading-snug">
                        <Check className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                        Your last payment failed — access to courses and mainframe is suspended until it&apos;s resolved.
                    </p>
                    <p className="flex items-start gap-2 text-xs text-slate-500 leading-snug">
                        <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <a href="mailto:kevin@cobol-training.com" className="font-semibold text-slate-600 hover:underline">
                            kevin@cobol-training.com
                        </a>
                    </p>
                </div>
            </div>
        );
    }

    const isTrialActive = trialDaysLeft > 0;

    return (
        <div className="space-y-3">
            <div
                className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold ${
                    isTrialActive ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-500"
                }`}
            >
                <Clock className="h-4 w-4 shrink-0" />
                {isTrialActive
                    ? `Trial — ${trialDaysLeft} day${trialDaysLeft > 1 ? "s" : ""} left`
                    : "Trial ended"}
            </div>

            <SubscribeButton className="w-full justify-center bg-blue-800 hover:bg-blue-900 shadow-md" />

            <div className="px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                <p className="flex items-start gap-2 text-xs text-slate-500 leading-snug">
                    <Check className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                    Unlocks all courses and mainframe access for as long as your subscription stays active.
                </p>
                <p className="flex items-start gap-2 text-xs text-slate-500 leading-snug">
                    <Settings className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                    Manage your subscription anytime from the Settings menu.
                </p>
                <p className="flex items-start gap-2 text-xs text-slate-500 leading-snug">
                    <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <a href="mailto:kevin@cobol-training.com" className="font-semibold text-slate-600 hover:underline">
                        kevin@cobol-training.com
                    </a>
                </p>
            </div>
        </div>
    );
}
