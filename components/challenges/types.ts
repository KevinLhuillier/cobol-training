export interface Challenge {
    id: string;
    title: string;
    description: string | null;
    language: string;
    // Date de début au format "YYYY-MM-DD" (colonne DATE de Postgres)
    startsAt: string;
}

// Langages proposés à l'admin dans le formulaire de challenge (libellé libre côté base).
export const CHALLENGE_LANGUAGES = ["COBOL", "JCL", "REXX", "DB2 / SQL", "Other"];

// "YYYY-MM-DD" -> "Sep 14, 2026". Lue en UTC : new Date("2026-09-14") vaut minuit UTC, un
// affichage en heure locale pourrait sinon afficher la veille (fuseaux négatifs).
export function formatChallengeDate(startsAt: string): string {
    return new Date(startsAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC",
    });
}

// Date du jour au format "YYYY-MM-DD" (UTC, comme current_date côté Supabase) : sert à filtrer
// les challenges dont la date de début est atteinte (cf. policy RLS sur challenges).
export function todayIsoDate(): string {
    return new Date().toISOString().slice(0, 10);
}
