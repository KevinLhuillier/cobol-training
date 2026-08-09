import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
// 🟢 Importe ton service d'email ici (ex: Resend)
import { Resend } from 'resend';
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST() {
    const supabase = await createClient();

    // 1. On s'assure que la requête vient bien de l'utilisateur connecté
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. On récupère le profil de l'étudiant
    const { data: profile } = await supabase
        .from("users")
        .select("name, email, welcome_email_sent")
        .eq("id", user.id)
        .single();

    // 3. Si l'email a déjà été envoyé, on arrête tout (sécurité)
    if (!profile || profile.welcome_email_sent) {
        return NextResponse.json({ message: "Welcome email already sent" }, { status: 200 });
    }

    try {
        // Préparation des variables dynamiques pour le HTML
        const studentName = profile.name || "Student";
        const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard`;

        // 4. ✉️ ENVOI DE L'EMAIL AVEC RESEND
        await resend.emails.send({
            from: "Cobol Training <kevin@cobol-training.com>",
            to: profile.email,
            subject: "Welcome to your student workspace! 🚀",
            html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Cobol Training</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f1f5f9; padding: 40px 20px;">
    <tr>
      <td align="center">
        <!-- Main Card -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 500px; background-color: #ffffff; border-radius: 24px; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); padding: 40px;">
          
          <!-- Logo Terminal -->
          <tr>
            <td align="center" style="padding-bottom: 24px;">
              <div style="background-color: #0f172a; border-radius: 16px; width: 56px; height: 56px; line-height: 56px; text-align: center; color: #34d399; font-family: 'Courier New', Courier, monospace; font-size: 22px; font-weight: bold; margin: 0 auto;">
                &gt;_
              </div>
            </td>
          </tr>
          
          <!-- Title -->
          <tr>
            <td align="center" style="padding-bottom: 32px;">
              <h1 style="margin: 0; color: #0f172a; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">Cobol Training</h1>
            </td>
          </tr>
          
          <!-- Content / Text -->
          <tr>
            <td align="left" style="padding-bottom: 32px;">
              <p style="margin: 0 0 16px 0; color: #0f172a; font-size: 16px; font-weight: 600;">
                Welcome aboard, ${studentName}!
              </p>
              <p style="margin: 0 0 16px 0; color: #64748b; font-size: 15px; line-height: 24px;">
                Welcome to our dedicated COBOL and Mainframe learning platform. Here, you will find comprehensive courses and hands-on exercises, giving you the unique opportunity to practice directly on a live TSO environment.
              </p>
              <p style="margin: 0 0 24px 0; color: #64748b; font-size: 15px; line-height: 24px;">
                Feel free to reach out if you have any questions along the way. I'm here to help!
              </p>
              <p style="margin: 0; color: #0f172a; font-size: 15px; font-weight: 600;">
                All the best,<br>
                Kevin
              </p>
            </td>
          </tr>
          
          <!-- Call to Action Button -->
          <tr>
            <td align="center" style="padding-top: 8px;">
              <a href="${dashboardUrl}" style="display: inline-block; background-color: #0f172a; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 600; padding: 14px 32px; border-radius: 12px;">
                Go to your Dashboard
              </a>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
            `
        });

        // 5. On marque l'email comme envoyé dans Supabase
        const { error: updateError } = await supabase
            .from("users")
            .update({ welcome_email_sent: true })
            .eq("id", user.id);

        if (updateError) throw updateError;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to send welcome email:", error);
        return NextResponse.json({ error: "Email delivery failed" }, { status: 500 });
    }
}