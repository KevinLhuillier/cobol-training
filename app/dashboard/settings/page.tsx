import { redirect } from "next/navigation";
import { Mail } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { getTrialDaysLeft } from "@/utils/subscription";
import { ProfileForm } from "@/components/settings-profile-form";
import { PasswordForm } from "@/components/settings-password-form";
import { CancelSubscriptionButton } from "@/components/cancel-subscription-button";
import { SubscribeButton } from "@/components/subscribe-button";

export default async function SettingsPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return redirect("/auth/login");
    }

    const { data: profile } = await supabase
        .from("users")
        .select("name, email, subscription_status, trial_ends_at, cancel_at_period_end, current_period_end")
        .eq("id", user.id)
        .single();

    if (!profile) {
        return redirect("/auth/login");
    }

    const trialDaysLeft =
        profile.subscription_status === "TRIAL" ? getTrialDaysLeft(profile.trial_ends_at) : 0;

    const formattedPeriodEnd = profile.current_period_end
        ? new Date(profile.current_period_end).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
          })
        : null;

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
                <p className="text-slate-500 mt-1">Manage your profile, password, and subscription.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* PROFILE */}
                <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                    <h2 className="text-lg font-bold text-slate-900 mb-1">Profile</h2>
                    <p className="text-sm text-slate-500 mb-6">Update your personal information.</p>

                    <div className="space-y-2 mb-6">
                        <p className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                            <Mail className="h-4 w-4 text-slate-400" /> Email
                        </p>
                        <p className="text-sm text-slate-600 bg-slate-50 border border-slate-100 rounded-xl h-11 flex items-center px-3">
                            {profile.email}
                        </p>
                    </div>

                    <ProfileForm initialName={profile.name || ""} />
                </section>

                {/* PASSWORD */}
                <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                    <h2 className="text-lg font-bold text-slate-900 mb-1">Password</h2>
                    <p className="text-sm text-slate-500 mb-6">Choose a strong password you don&apos;t use elsewhere.</p>
                    <PasswordForm />
                </section>
            </div>

            {/* SUBSCRIPTION */}
            <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 max-w-md">
                <h2 className="text-lg font-bold text-slate-900 mb-1">Subscription</h2>
                <p className="text-sm text-slate-500 mb-6">Manage your billing and access.</p>

                {profile.subscription_status === "ACTIVE" ? (
                    profile.cancel_at_period_end ? (
                        <div className="space-y-4">
                            <div className="inline-flex w-fit px-4 py-3 rounded-xl bg-amber-50 text-amber-700 text-sm font-bold">
                                Cancellation scheduled
                            </div>
                            <p className="text-sm text-slate-500">
                                Your subscription will end
                                {formattedPeriodEnd ? ` on ${formattedPeriodEnd}` : " at the end of your current billing period"}.
                                You&apos;ll keep full access until then.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="inline-flex w-fit px-4 py-3 rounded-xl bg-emerald-50 text-emerald-700 text-sm font-bold">
                                Active{formattedPeriodEnd ? ` — renews on ${formattedPeriodEnd}` : ""}
                            </div>
                            <CancelSubscriptionButton />
                        </div>
                    )
                ) : (
                    <div className="space-y-4">
                        <div className="inline-flex w-fit px-4 py-3 rounded-xl bg-slate-100 text-slate-600 text-sm font-bold">
                            {trialDaysLeft > 0
                                ? `Trial — ${trialDaysLeft} day${trialDaysLeft > 1 ? "s" : ""} left`
                                : "No active subscription"}
                        </div>
                        <SubscribeButton />
                    </div>
                )}
            </section>
        </div>
    );
}
