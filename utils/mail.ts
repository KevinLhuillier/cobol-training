import { Resend } from "resend";

// Initialisation unique de Resend
const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = "Cobol Training <kevin@cobol-training.com>";

/**
 * Envoie l'email de bienvenue à un nouvel étudiant
 */
export async function sendWelcomeEmail(toEmail: string, studentName: string, dashboardUrl: string) {
    return await resend.emails.send({
        from: FROM_EMAIL,
        to: toEmail,
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
}

/**
 * Envoie une notification lorsqu'un exercice est corrigé
 */
export async function sendExerciseReviewed(toEmail: string, studentName: string, exerciseTitle: string, isApproved: boolean) {
    const statusText = isApproved ? "APPROVED 🎉" : "REJECTED. Please check your feedback 📝";
    const statusColor = isApproved ? "#10b981" : "#ef4444"; // Vert ou Rouge
    const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`;

    return await resend.emails.send({
        from: FROM_EMAIL,
        to: toEmail,
        subject: `Update on your exercise: ${exerciseTitle}`,
        html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f1f5f9; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 500px; background-color: #ffffff; border-radius: 24px; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); padding: 40px;">
          
          <tr>
            <td align="center" style="padding-bottom: 24px;">
              <div style="background-color: #0f172a; border-radius: 16px; width: 56px; height: 56px; line-height: 56px; text-align: center; color: #34d399; font-family: 'Courier New', Courier, monospace; font-size: 22px; font-weight: bold; margin: 0 auto;">
                &gt;_
              </div>
            </td>
          </tr>
          
          <tr>
            <td align="left" style="padding-bottom: 32px;">
              <p style="margin: 0 0 16px 0; color: #0f172a; font-size: 16px; font-weight: 600;">
                Hello ${studentName},
              </p>
              <p style="margin: 0 0 16px 0; color: #64748b; font-size: 15px; line-height: 24px;">
                Your instructor has reviewed your solution for the exercise <strong>"${exerciseTitle}"</strong>.
              </p>
              <p style="margin: 0 0 24px 0; font-size: 16px; font-weight: bold; color: ${statusColor};">
                Status: ${statusText}
              </p>
              <p style="margin: 0; color: #64748b; font-size: 15px; line-height: 24px;">
                Log in to your workspace to see the detailed feedback from your instructor.
              </p>
            </td>
          </tr>
          
          <tr>
            <td align="center">
              <a href="${dashboardUrl}" style="display: inline-block; background-color: #0f172a; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 600; padding: 14px 32px; border-radius: 12px;">
                View Feedback
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
}