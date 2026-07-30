import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/client";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ courseId: string; chapterId: string; lessonId: string }> }
) {
    try {
        const resolvedParams = await params;
        const { lessonId } = resolvedParams;
        const { isCompleted, exerciseAnswer } = await request.json();

        // 1. Récupération du cookie de session
        const cookieStore = await cookies();
        const token = cookieStore.get("session_token")?.value;

        if (!token) {
            return NextResponse.json({ error: "Unauthorized - No token provided" }, { status: 401 });
        }

        let userId: string;

        // 2. Décodage et vérification du JWT avec jose
        try {
            const secret = new TextEncoder().encode(process.env.JWT_SECRET);
            const { payload } = await jwtVerify(token, secret);

            userId = payload.userId as string;

            if (!userId) {
                return NextResponse.json({ error: "Unauthorized - Invalid token payload" }, { status: 401 });
            }
        } catch (error) {
            console.error("Session invalide dans l'API :", error);
            return NextResponse.json({ error: "Unauthorized - Invalid or expired token" }, { status: 401 });
        }

        // 3. Préparation dynamique des données selon le type d'action
        const dataToUpdate: any = {};
        const dataToCreate: any = { userId, lessonId };

        if (exerciseAnswer !== undefined) {
            // 🟢 CAS 1 : Soumission d'un exercice
            dataToUpdate.exerciseAnswer = exerciseAnswer;
            dataToUpdate.exerciseStatus = "PENDING_REVIEW";
            dataToUpdate.isCompleted = false; // Reste faux tant que le formateur ne valide pas

            dataToCreate.exerciseAnswer = exerciseAnswer;
            dataToCreate.exerciseStatus = "PENDING_REVIEW";
            dataToCreate.isCompleted = false;
        } else if (isCompleted !== undefined) {
            // 🟢 CAS 2 : Validation d'une leçon standard (Vidéo)
            dataToUpdate.isCompleted = isCompleted;
            dataToCreate.isCompleted = isCompleted;
        }

        // 4. Mise à jour ou création de la progression
        const lessonProgress = await prisma.lessonProgress.upsert({
            where: {
                userId_lessonId: {
                    userId: userId,
                    lessonId: lessonId,
                }
            },
            update: dataToUpdate,
            create: dataToCreate
        });

        return NextResponse.json(lessonProgress, { status: 200 });
    } catch (error) {
        console.error("Error updating progress:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}