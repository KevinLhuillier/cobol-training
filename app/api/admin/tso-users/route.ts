import { NextResponse } from "next/server";
import { prisma } from "@/prisma/client";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { username, password } = body;

        if (!username || !password) {
            return new NextResponse("Missing username or password", { status: 400 });
        }

        // Vérifier si le nom d'utilisateur TSO existe déjà
        const existingUser = await prisma.tsoUser.findUnique({
            where: {
                username: username
            }
        });

        if (existingUser) {
            return new NextResponse("This TSO username already exists", { status: 400 });
        }

        // Création du compte (le statut 'AVAILABLE' est mis par défaut dans le schéma Prisma)
        const tsoUser = await prisma.tsoUser.create({
            data: {
                username,
                password,
            }
        });

        return NextResponse.json(tsoUser, { status: 201 });
    } catch (error) {
        console.error("[TSO_USERS_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}