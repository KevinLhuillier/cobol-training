import { prisma } from "@/prisma/client";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft,
    LayoutDashboard,
    PlaySquare
} from "lucide-react";
import { LessonTitleForm } from "@/components/courses/lesson-title-form";
import { LessonVideoForm } from "@/components/courses/lesson-video-form";
import {LessonDescriptionForm} from "@/components/courses/lesson-description-form";

export default async function LessonDetailsPage({
                                                    params
                                                }: {
    params: Promise<{ courseId: string; chapterId: string; lessonId: string }>
}) {

    const resolvedParams = await params;
    const { courseId, chapterId, lessonId } = resolvedParams;

    const lesson = await prisma.lesson.findUnique({
        where: {
            id: lessonId,
            chapterId: chapterId
        }
    });

    if (!lesson) {
        return notFound();
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans p-4 md:p-6 lg:p-8">
            <div className="max-w-5xl mx-auto">

                {/* EN TÊTE */}
                <div className="mb-8 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Link
                            href={`/admin/courses/${courseId}/chapters/${chapterId}`}
                            className="h-10 w-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-sm"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                                Lesson Setup
                            </h1>
                            <p className="text-sm text-slate-500">
                                Manage your lesson title and video content.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* COLONNE GAUCHE: Détails */}
                    <div className="space-y-8">
                        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6">
                            <div className="flex items-center gap-2 text-slate-900 font-bold text-lg mb-6">
                                <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                                    <LayoutDashboard className="h-4 w-4" />
                                </div>
                                Customize lesson
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm font-bold text-slate-500 mb-1">Lesson Title</p>
                                    {/* Composant dynamique pour le titre */}
                                    <LessonTitleForm
                                        initialData={lesson}
                                        courseId={courseId}
                                        chapterId={chapterId}
                                        lessonId={lessonId}
                                    />
                                </div>
                                <div>
                                    <LessonDescriptionForm
                                        initialData={lesson}
                                        courseId={courseId}
                                        chapterId={chapterId}
                                        lessonId={lessonId}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* COLONNE DROITE: Vidéo */}
                    <div className="space-y-8">
                        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6">
                            <div className="flex items-center gap-2 text-slate-900 font-bold text-lg mb-2">
                                <div className="h-8 w-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                                    <PlaySquare className="h-4 w-4" />
                                </div>
                                Lesson Media
                            </div>

                            {/* Composant dynamique pour l'URL vidéo */}
                            <LessonVideoForm
                                initialData={lesson}
                                courseId={courseId}
                                chapterId={chapterId}
                                lessonId={lessonId}
                            />
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}