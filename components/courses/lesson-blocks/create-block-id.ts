// Partagé entre le builder principal (lesson-builder.tsx) et l'éditeur du bloc Solution
// (solution-block-editor.tsx), qui gère lui aussi sa propre liste de blocs enfants.
export function createBlockId() {
    return typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2);
}
