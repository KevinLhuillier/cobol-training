import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
    Terminal,
    Plus,
    BookOpen,
    Layers,
    PlayCircle,
    Pencil,
    Trash2,
    Settings
} from "lucide-react";
import { prisma } from "@/prisma/client"; // Assure-toi que ce chemin correspond à ton Singleton Prisma

export default async function AdminDashboardPage() {
    // 1. Fetch real courses from the database, including counts for chapters and lessons
    const courses = await prisma.course.findMany({
        include: {
            chapters: {
                include: {
                    _count: {
                        select: { lessons: true }
                    }
                }
            },
            _count: {
                select: { chapters: true }
            }
        },
        orderBy: {
            updatedAt: 'desc' // Most recently updated courses first
        }
    });

    // 2. Calculate global statistics
    const totalCourses = courses.length;
    const totalChapters = courses.reduce((acc, course) => acc + course._count.chapters, 0);
    const totalLessons = courses.reduce(
        (acc, course) => acc + course.chapters.reduce((sum, chapter) => sum + chapter._count.lessons, 0),
        0
    );

    return (
        <div className="min-h-screen bg-slate-50 font-sans p-4 md:p-6 lg:p-8">

            {/* ADMIN HEADER */}
            <header className="max-w-[1200px] w-full mx-auto mb-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-slate-900 rounded-xl flex items-center justify-center shadow-md">
                        <Settings className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                            Administration
                        </h1>
                        <p className="text-sm text-slate-500">Code Legacy Course Management</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Link
                        href="/dashboard"
                        className="text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors px-4 py-2"
                    >
                        Back to website
                    </Link>

                    {/* 🟢 NOUVEAU LIEN : Comptes TSO */}
                    <Link
                        href="/admin/users-tso"
                        className="inline-flex items-center justify-center bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-xl shadow-sm h-10 px-4 text-sm font-medium transition-colors"
                    >
                        <Terminal className="mr-2 h-4 w-4 text-slate-500" />
                        Comptes TSO
                    </Link>

                    <Link
                        href="/admin/courses/new"
                        className="inline-flex items-center justify-center bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-sm h-10 px-5 text-sm font-medium transition-colors"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        New Course
                    </Link>
                </div>
            </header>

            <main className="max-w-[1200px] w-full mx-auto">

                {/* QUICK STATS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
                        <div className="h-12 w-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                            <BookOpen className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-500">Total Courses</p>
                            <p className="text-2xl font-extrabold text-slate-900">{totalCourses}</p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
                        <div className="h-12 w-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                            <Layers className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-500">Chapters</p>
                            <p className="text-2xl font-extrabold text-slate-900">{totalChapters}</p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
                        <div className="h-12 w-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600">
                            <PlayCircle className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-500">Lessons</p>
                            <p className="text-2xl font-extrabold text-slate-900">{totalLessons}</p>
                        </div>
                    </div>
                </div>

                {/* COURSES LIST */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-6 border-b border-slate-100">
                        <h2 className="text-lg font-bold text-slate-900">Your Courses</h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                            <tr className="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-wider">
                                <th className="p-4 font-bold">Course Title</th>
                                <th className="p-4 font-bold">Status</th>
                                <th className="p-4 font-bold text-center">Structure</th>
                                <th className="p-4 font-bold text-right">Actions</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                            {courses.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-slate-500">
                                        No courses found. Click &quot;New Course&quot; to create one.
                                    </td>
                                </tr>
                            ) : (
                                courses.map((course) => {
                                    const courseLessonsCount = course.chapters.reduce((sum, chapter) => sum + chapter._count.lessons, 0);

                                    return (
                                        <tr key={course.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="p-4">
                                                <p className="font-bold text-slate-900">{course.title}</p>
                                                <p className="text-xs text-slate-500 mt-1">
                                                    Updated: {new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(course.updatedAt)}
                                                </p>
                                            </td>
                                            <td className="p-4">
                                                <Badge
                                                    className={`border-none ${
                                                        course.isPublished
                                                            ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                                                            : "bg-amber-100 text-amber-700 hover:bg-amber-100"
                                                    }`}
                                                >
                                                    {course.isPublished ? "Published" : "Draft"}
                                                </Badge>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center justify-center gap-4 text-sm text-slate-600 font-medium">
                            <span className="flex items-center gap-1" title="Chapters">
                              <Layers className="h-4 w-4 text-slate-400" />
                                {course._count.chapters}
                            </span>
                                                    <span className="flex items-center gap-1" title="Lessons">
                              <PlayCircle className="h-4 w-4 text-slate-400" />
                                                        {courseLessonsCount}
                            </span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link
                                                        href={`/admin/courses/${course.id}`}
                                                        className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                                                        title="Edit course"
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Link>
                                                    {/* Le bouton supprimer nécessitera un composant client plus tard, on le garde en UI pour le moment */}
                                                    <button
                                                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </main>
        </div>
    );
}