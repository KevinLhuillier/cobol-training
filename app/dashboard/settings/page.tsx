import { redirect } from "next/navigation";
import { Mail } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { getEffectiveStatus, getTrialDaysLeft } from "@/utils/subscription";
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
        .select("name, email, subscription_status, trial_ends_at, mainframe_ends_at, cancel_at_period_end, current_period_end")
        .eq("id", user.id)
        .single();

    if (!profile) {
        return redirect("/auth/login");
    }

    const trialDaysLeft =
        profile.subscription_status === "TRIAL" ? getTrialDaysLeft(profile.trial_ends_at) : 0;

    const formatDate = (iso: string | null) =>
        iso
            ? new Date(iso).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
              })
            : null;

    const formattedPeriodEnd = formatDate(profile.current_period_end);

    // Le statut stocké LIFETIME peut être en retard sur la date de fin (le cron ne passe qu'une
    // fois par jour) : on se fie à la date, comme le reste de l'application.
    const status = getEffectiveStatus(profile);
    const formattedMainframeEnd = formatDate(profile.mainframe_ends_at);
    const isRecurringActive = status === "ACTIVE" || status === "LIFETIME_ADDON";
    const isAddon = status === "LIFETIME_ADDON";

    // Un abonné peut passer à l'offre à vie, une fois celle-ci configurée dans l'admin.
    let showLifetimeUpgrade = false;
    if (status === "ACTIVE") {
        const { data: lifetimeOffer } = await supabase
            .from("offer_settings")
            .select("stripe_price_id")
            .eq("kind", "LIFETIME")
            .maybeSingle();
        showLifetimeUpgrade = !!lifetimeOffer?.stripe_price_id;
    }

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

                {isRecurringActive ? (
                    profile.cancel_at_period_end ? (
                        <div className="space-y-4">
                            <div className="inline-flex w-fit px-4 py-3 rounded-xl bg-amber-50 text-amber-700 text-sm font-bold">
                                Cancellation scheduled
                            </div>
                            <p className="text-sm text-slate-500">
                                Your {isAddon ? "Mainframe + Feedback plan" : "subscription"} will end
                                {formattedPeriodEnd ? ` on ${formattedPeriodEnd}` : " at the end of your current billing period"}.
                                {isAddon
                                    ? " You'll keep your Mainframe access and feedback until then, and your lifetime access to all courses stays yours."
                                    : " You'll keep full access until then."}
                            </p>
                            {showLifetimeUpgrade && <SubscribeButton>Upgrade to Lifetime</SubscribeButton>}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="inline-flex w-fit px-4 py-3 rounded-xl bg-emerald-50 text-emerald-700 text-sm font-bold">
                                {isAddon ? "Lifetime + Mainframe" : "Active"}{formattedPeriodEnd ? ` — renews on ${formattedPeriodEnd}` : ""}
                            </div>
                            {showLifetimeUpgrade && <SubscribeButton>Upgrade to Lifetime</SubscribeButton>}
                            <CancelSubscriptionButton isAddon={isAddon} />
                        </div>
                    )
                ) : status === "LIFETIME" ? (
                    <div className="space-y-4">
                        <div className="inline-flex w-fit px-4 py-3 rounded-xl bg-violet-50 text-violet-700 text-sm font-bold">
                            Lifetime access
                        </div>
                        <p className="text-sm text-slate-500">
                            You have lifetime access to all courses. Mainframe (TSO) access and personalized feedback are included
                            {formattedMainframeEnd ? ` until ${formattedMainframeEnd}` : " for a limited period"}.
                        </p>
                    </div>
                ) : status === "LIFETIME_EXPIRED" ? (
                    <div className="space-y-4">
                        <div className="inline-flex w-fit px-4 py-3 rounded-xl bg-violet-50 text-violet-700 text-sm font-bold">
                            Lifetime access
                        </div>
                        <p className="text-sm text-slate-500">
                            You have lifetime access to all courses. Your included Mainframe (TSO) access and personalized feedback have ended —
                            you can add them back at a special rate reserved for lifetime members.
                        </p>
                        <SubscribeButton />
                    </div>
                ) : profile.subscription_status === "UNPAID" ? (
                    <div className="space-y-4">
                        <div className="inline-flex w-fit px-4 py-3 rounded-xl bg-red-50 text-red-700 text-sm font-bold">
                            Payment failed — access suspended
                        </div>
                        <p className="text-sm text-slate-500">
                            Your last payment couldn&apos;t be processed. Upgrade again to restore access to your courses and Mainframe (TSO) account.
                        </p>
                        <SubscribeButton />
                    </div>
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
