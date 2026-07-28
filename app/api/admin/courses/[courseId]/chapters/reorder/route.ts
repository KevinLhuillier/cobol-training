import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/client";

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ courseId: string }> }
) {
    try {
        const resolvedParams = await params;
        const { courseId } = resolvedParams;

        // On s'attend à recevoir un tableau d'objets { id, position }
        const { list } = await request.json();

        // Sécurité : vérifier que le cours existe
        const courseOwner = await prisma.course.findUnique({
            where: { id: courseId }
        });

        if (!courseOwner) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // On utilise une transaction Prisma pour mettre à jour tous les chapitres d'un coup.
        // Si une mise à jour échoue, tout est annulé.
        const transaction = list.map((item: { id: string, position: number }) => {
            return prisma.chapter.update({
                where: { id: item.id },
                data: { position: item.position }
            });
        });

        await prisma.$transaction(transaction);

        return NextResponse.json({ success: true }, { status: 200 });

    } catch (error) {
        console.error("Error reordering chapters:", error);
        return NextResponse.json(
            { error: "An error occurred while reordering the chapters." },
            { status: 500 }
        );
    }
}