import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/client"; // Adjust path if needed

export async function POST(
    request: NextRequest,
    { params }: { params: { courseId: string } }
) {
    try {
        // Note: In a real app, verify the admin JWT session here

        const { title } = await request.json();
        const { courseId } = params;

        // Basic validation
        if (!title) {
            return NextResponse.json(
                { error: "The chapter title is required." },
                { status: 400 }
            );
        }

        // Check if the course exists to avoid orphan chapters
        const courseOwner = await prisma.course.findUnique({
            where: {
                id: courseId,
            }
        });

        if (!courseOwner) {
            return NextResponse.json(
                { error: "Course not found." },
                { status: 404 }
            );
        }

        // Find the last chapter to calculate the new position
        const lastChapter = await prisma.chapter.findFirst({
            where: {
                courseId: courseId,
            },
            orderBy: {
                position: "desc", // Get the highest position
            },
        });

        // If there is a last chapter, add 1. Otherwise, it's the first chapter (position 1)
        const newPosition = lastChapter ? lastChapter.position + 1 : 1;

        // Create the new chapter
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