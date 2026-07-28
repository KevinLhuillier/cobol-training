import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/client";

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ courseId: string; chapterId: string; lessonId: string }> }
) {
    try {
        // 1. Déballage des paramètres (Next.js 15)
        const resolvedParams = await params;
        const { courseId, chapterId, lessonId } = resolvedParams;

        // 2. Récupération des données envoyées (ex: { title: "Nouveau titre" } ou { videoUrl: "..." })
        const values = await request.json();

        // 3. Vérification de sécurité : le chapitre appartient-il bien au cours ?
        const chapterOwner = await prisma.chapter.findUnique({
            where: {
                id: chapterId,
                courseId: courseId,
            }
        });

        if (!chapterOwner) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 4. Mise à jour de la leçon
        const lesson = await prisma.lesson.update({
            where: {
                id: lessonId,
                chapterId: chapterId, // Double sécurité
            },
            data: {
                ...values,
            },
        });

        return NextResponse.json(lesson, { status: 200 });

    } catch (error) {
        console.error("Error updating lesson:", error);
        return NextResponse.json(
            { error: "An error occurred while updating the lesson." },
            { status: 500 }
        );
    }
}