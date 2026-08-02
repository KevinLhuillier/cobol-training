'use server'

import { Resend } from 'resend';

// Initialise le client Resend avec ta clé API
const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendWelcomeEmail(userEmail: string, userName: string) {
    try {
        const { data, error } = await resend.emails.send({
            from: 'Mon App <onboarding@ton-domaine.com>', // Ton domaine vérifié
            to: [userEmail],
            subject: 'Bienvenue sur Mon App ! 🎉',
            // Tu peux écrire du HTML simple ou utiliser React Email plus tard
            html: `
        <div>
          <h1>Salut ${userName} !</h1>
          <p>Nous sommes ravis de t'accueillir sur notre plateforme.</p>
          <p>N'hésite pas à nous contacter si tu as la moindre question.</p>
          <br/>
          <p>L'équipe Mon App</p>
        </div>
      `,
        });

        if (error) {
            console.error("Erreur Resend :", error);
            return { success: false, error };
        }

        return { success: true, data };
    } catch (error) {
        console.error("Erreur serveur :", error);
        return { success: false, error };
    }
}
