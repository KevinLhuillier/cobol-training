import { NextResponse } from "next/server";
import { prisma } from "@/prisma/client";

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ tsoUserId: string }> }
) {
    try {
        const resolvedParams = await params;
        const { tsoUserId } = resolvedParams;

        const body = await req.json();
        const { password, status, assignedToUserId } = body;

        // Logique automatique pour le statut si on attribue/désattribue un utilisateur
        let finalStatus = status;
        if (assignedToUserId && status === "AVAILABLE") {
            finalStatus = "ASSIGNED";
        } else if (!assignedToUserId && status === "ASSIGNED") {
            finalStatus = "AVAILABLE";
        }

        const updatedTsoUser = await prisma.tsoUser.update({
            where: {
                id: tsoUserId,
            },
            data: {
                password,
                status: finalStatus,
                assignedToUserId: assignedToUserId || null, // Transforme une chaîne vide en null
            }
        });

        return NextResponse.json(updatedTsoUser);
    } catch (error) {
        console.error("[TSO_USER_PATCH]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ tsoUserId: string }> }
) {
    try {
        const resolvedParams = await params;
        const { tsoUserId } = resolvedParams;

        const deletedTsoUser = await prisma.tsoUser.delete({
            where: {
                id: tsoUserId,
            }
        });

        return NextResponse.json(deletedTsoUser);
    } catch (error) {
        console.error("[TSO_USER_DELETE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}