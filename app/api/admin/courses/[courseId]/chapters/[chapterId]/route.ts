import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/client";

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ courseId: string; chapterId: string }> }
) {
    try {
        // 1. Déballage des paramètres asynchrones
        const resolvedParams = await params;
        const { courseId, chapterId } = resolvedParams;

        // 2. Récupération des données envoyées
        const values = await request.json();

        // 3. Mise à jour du chapitre avec double vérification de sécurité
        const chapter = await prisma.chapter.update({
            where: {
                id: chapterId,
                courseId: courseId,
            },
            data: {
                ...values,
            },
        });

        return NextResponse.json(chapter, { status: 200 });

    } catch (error) {
        console.error("Error updating chapter:", error);
        return NextResponse.json(
            { error: "An error occurred while updating the chapter." },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ courseId: string; chapterId: string }> }
) {
    try {
        const resolvedParams = await params;
        const { courseId, chapterId } = resolvedParams;

        // 1. Sécurité : vérifier que le chapitre appartient bien à ce cours
        const chapterOwner = await prisma.chapter.findUnique({
            where: {
                id: chapterId,
                courseId: courseId,
            }
        });

        if (!chapterOwner) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 2. Suppression en cascade
        // Grâce au onDelete: Cascade dans ton schéma Prisma, cela supprimera
        // automatiquement toutes les leçons liées à ce chapitre.
        const deletedChapter = await prisma.chapter.delete({
            where: {
                id: chapterId,
            }
        });

        return NextResponse.json(deletedChapter, { status: 200 });

    } catch (error) {
        console.error("Error deleting chapter:", error);
        return NextResponse.json(
            { error: "An error occurred while deleting the chapter." },
            { status: 500 }
        );
    }
}