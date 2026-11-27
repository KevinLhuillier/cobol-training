import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft } from "lucide-react";
import { ChapterForm } from "@/components/courses/chapter-form";
import { ChapterList } from "@/components/courses/chapter-list";
import { CoursePublishButton } from "@/components/courses/course-publish-button";
import { FreeToggleButton } from "@/components/courses/free-toggle-button";
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
            kind,
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
                isFree:is_free,
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
        <div className="font-sans">
            <div className="max-w-6xl mx-auto">

                {/* HEADER */}
                <div className="mb-8 flex flex-col lg:flex-row lg:items-end justify-between gap-4">
                    <div className="flex items-center gap-4">
                        {/* 🟢 Lien mis à jour vers le nouveau chemin */}
                        <div>
<Link href="/dashboard/admin/courses" className="inline-flex items-center gap-1 text-[13px] font-semibold text-ui-accent hover:underline mb-2"><ChevronLeft className="h-4 w-4" />Courses</Link>
                            <h1 className="text-2xl md:text-[26px] font-bold text-slate-900 tracking-tight">{course.title}</h1>
                            <p className="mt-1 text-sm text-ui-muted">Course setup · 
                                Complete all fields and add chapters to publish your course.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {course.kind === "PROJECT" && (
                            <Badge className="px-2 py-0.5 rounded-md text-xs font-semibold border-none bg-rose-50 text-rose-800">
                                Project
                            </Badge>
                        )}
                        {course.isFree && (
                            <Badge className="px-2 py-0.5 rounded-md text-xs font-semibold border-none bg-ui-accent-soft text-ui-accent">
                                Free
                            </Badge>
                        )}
                        <Badge
                            className={`px-2 py-0.5 rounded-md text-xs font-semibold border-none ${
                                course.isPublished
                                    ? "bg-emerald-50 text-emerald-800"
                                    : "bg-amber-50 text-amber-800"
                            }`}
                        >
                            {course.isPublished ? "Published" : "Draft"}
                        </Badge>
                        <FreeToggleButton
                            table="courses"
                            id={course.id}
                            isFree={course.isFree}
                        />
                        <CoursePublishButton
                            courseId={course.id}
                            isPublished={course.isPublished}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">

                    {/* LEFT COLUMN: Course Details */}
                    <div className="lg:col-span-2 space-y-6">

                        <CourseDetailsForm
                            courseId={course.id}
                            initialData={{ title: course.title, description: course.description, kind: course.kind }}
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
                    <div className="lg:col-span-3 space-y-6 lg:sticky lg:top-6">
                        <div className="bg-white rounded-xl border border-ui-line p-6">

                            <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
                                <div className="flex items-center gap-2 text-slate-900 font-semibold text-base shrink-0">
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