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

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ courseId: string; chapterId: string; lessonId: string }> }
) {
    try {
        const resolvedParams = await params;
        const { courseId, chapterId, lessonId } = resolvedParams;

        // 1. On récupère la leçon pour connaître sa position
        const lessonToDelete = await prisma.lesson.findUnique({
            where: { id: lessonId, chapterId: chapterId }
        });

        if (!lessonToDelete) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        // 2. On supprime la leçon
        const deletedLesson = await prisma.lesson.delete({
            where: { id: lessonId }
        });

        // 3. On recalcule les positions des leçons suivantes dans CE chapitre précis
        await prisma.lesson.updateMany({
            where: {
                chapterId: chapterId,
                position: {
                    gt: lessonToDelete.position,
                }
            },
            data: {
                position: {
                    decrement: 1,
                }
            }
        });

        return NextResponse.json(deletedLesson, { status: 200 });
    } catch (error) {
        console.error("Error deleting lesson:", error);
        return NextResponse.json(
            { error: "An error occurred while deleting the lesson." },
            { status: 500 }
        );
    }
}