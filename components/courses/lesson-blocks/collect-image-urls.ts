import type { LessonBlock } from "./types";

// Utilisé par lesson-builder.tsx (leçons et projets) pour repérer, à la sauvegarde, les
// images qui ne sont plus référencées (bloc supprimé, ou image remplacée) et doivent être
// nettoyées du bucket. Récursif : un bloc "solution" imbrique sa propre liste de blocs (cf.
// types.ts), qui peut elle-même contenir des blocs "image" à suivre.
export function collectImageUrls(blocks: LessonBlock[]): Set<string> {
    const urls = new Set<string>();
    for (const block of blocks) {
        if (block.type === "image") {
            if (block.data.url) urls.add(block.data.url);
        } else if (block.type === "solution") {
            for (const url of collectImageUrls(block.data.blocks)) {
                urls.add(url);
            }
        }
    }
    return urls;
}
