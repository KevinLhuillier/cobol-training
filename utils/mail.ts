import { Resend } from "resend";
import { LOGO_CT_DATA_URI } from "@/utils/logo-ct";

// Initialisation unique de Resend
const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = "Cobol Training <kevin@cobol-training.com>";
const ADMIN_EMAIL = "kevin@cobol-training.com";

/**
 * Gabarit compact pour les notifications internes envoyées au propriétaire de l'application
 * (inscription, abonnement, alerte de stock TSO) — plus sobre que les emails destinés aux étudiants.
 */
function renderAdminNotificationEmail(title: string, bodyHtml: string): string {
    return `
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
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 480px; background-color: #ffffff; border-radius: 24px; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); padding: 40px;">

          <tr>
            <td align="center" style="padding-bottom: 24px;">
              <img src="${LOGO_CT_DATA_URI}" alt="Cobol Training" width="42" height="48" style="display: block; margin: 0 auto;" />
            </td>
          </tr>

          <tr>
            <td align="left" style="padding-bottom: 16px;">
              <p style="margin: 0; color: #0f172a; font-size: 16px; font-weight: 700;">
                ${title}
              </p>
            </td>
          </tr>

          <tr>
            <td align="left">
              ${bodyHtml}
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;
}

/**
 * Notifie le propriétaire de l'application qu'une nouvelle inscription vient d'être effectuée.
 */
export async function sendAdminNewRegistrationEmail(studentName: string, studentEmail: string) {
    return await resend.emails.send({
        from: FROM_EMAIL,
        to: ADMIN_EMAIL,
        subject: "New registration 👤",
        html: renderAdminNotificationEmail(
            "New registration",
            `
              <p style="margin: 0 0 4px 0; color: #64748b; font-size: 14px; line-height: 20px;">
                A new user just signed up:
              </p>
              <p style="margin: 0; color: #0f172a; font-size: 15px; line-height: 22px;">
                <strong>${studentName}</strong> — ${studentEmail}
              </p>
            `
        ),
    });
}

/**
 * Notifie le propriétaire de l'application qu'un nouvel abonnement vient d'être souscrit.
 */
export async function sendAdminNewSubscriptionEmail(studentName: string, studentEmail: string) {
    return await resend.emails.send({
        from: FROM_EMAIL,
        to: ADMIN_EMAIL,
        subject: "New subscription 💳",
        html: renderAdminNotificationEmail(
            "New subscription",
            `
              <p style="margin: 0 0 4px 0; color: #64748b; font-size: 14px; line-height: 20px;">
                A user just subscribed:
              </p>
              <p style="margin: 0; color: #0f172a; font-size: 15px; line-height: 22px;">
                <strong>${studentName}</strong> — ${studentEmail}
              </p>
            `
        ),
    });
}

/**
 * Notifie le propriétaire de l'application qu'un abonnement vient d'être annulé (fin de période).
 */
export async function sendAdminSubscriptionCanceledEmail(studentName: string, studentEmail: string) {
    return await resend.emails.send({
        from: FROM_EMAIL,
        to: ADMIN_EMAIL,
        subject: "Subscription canceled ❌",
        html: renderAdminNotificationEmail(
            "Subscription canceled",
            `
              <p style="margin: 0 0 4px 0; color: #64748b; font-size: 14px; line-height: 20px;">
                A subscription just ended:
              </p>
              <p style="margin: 0; color: #0f172a; font-size: 15px; line-height: 22px;">
                <strong>${studentName}</strong> — ${studentEmail}
              </p>
            `
        ),
    });
}

/**
 * Notifie le propriétaire de l'application qu'un paiement d'abonnement a échoué
 * (accès étudiant + compte TSO bloqués automatiquement en conséquence).
 */
export async function sendAdminPaymentFailedEmail(studentName: string, studentEmail: string) {
    return await resend.emails.send({
        from: FROM_EMAIL,
        to: ADMIN_EMAIL,
        subject: "Payment failed ⚠️",
        html: renderAdminNotificationEmail(
            "Payment failed",
            `
              <p style="margin: 0 0 4px 0; color: #64748b; font-size: 14px; line-height: 20px;">
                A subscription payment failed, access has been suspended for:
              </p>
              <p style="margin: 0; color: #0f172a; font-size: 15px; line-height: 22px;">
                <strong>${studentName}</strong> — ${studentEmail}
              </p>
            `
        ),
    });
}

/**
 * Notifie le propriétaire de l'application qu'un essai gratuit vient d'expirer pour un étudiant
 * (cron expire-trials).
 */
export async function sendAdminTrialExpiredEmail(studentName: string, studentEmail: string) {
    return await resend.emails.send({
        from: FROM_EMAIL,
        to: ADMIN_EMAIL,
        subject: "Trial ended ⏳",
        html: renderAdminNotificationEmail(
            "Trial ended",
            `
              <p style="margin: 0 0 4px 0; color: #64748b; font-size: 14px; line-height: 20px;">
                A free trial just ended for:
              </p>
              <p style="margin: 0; color: #0f172a; font-size: 15px; line-height: 22px;">
                <strong>${studentName}</strong> — ${studentEmail}
              </p>
            `
        ),
    });
}

/**
 * Alerte le propriétaire de l'application lorsqu'il reste moins de 10 comptes TSO disponibles.
 */
export async function sendAdminLowTsoAvailabilityEmail(availableCount: number) {
    return await resend.emails.send({
        from: FROM_EMAIL,
        to: ADMIN_EMAIL,
        subject: `Low TSO availability: ${availableCount} left ⚠️`,
        html: renderAdminNotificationEmail(
            "Low TSO availability",
            `
              <p style="margin: 0; color: #64748b; font-size: 14px; line-height: 20px;">
                Only <strong style="color: #ef4444;">${availableCount}</strong> TSO account${availableCount === 1 ? "" : "s"} remain available. Consider adding more accounts soon.
              </p>
            `
        ),
    });
}

/**
 * Envoie l'email de bienvenue à un nouvel étudiant
 */
export async function sendWelcomeEmail(toEmail: string, studentName: string, dashboardUrl: string) {
    return await resend.emails.send({
        from: FROM_EMAIL,
        to: toEmail,
        subject: "Welcome to your workspace! 🚀",
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
              <img src="${LOGO_CT_DATA_URI}" alt="Cobol Training" width="56" height="64" style="display: block; margin: 0 auto;" />
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
                Welcome to our dedicated Cobol and Mainframe learning platform. Here, you will find comprehensive courses and hands-on exercises, giving you the unique opportunity to practice directly on a live TSO environment.
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
 * Envoie les identifiants de connexion à un étudiant invité par un admin depuis
 * /dashboard/admin/users (compte créé directement, sans passage par la page d'inscription).
 */
export async function sendInviteEmail(toEmail: string, studentName: string, password: string, loginUrl: string) {
    return await resend.emails.send({
        from: FROM_EMAIL,
        to: toEmail,
        subject: "You've been invited to Cobol Training 🎓",
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
              <img src="${LOGO_CT_DATA_URI}" alt="Cobol Training" width="56" height="64" style="display: block; margin: 0 auto;" />
            </td>
          </tr>

          <tr>
            <td align="left" style="padding-bottom: 24px;">
              <p style="margin: 0 0 16px 0; color: #0f172a; font-size: 16px; font-weight: 600;">
                Hello ${studentName},
              </p>
              <p style="margin: 0; color: #64748b; font-size: 15px; line-height: 24px;">
                You've been invited to Cobol Training, our dedicated Cobol and Mainframe learning platform. An account has been created for you — here are your login credentials:
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding-bottom: 24px;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #0f172a; border-radius: 16px; padding: 24px;">
                <tr>
                  <td style="padding-bottom: 12px;">
                    <p style="margin: 0 0 4px 0; color: #94a3b8; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">Email</p>
                    <p style="margin: 0; color: #34d399; font-size: 16px; font-weight: 700; font-family: 'Courier New', Courier, monospace;">${toEmail}</p>
                  </td>
                </tr>
                <tr>
                  <td>
                    <p style="margin: 0 0 4px 0; color: #94a3b8; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">Password</p>
                    <p style="margin: 0; color: #ffffff; font-size: 16px; font-weight: 700; font-family: 'Courier New', Courier, monospace;">${password}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding-bottom: 16px;">
              <a href="${loginUrl}" style="display: inline-block; background-color: #0f172a; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 600; padding: 14px 32px; border-radius: 12px;">
                Log in to your account
              </a>
            </td>
          </tr>

          <tr>
            <td align="left">
              <p style="margin: 0; color: #94a3b8; font-size: 12px; line-height: 18px;">
                For your security, we recommend changing this password from your account settings after your first login.
              </p>
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

export type TsoAccessInfo =
    | { type: "subscription" }
    | { type: "trial"; endsAt: string };

function formatAccessNotice(access: TsoAccessInfo): string {
    if (access.type === "subscription") {
        return "This access remains active for as long as your subscription is active.";
    }
    const formattedDate = new Date(access.endsAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
    });
    return `This access is valid until your trial ends on <strong>${formattedDate}</strong>.`;
}

/**
 * Envoie les identifiants d'accès Mainframe (TSO) lors du déblocage d'un compte
 */
export async function sendTsoUnlockEmail(
    toEmail: string,
    studentName: string,
    username: string,
    password: string,
    host: string | null,
    port: number | null,
    access: TsoAccessInfo
) {
    const accessNotice = formatAccessNotice(access);
    return await resend.emails.send({
        from: FROM_EMAIL,
        to: toEmail,
        subject: "Your Mainframe (TSO) access is ready 🖥️",
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
              <img src="${LOGO_CT_DATA_URI}" alt="Cobol Training" width="56" height="64" style="display: block; margin: 0 auto;" />
            </td>
          </tr>

          <tr>
            <td align="left" style="padding-bottom: 24px;">
              <p style="margin: 0 0 16px 0; color: #0f172a; font-size: 16px; font-weight: 600;">
                Hello ${studentName},
              </p>
              <p style="margin: 0 0 16px 0; color: #64748b; font-size: 15px; line-height: 24px;">
                You've unlocked a Mainframe (TSO) account. ${accessNotice} Here are your connection details:
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding-bottom: 24px;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #0f172a; border-radius: 16px; padding: 24px;">
                <tr>
                  <td style="padding-bottom: 12px;">
                    <p style="margin: 0 0 4px 0; color: #94a3b8; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">User ID</p>
                    <p style="margin: 0; color: #34d399; font-size: 16px; font-weight: 700; font-family: 'Courier New', Courier, monospace;">${username}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom: 12px;">
                    <p style="margin: 0 0 4px 0; color: #94a3b8; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">Password</p>
                    <p style="margin: 0; color: #ffffff; font-size: 16px; font-weight: 700; font-family: 'Courier New', Courier, monospace;">${password}</p>
                  </td>
                </tr>
                ${host ? `
                <tr>
                  <td style="padding-bottom: 12px;">
                    <p style="margin: 0 0 4px 0; color: #94a3b8; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">Host</p>
                    <p style="margin: 0; color: #ffffff; font-size: 16px; font-weight: 700; font-family: 'Courier New', Courier, monospace;">${host}</p>
                  </td>
                </tr>` : ""}
                ${port ? `
                <tr>
                  <td>
                    <p style="margin: 0 0 4px 0; color: #94a3b8; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">Port</p>
                    <p style="margin: 0; color: #ffffff; font-size: 16px; font-weight: 700; font-family: 'Courier New', Courier, monospace;">${port}</p>
                  </td>
                </tr>` : ""}
              </table>
            </td>
          </tr>

          <tr>
            <td align="left">
              <p style="margin: 0; color: #64748b; font-size: 14px; line-height: 22px;">
                ${access.type === "trial"
                    ? "Remember: subscribe before your trial ends to keep using it without interruption."
                    : "Thanks for being a subscriber — enjoy your Mainframe access!"}
              </p>
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
              <img src="${LOGO_CT_DATA_URI}" alt="Cobol Training" width="56" height="64" style="display: block; margin: 0 auto;" />
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

/**
 * Envoie une confirmation lorsque l'abonnement passe en statut ACTIVE (webhook Stripe)
 */
export async function sendSubscriptionActivatedEmail(toEmail: string, studentName: string) {
    const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`;

    return await resend.emails.send({
        from: FROM_EMAIL,
        to: toEmail,
        subject: "Your subscription is active 🎉",
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
              <img src="${LOGO_CT_DATA_URI}" alt="Cobol Training" width="56" height="64" style="display: block; margin: 0 auto;" />
            </td>
          </tr>

          <tr>
            <td align="left" style="padding-bottom: 32px;">
              <p style="margin: 0 0 16px 0; color: #0f172a; font-size: 16px; font-weight: 600;">
                Hello ${studentName},
              </p>
              <p style="margin: 0 0 16px 0; color: #64748b; font-size: 15px; line-height: 24px;">
                Thanks for subscribing! Your subscription is now <strong>active</strong>, and you have full access to all courses and your Mainframe (TSO) account for as long as it stays active.
              </p>
            </td>
          </tr>

          <tr>
            <td align="center">
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
 * Envoie une confirmation lorsque l'utilisateur programme l'annulation de son abonnement
 * (l'accès reste actif jusqu'à la fin de la période en cours).
 */
export async function sendSubscriptionCancellationScheduledEmail(toEmail: string, studentName: string, periodEndDate: string | null) {
    const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings`;
    const formattedDate = periodEndDate
        ? new Date(periodEndDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
        : null;

    return await resend.emails.send({
        from: FROM_EMAIL,
        to: toEmail,
        subject: "Your cancellation is scheduled",
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
              <img src="${LOGO_CT_DATA_URI}" alt="Cobol Training" width="56" height="64" style="display: block; margin: 0 auto;" />
            </td>
          </tr>

          <tr>
            <td align="left" style="padding-bottom: 32px;">
              <p style="margin: 0 0 16px 0; color: #0f172a; font-size: 16px; font-weight: 600;">
                Hello ${studentName},
              </p>
              <p style="margin: 0 0 16px 0; color: #64748b; font-size: 15px; line-height: 24px;">
                We've received your cancellation request. Your subscription will remain <strong>active until${formattedDate ? ` ${formattedDate}` : " the end of your current billing period"}</strong> — you'll keep full access to your courses and Mainframe (TSO) account until then, and you won't be charged again after that.
              </p>
              <p style="margin: 0; color: #64748b; font-size: 15px; line-height: 24px;">
                Changed your mind? You can head back to your settings anytime before then.
              </p>
            </td>
          </tr>

          <tr>
            <td align="center">
              <a href="${dashboardUrl}" style="display: inline-block; background-color: #0f172a; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 600; padding: 14px 32px; border-radius: 12px;">
                Go to Settings
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
 * Envoie une notification lorsque l'annulation devient effective (webhook Stripe, fin de période).
 */
export async function sendSubscriptionCanceledEmail(toEmail: string, studentName: string) {
    const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`;

    return await resend.emails.send({
        from: FROM_EMAIL,
        to: toEmail,
        subject: "Your subscription has ended",
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
              <img src="${LOGO_CT_DATA_URI}" alt="Cobol Training" width="56" height="64" style="display: block; margin: 0 auto;" />
            </td>
          </tr>

          <tr>
            <td align="left" style="padding-bottom: 32px;">
              <p style="margin: 0 0 16px 0; color: #0f172a; font-size: 16px; font-weight: 600;">
                Hello ${studentName},
              </p>
              <p style="margin: 0 0 16px 0; color: #64748b; font-size: 15px; line-height: 24px;">
                Your subscription has now ended, along with access to your courses and Mainframe (TSO) account.
              </p>
              <p style="margin: 0; color: #64748b; font-size: 15px; line-height: 24px;">
                You're welcome back anytime — subscribe again to pick up right where you left off.
              </p>
            </td>
          </tr>

          <tr>
            <td align="center">
              <a href="${dashboardUrl}" style="display: inline-block; background-color: #0f172a; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 600; padding: 14px 32px; border-radius: 12px;">
                Subscribe again
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
 * Envoie une notification lorsqu'un paiement d'abonnement échoue (webhook Stripe :
 * customer.subscription.updated avec status past_due/unpaid) — accès et compte TSO déjà bloqués.
 */
export async function sendPaymentFailedEmail(toEmail: string, studentName: string) {
    const settingsUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings`;

    return await resend.emails.send({
        from: FROM_EMAIL,
        to: toEmail,
        subject: "Action required: your last payment failed",
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
              <img src="${LOGO_CT_DATA_URI}" alt="Cobol Training" width="56" height="64" style="display: block; margin: 0 auto;" />
            </td>
          </tr>

          <tr>
            <td align="left" style="padding-bottom: 32px;">
              <p style="margin: 0 0 16px 0; color: #0f172a; font-size: 16px; font-weight: 600;">
                Hello ${studentName},
              </p>
              <p style="margin: 0 0 16px 0; color: #64748b; font-size: 15px; line-height: 24px;">
                We were unable to process your last subscription payment. Your access to courses and to your Mainframe (TSO) account has been suspended until this is resolved.
              </p>
              <p style="margin: 0; color: #64748b; font-size: 15px; line-height: 24px;">
                Please update your payment method or contact us so we can help — access will be restored as soon as the payment goes through.
              </p>
            </td>
          </tr>

          <tr>
            <td align="center">
              <a href="${settingsUrl}" style="display: inline-block; background-color: #0f172a; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 600; padding: 14px 32px; border-radius: 12px;">
                Go to Settings
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
 * Envoie le lien de réinitialisation de mot de passe (généré via supabase.auth.admin.generateLink)
 * en passant par notre propre Resend, plutôt que le mailer intégré de Supabase (rate-limité par
 * défaut sans SMTP personnalisé — cf. l'incident de signup).
 */
export async function sendPasswordResetEmail(toEmail: string, studentName: string, resetLink: string) {
    return await resend.emails.send({
        from: FROM_EMAIL,
        to: toEmail,
        subject: "Reset your password",
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
              <img src="${LOGO_CT_DATA_URI}" alt="Cobol Training" width="56" height="64" style="display: block; margin: 0 auto;" />
            </td>
          </tr>

          <tr>
            <td align="left" style="padding-bottom: 32px;">
              <p style="margin: 0 0 16px 0; color: #0f172a; font-size: 16px; font-weight: 600;">
                Hello ${studentName},
              </p>
              <p style="margin: 0 0 16px 0; color: #64748b; font-size: 15px; line-height: 24px;">
                We received a request to reset your password. Click the button below to choose a new one.
              </p>
              <p style="margin: 0; color: #64748b; font-size: 15px; line-height: 24px;">
                If you didn't request this, you can safely ignore this email — your password won't change.
              </p>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding-bottom: 24px;">
              <a href="${resetLink}" style="display: inline-block; background-color: #0f172a; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 600; padding: 14px 32px; border-radius: 12px;">
                Reset your password
              </a>
            </td>
          </tr>

          <tr>
            <td align="left">
              <p style="margin: 0; color: #94a3b8; font-size: 12px; line-height: 18px;">
                For your security, this link will expire shortly. If it does, just request a new one from the login page.
              </p>
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
 * Envoie un rappel la veille de la fin de l'essai gratuit (cron expire-trials)
 */
export async function sendTrialEndingSoonEmail(toEmail: string, studentName: string, trialEndsAt: string) {
    const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`;
    const formattedDate = new Date(trialEndsAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
    });

    return await resend.emails.send({
        from: FROM_EMAIL,
        to: toEmail,
        subject: "Your free trial ends tomorrow ⏳",
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
              <img src="${LOGO_CT_DATA_URI}" alt="Cobol Training" width="56" height="64" style="display: block; margin: 0 auto;" />
            </td>
          </tr>

          <tr>
            <td align="left" style="padding-bottom: 32px;">
              <p style="margin: 0 0 16px 0; color: #0f172a; font-size: 16px; font-weight: 600;">
                Hello ${studentName},
              </p>
              <p style="margin: 0 0 16px 0; color: #64748b; font-size: 15px; line-height: 24px;">
                As a reminder, your free trial ends on <strong>${formattedDate}</strong>. After that, you'll lose access to your courses and your Mainframe (TSO) account.
              </p>
              <p style="margin: 0; color: #64748b; font-size: 15px; line-height: 24px;">
                Subscribe now to keep access without interruption.
              </p>
            </td>
          </tr>

          <tr>
            <td align="center">
              <a href="${dashboardUrl}" style="display: inline-block; background-color: #0f172a; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 600; padding: 14px 32px; border-radius: 12px;">
                Subscribe now
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
 * Envoie un message personnel de suivi 3 jours après le démarrage de l'essai gratuit
 * (cron expire-trials) pour vérifier que l'accès au mainframe se passe bien.
 */
export async function sendTrialCheckInEmail(toEmail: string, studentName: string) {
    return await resend.emails.send({
        from: FROM_EMAIL,
        to: toEmail,
        subject: "How's it going so far?",
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
              <img src="${LOGO_CT_DATA_URI}" alt="Cobol Training" width="56" height="64" style="display: block; margin: 0 auto;" />
            </td>
          </tr>

          <tr>
            <td align="left">
              <p style="margin: 0 0 16px 0; color: #0f172a; font-size: 16px; font-weight: 600;">
                Hello ${studentName},
              </p>
              <p style="margin: 0 0 16px 0; color: #64748b; font-size: 15px; line-height: 24px;">
                I hope you're doing well.
              </p>
              <p style="margin: 0 0 16px 0; color: #64748b; font-size: 15px; line-height: 24px;">
                I just wanted to check in and see how the training is going for you.
                Are you able to connect to the mainframe without any issues?
              </p>
              <p style="margin: 0; color: #0f172a; font-size: 15px;">
                All the best,<br>
                Kevin<br>
                Cobol Training
              </p>
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
 * Envoie une notification lorsque l'essai gratuit vient d'expirer (cron expire-trials)
 */
export async function sendTrialExpiredEmail(toEmail: string, studentName: string) {
    const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`;

    return await resend.emails.send({
        from: FROM_EMAIL,
        to: toEmail,
        subject: "Your free trial has ended",
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
              <img src="${LOGO_CT_DATA_URI}" alt="Cobol Training" width="56" height="64" style="display: block; margin: 0 auto;" />
            </td>
          </tr>

          <tr>
            <td align="left" style="padding-bottom: 32px;">
              <p style="margin: 0 0 16px 0; color: #0f172a; font-size: 16px; font-weight: 600;">
                Hello ${studentName},
              </p>
              <p style="margin: 0 0 16px 0; color: #64748b; font-size: 15px; line-height: 24px;">
                Your 7-day free trial has just ended, along with access to your courses and Mainframe (TSO) account.
              </p>
              <p style="margin: 0; color: #64748b; font-size: 15px; line-height: 24px;">
                Subscribe now to pick up right where you left off.
              </p>
            </td>
          </tr>

          <tr>
            <td align="center">
              <a href="${dashboardUrl}" style="display: inline-block; background-color: #0f172a; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 600; padding: 14px 32px; border-radius: 12px;">
                Subscribe now
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