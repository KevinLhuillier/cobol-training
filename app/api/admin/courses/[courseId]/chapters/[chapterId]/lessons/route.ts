import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/client"; // Ajuste le chemin si besoin (ex: "@/lib/prisma")

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ courseId: string; chapterId: string }> }
) {
    try {
        // 1. Déballage asynchrone des paramètres (Next.js 15)
        const resolvedParams = await params;
        const { courseId, chapterId } = resolvedParams;

        // 2. Récupération des données envoyées par le formulaire
        const { title, type } = await request.json();

        if (!title) {
            return NextResponse.json(
                { error: "The lesson title is required." },
                { status: 400 }
            );
        }

        // 3. Vérification de sécurité : le chapitre existe-t-il bien dans ce cours ?
        const chapterOwner = await prisma.chapter.findUnique({
            where: {
                id: chapterId,
                courseId: courseId,
            }
        });

        if (!chapterOwner) {
            return NextResponse.json(
                { error: "Chapter not found." },
                { status: 404 }
            );
        }

        // 4. Calcul de la position (on la place à la fin)
        const lastLesson = await prisma.lesson.findFirst({
            where: {
                chapterId: chapterId,
            },
            orderBy: {
                position: "desc",
            },
        });

        const newPosition = lastLesson ? lastLesson.position + 1 : 1;

        // 5. Création de la leçon
        const newLesson = await prisma.lesson.create({
            data: {
                title,
                chapterId,
                position: newPosition,
                type: type || "VIDEO",
            },
        });

        return NextResponse.json(newLesson, { status: 201 });

    } catch (error) {
        console.error("Error creating lesson:", error);
        return NextResponse.json(
            { error: "An error occurred while creating the lesson." },
            { status: 500 }
        );
    }
}