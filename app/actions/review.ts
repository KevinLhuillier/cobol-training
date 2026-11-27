"use server";

import { createClient } from "@/utils/supabase/server";
import { sendExerciseReviewed, sendAdminExerciseSubmittedEmail } from "@/utils/mail";
import { revalidatePath } from "next/cache";
import { after } from "next/server";

export async function processReviewAction(progressId: string, status: "APPROVED" | "REJECTED", feedback: string) {
    const supabase = await createClient();

    // 1. Sécurité : Vérifier que c'est bien l'admin qui fait l'action
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    // 2. Mise à jour de la table lesson_progress
    const { error: updateError } = await supabase
        .from("lesson_progress")
        .update({
            exercise_status: status,
            review_feedback: feedback || null,
            is_completed: status === "APPROVED"
        })
        .eq("id", progressId);

    if (updateError) {
        console.error("Update failed:", updateError);
        throw new Error("Failed to update database");
    }

    // 3. Récupérer les infos pour l'email (Leçon, Élève)
    const { data: progressData } = await supabase
        .from("lesson_progress")
        .select(`
            users (name, email),
            lessons (title)
        `)
        .eq("id", progressId)
        .single();

    if (progressData) {
        // Nettoyage des données renvoyées par PostgREST
        const student = Array.isArray(progressData.users) ? progressData.users[0] : progressData.users;
        const lesson = Array.isArray(progressData.lessons) ? progressData.lessons[0] : progressData.lessons;

        if (student?.email && lesson?.title) {
            // 4. Envoi de l'email via notre service
            await sendExerciseReviewed(
                student.email,
                student.name || "Student",
                lesson.title,
                status === "APPROVED"
            );
        }
    }

    // 5. Rafraîchir le cache de la page des reviews
    revalidatePath("/dashboard/review");
    return { success: true };
}
type StudentRow = { name: string | null; email: string };
type CourseRow = { title: string };
type ChapterRow = { courses: CourseRow | CourseRow[] | null };
type LessonRow = { title: string; chapters: ChapterRow | ChapterRow[] | null };

// PostgREST peut renvoyer une relation un-à-un sous forme d'objet ou de tableau.
function firstOf<T>(value: T | T[] | null | undefined): T | null {
    return Array.isArray(value) ? value[0] ?? null : value ?? null;
}

/**
 * Appelée par le client juste après la soumission d'un exercice (upsert de lesson_progress en
 * PENDING_REVIEW, cf. components/courses/exercise-form.tsx). On ne fait pas confiance à l'appelant :
 * on relit en base la soumission de l'utilisateur connecté, et on n'envoie l'email que si elle est
 * bien en attente et vient d'être enregistrée (évite qu'un appel répété spamme l'admin).
 * Best-effort : l'email part dans `after()`, la réponse est immédiate.
 */
export async function notifyExerciseSubmitted(lessonId: string) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { success: false };

        const { data: progress } = await supabase
            .from("lesson_progress")
            .select(`
                exercise_status,
                updated_at,
                users (name, email),
                lessons (title, chapters (courses (title)))
            `)
            .eq("user_id", user.id)
            .eq("lesson_id", lessonId)
            .single();

        if (!progress || progress.exercise_status !== "PENDING_REVIEW" || !progress.updated_at) {
            return { success: false };
        }

        const SUBMISSION_WINDOW_MS = 2 * 60 * 1000;
        if (Date.now() - new Date(progress.updated_at).getTime() > SUBMISSION_WINDOW_MS) {
            return { success: false };
        }

        const student = firstOf(progress.users as unknown as StudentRow | StudentRow[] | null);
        const lesson = firstOf(progress.lessons as unknown as LessonRow | LessonRow[] | null);
        const chapter = firstOf(lesson?.chapters);
        const course = firstOf(chapter?.courses);

        const payload = {
            studentName: student?.name || student?.email || "Student",
            studentEmail: student?.email || "",
            courseTitle: course?.title || "Unknown course",
            lessonTitle: lesson?.title || "Unknown lesson",
            submittedAt: progress.updated_at as string,
        };

        after(async () => {
            try {
                await sendAdminExerciseSubmittedEmail(payload);
            } catch (mailError) {
                console.error("Admin exercise submitted email failed:", mailError);
            }
        });

        return { success: true };
    } catch (notifyError) {
        console.error("notifyExerciseSubmitted failed:", notifyError);
        return { success: false };
    }
}
