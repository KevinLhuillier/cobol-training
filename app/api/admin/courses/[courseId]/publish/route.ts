import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/client";

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ courseId: string }> }
) {
    try {
        const resolvedParams = await params;
        const { courseId } = resolvedParams;

        // 1. On récupère le cours actuel
        const course = await prisma.course.findUnique({
            where: { id: courseId },
        });

        if (!course) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        // 2. On inverse son statut (s'il était publié, il passe en brouillon, et inversement)
        const updatedCourse = await prisma.course.update({
            where: { id: courseId },
            data: { isPublished: !course.isPublished },
        });

        return NextResponse.json(updatedCourse, { status: 200 });

    } catch (error) {
        console.error("Error publishing course:", error);
        return NextResponse.json(
            { error: "An error occurred." },
            { status: 500 }
        );
    }
}