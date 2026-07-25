import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import { cookies } from "next/headers";
import {prisma} from "@/prisma/client";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json({ error: "Email et mot de passe requis." }, { status: 400 });
        }

        // 1. Chercher l'utilisateur
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return NextResponse.json({ error: "Identifiants incorrects." }, { status: 401 });
        }

        // 2. Vérifier le mot de passe
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash!);

        if (!isPasswordValid) {
            return NextResponse.json({ error: "Identifiants incorrects." }, { status: 401 });
        }

        // 3. Préparer la clé secrète pour le JWT
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);

        // 4. Créer le JWT (valable 7 jours)
        const token = await new SignJWT({
            userId: user.id,
            email: user.email,
            role: user.role // Optionnel: utile si tu as un rôle ADMIN/USER
        })
            .setProtectedHeader({ alg: "HS256" })
            .setIssuedAt()
            .setExpirationTime("7d")
            .sign(secret);

        const cookieStore = await cookies();
        cookieStore.set({
            name: "session_token",
            value: token,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24 * 7, // 7 jours en secondes
        });

        return NextResponse.json({ message: "Connexion réussie." }, { status: 200 });
    } catch (error) {
        console.error("Erreur lors de la connexion :", error);
        return NextResponse.json({ error: "Erreur interne du serveur." }, { status: 500 });
    }
}