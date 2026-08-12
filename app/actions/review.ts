"use server";

import { createClient } from "@/utils/supabase/server";
import { sendExerciseReviewed } from "@/utils/mail";
import { revalidatePath } from "next/cache";

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