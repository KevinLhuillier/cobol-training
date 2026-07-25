import { NextResponse } from "next/server";
import {prisma} from "@/prisma/client";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, email, password } = body;

        // 1. Validation basique
        if (!name || !email || !password) {
            return NextResponse.json(
                { error: "Tous les champs sont requis." },
                { status: 400 }
            );
        }

        if (password.length < 8) {
            return NextResponse.json(
                { error: "Le mot de passe doit faire au moins 8 caractères." },
                { status: 400 }
            );
        }

        // 2. Vérifier si l'utilisateur existe déjà
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: "Cette adresse e-mail est déjà utilisée." },
                { status: 409 }
            );
        }

        // 3. Hacher le mot de passe
        const hashedPassword = await bcrypt.hash(password, 10);

        // 4. Créer l'utilisateur en base
        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                passwordHash: hashedPassword,
                // Le rôle "USER" est défini par défaut dans ton schema.prisma
            },
        });

        return NextResponse.json(
            { message: "Compte créé avec succès." },
            { status: 201 }
        );
    } catch (error) {
        console.error("Erreur lors de l'inscription :", error);
        return NextResponse.json(
            { error: "Une erreur est survenue lors de la création du compte." },
            { status: 500 }
        );
    } finally {
        // Bonne pratique : fermer la connexion si on n'utilise pas de Singleton
        await prisma.$disconnect();
    }
}