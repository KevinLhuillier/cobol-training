/**
 * Extrait le prénom d'un nom saisi librement. Certains élèves renseignent leur nom complet :
 * on ne garde que le premier mot pour que les salutations restent naturelles.
 * Utilisable côté serveur comme côté client (fonction pure).
 */
export function getFirstName(name: string, fallback = "Student"): string {
    return name.trim().split(/\s+/)[0] || fallback;
}
