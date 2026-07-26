import { PrismaClient } from "./generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const isProduction = process.env.NODE_ENV === "production";

// 1. On encapsule toute la logique de création dans une fonction
const createPrismaClient = () => {
    const adapter = new PrismaMariaDb({
        host: process.env.DATABASE_HOST === "localhost" ? "127.0.0.1" : process.env.DATABASE_HOST,
        user: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_NAME,
        connectionLimit: 5,
        ...(isProduction && {
            ssl: {
                rejectUnauthorized: true,
            },
        }),
    });

    return new PrismaClient({ adapter });
};

// 2. On déclare l'espace global pour TypeScript
declare const globalThis: {
    prismaGlobal: ReturnType<typeof createPrismaClient>;
} & typeof global;

// 3. Si l'instance existe déjà en mémoire (Hot Reload), on la réutilise.
// Sinon, on appelle notre fonction pour la créer.
export const prisma = globalThis.prismaGlobal ?? createPrismaClient();

// 4. En mode développement, on sauvegarde l'instance dans la variable globale
if (process.env.NODE_ENV !== "production") {
    globalThis.prismaGlobal = prisma;
}