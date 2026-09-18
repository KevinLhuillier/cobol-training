import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ListChecks } from "lucide-react";
import { ChapterForm } from "@/components/courses/chapter-form";
import { ChapterList } from "@/components/courses/chapter-list";
import { CoursePublishButton } from "@/components/courses/course-publish-button";
import { CourseFreeToggleButton } from "@/components/courses/course-free-toggle-button";
import { CourseDetailsForm } from "@/components/courses/course-details-form";
import { CourseImageForm } from "@/components/courses/course-image-form";
import { CourseBadgeForm } from "@/components/courses/course-badge-form";

// 🟢 Import du client serveur Supabase
import { createClient } from "@/utils/supabase/server";

export default async function CourseDetailsPage({ params }: { params: Promise<any> }) {
    const supabase = await createClient();

    // 1. SÉCURITÉ
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return redirect("/auth/login");

    const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single();
    if (!profile || profile.role !== "ADMIN") return redirect("/dashboard");

    // 2. RÉSOLUTION DES PARAMÈTRES (Accepte [id] ou [courseId])
    const resolvedParams = await params;
    const actualId = resolvedParams.courseId || resolvedParams.id;

    // 3. FETCH : On extrait explicitement l'erreur !
    const { data: rawCourse, error } = await supabase
        .from("courses")
        .select(`
            id,
            title,
            description,
            isPublished:is_published,
            isFree:is_free,
            imageUrl:image_url,
            badges (
                id,
                name,
                description,
                icon
            ),
            chapters (
                id,
                title,
                position,
                isPublished:is_published,
                courseId:course_id
            )
        `)
        .eq("id", actualId)
        .maybeSingle();

    if (!rawCourse) {
        return notFound();
    }

    // 4. Tri des chapitres par position (Côté JS pour garantir l'ordre exact)
    // badges : relation 1-1 (course_id est UNIQUE) mais PostgREST peut tout de même la renvoyer
    // sous forme de tableau selon le sens d'embedding, d'où cette normalisation défensive.
    const rawBadge = Array.isArray(rawCourse.badges) ? rawCourse.badges[0] : rawCourse.badges;
    const course = {
        ...rawCourse,
        badge: rawBadge || null,
        chapters: rawCourse.chapters ? [...rawCourse.chapters].sort((a, b) => a.position - b.position) : []
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans p-4 md:p-6 lg:p-8">
            <div className="max-w-5xl mx-auto">

                {/* HEADER */}
                <div className="mb-8 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        {/* 🟢 Lien mis à jour vers le nouveau chemin */}
                        <Link
                            href="/dashboard/admin/courses"
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
                        {course.isFree && (
                            <Badge className="px-3 py-1.5 border-none font-bold shadow-sm bg-blue-100 text-blue-700">
                                Free
                            </Badge>
                        )}
                        <Badge
                            className={`px-3 py-1.5 border-none font-bold shadow-sm ${
                                course.isPublished
                                    ? "bg-emerald-100 text-emerald-700"
                                    : "bg-amber-100 text-amber-700"
                            }`}
                        >
                            {course.isPublished ? "Published" : "Draft"}
                        </Badge>
                        <CourseFreeToggleButton
                            courseId={course.id}
                            isFree={course.isFree}
                        />
                        <CoursePublishButton
                            courseId={course.id}
                            isPublished={course.isPublished}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* LEFT COLUMN: Course Details */}
                    <div className="space-y-8">

                        <CourseDetailsForm
                            courseId={course.id}
                            initialData={{ title: course.title, description: course.description }}
                        />

                        <CourseImageForm
                            courseId={course.id}
                            initialData={{ imageUrl: course.imageUrl }}
                        />

                        <CourseBadgeForm
                            courseId={course.id}
                            initialData={course.badge}
                        />

                    </div>

                    {/* RIGHT COLUMN: Chapters */}
                    <div className="space-y-8">
                        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6">

                            <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
                                <div className="flex items-center gap-2 text-slate-900 font-bold text-lg shrink-0">
                                    <ListChecks className="h-5 w-5 text-emerald-600" />
                                    Course Chapters
                                </div>
                                <div className="flex-1 flex justify-end min-w-[200px]">
                                    <ChapterForm courseId={course.id} />
                                </div>
                            </div>

                            <ChapterList items={course.chapters} courseId={course.id} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}