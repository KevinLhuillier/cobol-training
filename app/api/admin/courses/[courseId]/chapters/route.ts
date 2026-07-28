import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/client";

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ courseId: string }> } // 1. On type params comme une Promesse
) {
    try {
        // 2. On attend la résolution des paramètres avant de les utiliser
        const resolvedParams = await params;
        const courseId = resolvedParams.courseId;

        const { title } = await request.json();

        // Validation
        if (!title) {
            return NextResponse.json(
                { error: "The chapter title is required." },
                { status: 400 }
            );
        }

        // Vérification de l'existence du cours
        const courseOwner = await prisma.course.findUnique({
            where: {
                id: courseId, // Maintenant, courseId contient bien la vraie chaîne de caractères
            }
        });

        if (!courseOwner) {
            return NextResponse.json(
                { error: "Course not found." },
                { status: 404 }
            );
        }

        // Trouver le dernier chapitre pour calculer la position
        const lastChapter = await prisma.chapter.findFirst({
            where: {
                courseId: courseId,
            },
            orderBy: {
                position: "desc",
            },
        });

        const newPosition = lastChapter ? lastChapter.position + 1 : 1;

        // Création du chapitre
        const newChapter = await prisma.chapter.create({
            data: {
                title,
                courseId,
                position: newPosition,
            },
        });

        return NextResponse.json(newChapter, { status: 201 });

    } catch (error) {
        console.error("Error creating chapter:", error);
        return NextResponse.json(
            { error: "An error occurred while creating the chapter." },
            { status: 500 }
        );
    }
}