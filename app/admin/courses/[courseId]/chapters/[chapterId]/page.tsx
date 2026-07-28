import { prisma } from "@/prisma/client"; // Assure-toi que c'est le bon chemin pour ton client Prisma
import { notFound } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
    ArrowLeft,
    LayoutDashboard,
    Video,
    Pencil,
    Plus,
    GripVertical
} from "lucide-react";
import LessonForm from "@/components/courses/lesson-form";

export default async function ChapterDetailsPage({
                                                     params
                                                 }: {
    params: Promise<{ courseId: string; chapterId: string }>
}) {

    // 1. On "attend" la résolution de la promesse params
    const resolvedParams = await params;
    const { courseId, chapterId } = resolvedParams;

    // 2. Fetch the chapter and its lessons
    const chapter = await prisma.chapter.findUnique({
        where: {
            id: chapterId,
            courseId: courseId // Ensures the chapter actually belongs to this course
        },
        include: {
            lessons: {
                orderBy: {
                    position: 'asc'
                }
            }
        }
    });

    // 3. 404 if not found
    if (!chapter) {
        return notFound();
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans p-4 md:p-6 lg:p-8">
            <div className="max-w-5xl mx-auto">

                {/* EN TÊTE */}
                <div className="mb-8 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        {/* Bouton retour vers la page du cours */}
                        <Link
                            href={`/admin/courses/${courseId}`}
                            className="h-10 w-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-sm"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                                Chapter Setup
                            </h1>
                            <p className="text-sm text-slate-500">
                                Manage your chapter title and add video lessons.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* COLONNE GAUCHE: Détails du chapitre */}
                    <div className="space-y-8">
                        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-2 text-slate-900 font-bold text-lg">
                                    <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                                        <LayoutDashboard className="h-4 w-4" />
                                    </div>
                                    Customize chapter
                                </div>
                                <button className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors">
                                    <Pencil className="h-4 w-4" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm font-bold text-slate-500 mb-1">Chapter Title</p>
                                    <p className="text-slate-900 font-medium">{chapter.title}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* COLONNE DROITE: Les leçons (vidéos) */}
                    <div className="space-y-8">
                        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6">
                            <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
                                <div className="flex items-center gap-2 text-slate-900 font-bold text-lg shrink-0">
                                    <div className="h-8 w-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                                        <Video className="h-4 w-4" />
                                    </div>
                                    Lessons
                                </div>

                                <LessonForm courseId={courseId} chapterId={chapterId} />
                            </div>

                            {chapter.lessons.length === 0 ? (
                                <p className="text-sm text-slate-500 italic text-center py-6">
                                    No lessons yet. Add a video or text lesson to get started.
                                </p>
                            ) : (
                                <div className="space-y-3 mt-4">
                                    {chapter.lessons.map((lesson) => (
                                        <div
                                            key={lesson.id}
                                            className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <GripVertical className="h-5 w-5 text-slate-400 cursor-grab hover:text-slate-600" />
                                                <span className="font-bold text-slate-900 text-sm">{lesson.title}</span>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                {lesson.isFreePreview && (
                                                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 border-none">
                                                        Free Preview
                                                    </Badge>
                                                )}
                                                <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Link
                                                        href={`/admin/courses/${courseId}/chapters/${chapterId}/lessons/${lesson.id}`}
                                                        className="p-1.5 text-slate-400 hover:text-slate-900 transition-colors rounded-md hover:bg-slate-200"
                                                    >
                                                        <Pencil className="h-3.5 w-3.5" />
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}