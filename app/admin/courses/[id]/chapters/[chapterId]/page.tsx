import { prisma } from "@/prisma/client";
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

export default async function ChapterDetailsPage({
                                                     params
                                                 }: {
    params: { id: string; chapterId: string }
}) {
    // 1. Fetch the chapter and its lessons
    const chapter = await prisma.chapter.findUnique({
        where: {
            id: params.chapterId,
            courseId: params.id // Ensures the chapter actually belongs to this course
        },
        include: {
            lessons: {
                orderBy: {
                    position: 'asc'
                }
            }
        }
    });

    // 2. 404 if not found
    if (!chapter) {
        return notFound();
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans p-4 md:p-6 lg:p-8">
            <div className="max-w-5xl mx-auto">

                {/* HEADER */}
                <div className="mb-8 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Link
                            href={`/admin/courses/${params.id}`}
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

                    {/* LEFT COLUMN: Chapter Details */}
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

                    {/* RIGHT COLUMN: Lessons */}
                    <div className="space-y-8">
                        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6">
                            <div className="flex items-start justify-between mb-6">
                                <div className="flex items-center gap-2 text-slate-900 font-bold text-lg">
                                    <div className="h-8 w-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                                        <Video className="h-4 w-4" />
                                    </div>
                                    Lessons
                                </div>

                                {/* Future LessonForm will go here */}
                                <button className="inline-flex items-center justify-center bg-slate-50 hover:bg-slate-100 text-slate-900 rounded-xl h-9 px-4 text-sm font-bold transition-colors">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Lesson
                                </button>
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
                                                    <button className="p-1.5 text-slate-400 hover:text-slate-900 transition-colors rounded-md hover:bg-slate-200">
                                                        <Pencil className="h-3.5 w-3.5" />
                                                    </button>
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