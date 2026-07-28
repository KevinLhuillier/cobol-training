import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/client";

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ courseId: string; chapterId: string }> }
) {
    try {
        const resolvedParams = await params;
        const { courseId, chapterId } = resolvedParams;
        const { list } = await request.json();

        // Sécurité : vérifier que le chapitre appartient bien au cours
        const chapterOwner = await prisma.chapter.findUnique({
            where: { id: chapterId, courseId: courseId }
        });

        if (!chapterOwner) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Mise à jour groupée des positions des leçons
        const transaction = list.map((item: { id: string, position: number }) => {
            return prisma.lesson.update({
                where: { id: item.id },
                data: { position: item.position }
            });
        });

        await prisma.$transaction(transaction);

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error("Error reordering lessons:", error);
        return NextResponse.json(
            { error: "An error occurred while reordering the lessons." },
            { status: 500 }
        );
    }
}