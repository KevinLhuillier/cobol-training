// Type d'un cours (colonne courses.kind) : seul l'endroit où il est listé côté étudiant change —
// menu "Courses" (/dashboard) pour COURSE, menu "Projects" (/dashboard/projects) pour PROJECT.
export type CourseKind = "COURSE" | "PROJECT";

export const COURSE_KIND_OPTIONS: { value: CourseKind; label: string; description: string }[] = [
    { value: "COURSE", label: "Course", description: "Listed in the Courses menu" },
    { value: "PROJECT", label: "Project", description: "Listed in the Projects menu" },
];

// Page étudiante qui liste les cours de ce type (lien retour du lecteur, redirections).
export function courseKindListHref(kind: CourseKind | null | undefined): string {
    return kind === "PROJECT" ? "/dashboard/projects" : "/dashboard";
}
