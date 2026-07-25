import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
    try {
        // Supprime le cookie qui contient le JWT
        const cookieStore = await cookies();
        cookieStore.delete("session_token");

        return NextResponse.json({ message: "Déconnexion réussie." }, { status: 200 });
    } catch (error) {
        console.error("Erreur lors de la déconnexion :", error);
        return NextResponse.json(
            { error: "Une erreur est survenue lors de la déconnexion." },
            { status: 500 }
        );
    }
}