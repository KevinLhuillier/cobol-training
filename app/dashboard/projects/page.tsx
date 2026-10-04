import { redirect } from "next/navigation";
import { FolderKanban } from "lucide-react";
import { CourseGrid } from "@/components/courses/course-grid";
import { createClient } from "@/utils/supabase/server";

// Menu "Projects" : les cours de type PROJECT (cf. migration add_course_kind), avec exactement
// les mêmes cartes, la même progression et le même lecteur que le menu "Courses" (/dashboard).
export default async function ProjectsPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return redirect("/auth/login");
    }

    const [{ data: profile }, { data: rawProjects, error }] = await Promise.all([
        supabase
            .from("users")
            .select("subscription_status, trial_ends_at, mainframe_ends_at")
            .eq("id", user.id)
            .single(),
        supabase
            .from("courses")
            .select(`
                id,
                title,
                description,
                imageUrl:image_url,
                isFree:is_free,
                chapters (
                    id,
                    position,
                    isFree:is_free,
                    lessons (
                        id,
                        position,
                        isFree:is_free,
                        lessonProgress:lesson_progress (
                            isCompleted:is_completed,
                            userId:user_id
                        )
                    )
                )
            `)
            .eq("is_published", true)
            .eq("kind", "PROJECT")
            // Seuls les chapitres et leçons publiés comptent dans la progression
            .eq("chapters.is_published", true)
            .eq("chapters.lessons.is_published", true)
            .order("position", { ascending: true }),
    ]);

    if (error) {
        console.error("Erreur récupération projets:", error);
    }

    const subscriptionInfo = {
        subscription_status: profile?.subscription_status ?? null,
        trial_ends_at: profile?.trial_ends_at ?? null,
        mainframe_ends_at: profile?.mainframe_ends_at ?? null,
    };

    // Tri des chapitres et leçons par position (même traitement que app/dashboard/page.tsx)
    const projects = (rawProjects || []).map((project) => ({
        ...project,
        chapters: [...project.chapters]
            .sort((a, b) => a.position - b.position)
            .map((chapter) => ({
                ...chapter,
                lessons: [...chapter.lessons].sort((a, b) => a.position - b.position),
            })),
    }));

    return (
        <>
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900">Projects</h2>
                <p className="text-slate-500 mt-1">Put your skills into practice with hands-on projects.</p>
            </div>

            {projects.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center shadow-sm">
                    <FolderKanban className="h-10 w-10 text-slate-400 mx-auto mb-3" />
                    <h3 className="text-lg font-bold text-slate-900">No projects available</h3>
                    <p className="text-sm text-slate-500 mt-1">Projects will appear here soon.</p>
                </div>
            ) : (
                <CourseGrid courses={projects} subscriptionInfo={subscriptionInfo} kind="PROJECT" />
            )}
        </>
    );
}
