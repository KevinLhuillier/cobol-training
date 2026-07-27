import { prisma } from "@/prisma/client";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
    ArrowLeft,
    LayoutDashboard,
    ListChecks,
    Image as ImageIcon,
    Pencil,
    Trash2,
    GripVertical
} from "lucide-react";
import { ChapterForm } from "./_components/chapter-form";

// Server Component to fetch and display course data
// On type params comme une Promesse (Standard Next.js 15)
export default async function CourseDetailsPage({ params }: { params: Promise<{ id: string }> }) {

    // 1. On "attend" la résolution des paramètres de l'URL
    const resolvedParams = await params;

    // 2. On utilise l'ID résolu (Si ton dossier s'appelle [courseId], change en resolvedParams.courseId)
    const course = await prisma.course.findUnique({
        where: {
            id: resolvedParams.id
        },
        include: {
            chapters: {
                orderBy: {
                    position: 'asc'
                }
            }
        }
    });

    // 2. If the course doesn't exist, show a 404 page
    if (!course) {
        return notFound();
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans p-4 md:p-6 lg:p-8">
            <div className="max-w-5xl mx-auto">

                {/* HEADER */}
                <div className="mb-8 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/admin"
                            className="h-10 w-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-sm"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                                Course Setup
                            </h1>
                            <p className="text-sm text-slate-500">
                                Complete all fields and add chapters to publish your course.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Badge
                            className={`px-3 py-1.5 border-none font-bold shadow-sm ${
                                course.isPublished
                                    ? "bg-emerald-100 text-emerald-700"
                                    : "bg-amber-100 text-amber-700"
                            }`}
                        >
                            {course.isPublished ? "Published" : "Draft"}
                        </Badge>
                        <button className="h-10 px-4 rounded-xl font-bold text-white bg-slate-900 hover:bg-slate-800 transition-colors shadow-sm">
                            {course.isPublished ? "Unpublish" : "Publish"}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* LEFT COLUMN: Course Details */}
                    <div className="space-y-8">

                        {/* Title & Description Card */}
                        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-2 text-slate-900 font-bold text-lg">
                                    <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                                        <LayoutDashboard className="h-4 w-4" />
                                    </div>
                                    Customize your course
                                </div>
                                <button className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors">
                                    <Pencil className="h-4 w-4" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm font-bold text-slate-500 mb-1">Course Title</p>
                                    <p className="text-slate-900 font-medium">{course.title}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-500 mb-1">Description</p>
                                    <p className="text-slate-700 text-sm leading-relaxed">
                                        {course.description || <span className="text-slate-400 italic">No description provided.</span>}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Image Card */}
                        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-2 text-slate-900 font-bold text-lg">
                                    <div className="h-8 w-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                                        <ImageIcon className="h-4 w-4" />
                                    </div>
                                    Course Image
                                </div>
                                <button className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors">
                                    <Pencil className="h-4 w-4" />
                                </button>
                            </div>

                            {course.imageUrl ? (
                                <div className="aspect-video w-full rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={course.imageUrl} alt="Course cover" className="w-full h-full object-cover" />
                                </div>
                            ) : (
                                <div className="aspect-video w-full rounded-xl bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400">
                                    <ImageIcon className="h-8 w-8 mb-2 opacity-50" />
                                    <p className="text-sm font-medium">No image uploaded</p>
                                </div>
                            )}
                        </div>

                    </div>

                    {/* RIGHT COLUMN: Chapters */}
                    <div className="space-y-8">

                        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6">
                            <div className="flex items-start justify-between mb-6">
                                <div className="flex items-center gap-2 text-slate-900 font-bold text-lg">
                                    <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                                        <ListChecks className="h-4 w-4" />
                                    </div>
                                    Course Chapters
                                </div>

                                {/* Client Component injected here! */}
                                <ChapterForm courseId={course.id} />
                            </div>

                            {course.chapters.length === 0 ? (
                                <p className="text-sm text-slate-500 italic text-center py-6">
                                    No chapters yet. Add your first chapter to structure your course.
                                </p>
                            ) : (
                                <div className="space-y-3 mt-4">
                                    {course.chapters.map((chapter) => (
                                        <div
                                            key={chapter.id}
                                            className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <GripVertical className="h-5 w-5 text-slate-400 cursor-grab hover:text-slate-600" />
                                                <span className="font-bold text-slate-900 text-sm">{chapter.title}</span>
                                            </div>

                                            <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button className="p-1.5 text-slate-400 hover:text-slate-900 transition-colors rounded-md hover:bg-slate-200">
                                                    <Pencil className="h-3.5 w-3.5" />
                                                </button>
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