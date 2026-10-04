// 1536 -> "1.5 KB". Partagé entre l'éditeur et l'affichage du bloc "attachments".
export function formatAttachmentSize(bytes: number): string {
    if (!Number.isFinite(bytes) || bytes < 1024) return `${Math.max(0, Math.round(bytes || 0))} B`;
    const units = ["KB", "MB", "GB"];
    let value = bytes / 1024;
    let unit = 0;
    while (value >= 1024 && unit < units.length - 1) {
        value /= 1024;
        unit++;
    }
    return `${value < 10 ? value.toFixed(1) : Math.round(value)} ${units[unit]}`;
}

// Lien de téléchargement : Supabase Storage renvoie un Content-Disposition "attachment" avec ce
// nom quand le paramètre ?download= est présent (sinon le navigateur ouvrirait certains fichiers).
export function attachmentDownloadUrl(url: string, name: string): string {
    return `${url}${url.includes("?") ? "&" : "?"}download=${encodeURIComponent(name)}`;
}
