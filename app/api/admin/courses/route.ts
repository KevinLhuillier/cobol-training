import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/client"; // Adjust this path to your prisma singleton

export async function POST(request: NextRequest) {
    try {
        // In a real application, you should verify the JWT here
        // to ensure the user is an ADMIN before allowing course creation.

        const body = await request.json();
        const { title, description, imageUrl } = body;

        // Basic validation
        if (!title) {
            return NextResponse.json(
                { error: "The course title is required." },
                { status: 400 }
            );
        }

        // Insert into the database
        const newCourse = await prisma.course.create({
            data: {
                title,
                description: description || null,
                imageUrl: imageUrl || null,
                isPublished: false, // Hidden by default (from your schema)
            },
        });

        return NextResponse.json(newCourse, { status: 201 });

    } catch (error) {
        console.error("Error creating course:", error);
        return NextResponse.json(
            { error: "An error occurred while creating the course." },
            { status: 500 }
        );
    }
}