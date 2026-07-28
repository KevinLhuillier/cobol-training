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

        // 1. On récupère le chapitre pour connaître sa position AVANT de le supprimer
        const chapterToDelete = await prisma.chapter.findUnique({
            where: {
                id: chapterId,
                courseId: courseId,
            }
        });

        if (!chapterToDelete) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        // 2. On supprime le chapitre
        const deletedChapter = await prisma.chapter.delete({
            where: {
                id: chapterId,
            }
        });

        // 3. LA MAGIE PRISMA : On recalcule les positions des chapitres suivants
        await prisma.chapter.updateMany({
            where: {
                courseId: courseId,
                position: {
                    gt: chapterToDelete.position, // "gt" = greater than (strictement supérieur à)
                }
            },
            data: {
                position: {
                    decrement: 1, // Baisse la position de 1 pour combler le trou
                }
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