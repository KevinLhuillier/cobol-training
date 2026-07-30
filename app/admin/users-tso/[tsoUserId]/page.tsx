import { prisma } from "@/prisma/client";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Terminal } from "lucide-react";
import { TsoEditForm } from "@/components/tso-edit-form";

export default async function EditTsoUserPage({
                                                  params
                                              }: {
    params: Promise<{ tsoUserId: string }>
}) {
    const resolvedParams = await params;
    const { tsoUserId } = resolvedParams;

    // 1. Récupérer le compte TSO
    const tsoUser = await prisma.tsoUser.findUnique({
        where: { id: tsoUserId }
    });

    if (!tsoUser) {
        return notFound();
    }

    // 2. Récupérer tous les utilisateurs de l'application pour le menu déroulant
    const appUsers = await prisma.user.findMany({
        orderBy: { email: "asc" },
        select: { id: true, email: true }
    });

    return (
        <div className="min-h-screen bg-slate-50 font-sans p-4 md:p-6 lg:p-8">
            <div className="max-w-2xl mx-auto">

                {/* EN-TÊTE */}
                <div className="mb-8 flex items-center gap-4">
                    <Link
                        href="/admin/users-tso"
                        className="h-10 w-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-sm shrink-0"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                            Edit {tsoUser.username}
                        </h1>
                        <p className="text-sm text-slate-500">
                            Update credentials and assignments.
                        </p>
                    </div>
                </div>

                {/* CONTENEUR DU FORMULAIRE */}
                <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6 md:p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-2 text-slate-900 font-bold text-lg">
                            <div className="h-8 w-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
                                <Terminal className="h-4 w-4" />
                            </div>
                            Account Details
                        </div>
                        <span className="px-3 py-1 bg-slate-100 text-slate-600 font-mono text-sm rounded-lg font-bold">
                            {tsoUser.username}
                        </span>
                    </div>

                    {/* Appel de notre composant Client avec les données pré-chargées */}
                    <TsoEditForm
                        initialData={tsoUser}
                        users={appUsers}
                    />
                </div>

            </div>
        </div>
    );
}