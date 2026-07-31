import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/client";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ progressId: string }> }
) {
    try {
        const resolvedParams = await params;
        const { progressId } = resolvedParams;
        const { status, feedback } = await request.json();

        // 1. Vérification de la session
        const cookieStore = await cookies();
        const token = cookieStore.get("session_token")?.value;

        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        let userId: string;
        try {
            const secret = new TextEncoder().encode(process.env.JWT_SECRET);
            const { payload } = await jwtVerify(token, secret);
            userId = payload.userId as string;
            if (!userId) throw new Error();

            // 🟢 ICI : Tu pourrais ajouter une vérification pour t'assurer
            // que ce userId correspond bien à un rôle ADMIN
        } catch (error) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 2. Mise à jour de la base de données
        const isApproved = status === "APPROVED";

        const updatedProgress = await prisma.lessonProgress.update({
            where: {
                id: progressId
            },
            data: {
                exerciseStatus: status,
                isCompleted: isApproved,
                reviewFeedback: feedback,
            }
        });

        return NextResponse.json(updatedProgress, { status: 200 });
    } catch (error) {
        console.error("Error updating review:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}