"use server";

import { createClient } from "@/utils/supabase/server";
import { sendWelcomeEmail } from "@/utils/mail";

export async function triggerWelcomeEmailAction() {
    try {
        const supabase = await createClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError) {
            return { error: "Auth Error" };
        }

        if (!user) {
            return { error: "Unauthorized" };
        }

        const { data: profile, error: dbError } = await supabase
            .from("users")
            .select("name, email, welcome_email_sent")
            .eq("id", user.id)
            .single();

        if (dbError) {
            return { error: "Database Error" };
        }

        if (!profile) {
            return { error: "Profile not found" };
        }

        if (profile.welcome_email_sent) {
            return { success: true, message: "Already sent" };
        }

        const studentName = profile.name || "Student";
        const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`;

        try {
            await sendWelcomeEmail(profile.email, studentName, dashboardUrl);
        } catch (mailError) {
            return { error: "Email provider error" };
        }

        const { error: updateError } = await supabase
            .from("users")
            .update({ welcome_email_sent: true })
            .eq("id", user.id);

        if (updateError) {
            return { error: "Update Error" };
        }

        return { success: true };

    } catch (globalError) {
        return { error: "Internal Server Error" };
    }
}