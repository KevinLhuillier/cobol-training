"use client";

import { Clock, CheckCircle2 } from "lucide-react";
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

            <SubscribeButton className="w-full justify-center bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-md">
                Subscribe — $19/mo
            </SubscribeButton>
        </div>
    );
}
