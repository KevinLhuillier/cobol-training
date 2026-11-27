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
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Settings</h1>
                <p className="text-sm text-ui-muted mt-1">Manage your profile, password, and subscription.</p>
            </div>

            {/* PROFILE */}
            <SettingsSection title="Profile" description="Update your personal information.">
                <div className="space-y-2 mb-6">
                    <p className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                        <Mail className="h-4 w-4 text-slate-400" /> Email
                    </p>
                    <p className="text-sm text-slate-600 bg-ui-page border border-ui-line rounded-lg h-11 flex items-center px-3">
                        {profile.email}
                    </p>
                </div>

                <ProfileForm initialName={profile.name || ""} />
            </SettingsSection>

            {/* PASSWORD */}
            <SettingsSection title="Password" description="Choose a strong password you don't use elsewhere.">
                <PasswordForm />
            </SettingsSection>

            {/* SUBSCRIPTION */}
            <SettingsSection title="Subscription" description="Manage your billing and access.">
                {isRecurringActive ? (
                    profile.cancel_at_period_end ? (
                        <div className="space-y-4">
                            <div className="inline-flex w-fit px-4 py-3 rounded-lg bg-amber-50 text-amber-700 text-sm font-bold">
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
                            <div className="inline-flex w-fit px-4 py-3 rounded-lg bg-emerald-50 text-emerald-700 text-sm font-bold">
                                {isAddon ? "Lifetime + Mainframe" : "Active"}{formattedPeriodEnd ? ` — renews on ${formattedPeriodEnd}` : ""}
                            </div>
                            {showLifetimeUpgrade && <SubscribeButton>Upgrade to Lifetime</SubscribeButton>}
                            <CancelSubscriptionButton isAddon={isAddon} />
                        </div>
                    )
                ) : status === "LIFETIME" ? (
                    <div className="space-y-4">
                        <div className="inline-flex w-fit px-4 py-3 rounded-lg bg-violet-50 text-violet-700 text-sm font-bold">
                            Lifetime access
                        </div>
                        <p className="text-sm text-slate-500">
                            You have lifetime access to all courses. Mainframe (TSO) access and personalized feedback are included
                            {formattedMainframeEnd ? ` until ${formattedMainframeEnd}` : " for a limited period"}.
                        </p>
                    </div>
                ) : status === "LIFETIME_EXPIRED" ? (
                    <div className="space-y-4">
                        <div className="inline-flex w-fit px-4 py-3 rounded-lg bg-violet-50 text-violet-700 text-sm font-bold">
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
                        <div className="inline-flex w-fit px-4 py-3 rounded-lg bg-red-50 text-red-700 text-sm font-bold">
                            Payment failed — access suspended
                        </div>
                        <p className="text-sm text-slate-500">
                            Your last payment couldn&apos;t be processed. Upgrade again to restore access to your courses and Mainframe (TSO) account.
                        </p>
                        <SubscribeButton />
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="inline-flex w-fit px-4 py-3 rounded-lg bg-slate-100 text-slate-600 text-sm font-bold">
                            {trialDaysLeft > 0
                                ? `Trial — ${trialDaysLeft} day${trialDaysLeft > 1 ? "s" : ""} left`
                                : "No active subscription"}
                        </div>
                        <SubscribeButton />
                    </div>
                )}
            </SettingsSection>
        </div>
    );
}

/** Bloc de réglages : titre et description à gauche, contenu à droite (empilés sur mobile). */
function SettingsSection({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
    return (
        <section className="bg-white rounded-xl border border-ui-line flex flex-col md:flex-row">
            <div className="md:w-64 shrink-0 p-6 border-b md:border-b-0 md:border-r border-ui-line">
                <h2 className="text-base font-semibold text-slate-900">{title}</h2>
                <p className="mt-1.5 text-sm leading-relaxed text-ui-muted">{description}</p>
            </div>
            <div className="flex-1 min-w-0 p-6">{children}</div>
        </section>
    );
}
