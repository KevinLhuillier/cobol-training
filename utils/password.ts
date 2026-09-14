import { randomInt } from "node:crypto";

const UPPER = "ABCDEFGHJKLMNPQRSTUVWXYZ"; // sans I/O pour éviter la confusion visuelle
const LOWER = "abcdefghijkmnpqrstuvwxyz";
const DIGITS = "23456789";
const SYMBOLS = "!@#$%&*";
const ALL = UPPER + LOWER + DIGITS + SYMBOLS;

/**
 * Génère un mot de passe temporaire cryptographiquement aléatoire (pour les comptes
 * créés par un admin via invitation) : au moins un caractère de chaque catégorie pour
 * satisfaire les règles de robustesse habituelles, puis complété aléatoirement.
 */
export function generateTempPassword(length = 12): string {
    const required = [UPPER, LOWER, DIGITS, SYMBOLS].map(
        (set) => set[randomInt(set.length)]
    );

    const rest = Array.from({ length: length - required.length }, () => ALL[randomInt(ALL.length)]);

    const chars = [...required, ...rest];
    // Mélange (Fisher-Yates) pour ne pas garder les catégories requises en tête de mot de passe.
    for (let i = chars.length - 1; i > 0; i--) {
        const j = randomInt(i + 1);
        [chars[i], chars[j]] = [chars[j], chars[i]];
    }

    return chars.join("");
}
