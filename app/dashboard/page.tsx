import { redirect } from "next/navigation";
import { Terminal, Lock, BookOpen } from "lucide-react";

// 🟢 Import du client serveur Supabase
import { createClient } from "@/utils/supabase/server";
import { ensureTrialStarted, triggerWelcomeEmailAction } from "@/app/actions/auth";
import { hasActiveAccess, hasCourseAccess, isLifetimeStatus } from "@/utils/subscription";
import { TsoUnlockButton } from "@/components/tso-unlock-button";
import { SubscribeButton } from "@/components/subscribe-button";
import { OnboardingTour } from "@/components/onboarding/onboarding-tour";
import { NewBadgeDialog } from "@/components/badges/new-badge-dialog";
import { CourseGrid } from "@/components/courses/course-grid";

export default async function DashboardPage() {
    const supabase = await createClient();

    // 1. Authentification : Récupération de l'utilisateur
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return redirect("/auth/login");
    }

    // Filets de sécurité (idempotents côté DB) : démarre l'essai et envoie l'email de bienvenue
    // s'ils n'ont pas déjà été déclenchés par la page de login (l'appel client juste après le
    // signIn peut échouer silencieusement en cas de souci de session/réseau).
    await ensureTrialStarted();
    // isFirstVisit ne peut être vrai que pour l'un des deux rendus concurrents (prefetch +
    // navigation) grâce au claim atomique interne — cf. le commentaire dans triggerWelcomeEmailAction.
    // C'est ce même signal qui déclenche le parcours d'onboarding ci-dessous.
    const { isFirstVisit } = await triggerWelcomeEmailAction();

    // 2. Récupération du profil (statut d'abonnement), du compte TSO actif et des badges
    // débloqués mais pas encore vus (seen_at IS NULL -> déclenche la pop-up ci-dessous, une
    // seule fois, cf. components/badges/new-badge-dialog.tsx).
    const [{ data: profile }, { data: tsoAccount }, { data: rawNewBadges }] = await Promise.all([
        supabase
            .from("users")
            .select("name, subscription_status, trial_ends_at, mainframe_ends_at")
            .eq("id", user.id)
            .single(),
        supabase
            .from("tso_users")
            .select("username, password, host, port")
            .eq("assigned_to_user_id", user.id)
            .eq("status", "ASSIGNED")
            .maybeSingle(),
        supabase
            .from("user_badges")
            .select(`
                id,
                badge:badges (
                    name,
                    description,
                    icon,
                    course:courses ( title )
                )
            `)
            .eq("user_id", user.id)
            .is("seen_at", null)
            .order("unlocked_at", { ascending: true }),
    ]);

    const newBadges = (rawNewBadges || []).flatMap((row) => {
        const badge = Array.isArray(row.badge) ? row.badge[0] : row.badge;
        if (!badge) return [];
        const course = Array.isArray(badge.course) ? badge.course[0] : badge.course;
        return [{
            userBadgeId: row.id,
            name: badge.name as string,
            description: badge.description as string | null,
            icon: badge.icon as string,
            courseTitle: course?.title || "your course",
        }];
    });

    const subscriptionInfo = {
        subscription_status: profile?.subscription_status ?? null,
        trial_ends_at: profile?.trial_ends_at ?? null,
        mainframe_ends_at: profile?.mainframe_ends_at ?? null,
    };
    const canUnlockTso = hasActiveAccess(subscriptionInfo);
    const hasTsoStep = canUnlockTso && !tsoAccount;

    // 3. Récupération des cours AVEC la progression
    // On utilise des alias (ex: imageUrl:image_url) pour conserver le camelCase attendu par ton UI
    const { data: rawCourses } = await supabase
        .from("courses")
        .select(`
            id,
            title,
            description,
            imageUrl:image_url,
            isPublished:is_published,
            isFree:is_free,
            chapters (
                id,
                position,
                lessons (
                    id,
                    position,
                    lessonProgress:lesson_progress (
                        isCompleted:is_completed,
                        userId:user_id
                    )
                )
            )
        `)
        .eq("is_published", true)
        // Les projets (kind = PROJECT) sont listés dans le menu Projects (cf. app/dashboard/projects)
        .eq("kind", "COURSE")
        // Seuls les chapitres et leçons publiés comptent dans la progression (le cours est conservé même sans contenu)
        .eq("chapters.is_published", true)
        .eq("chapters.lessons.is_published", true)
        .order("position", { ascending: true });

    // 4. Tri des chapitres et leçons par position (PostgREST ne garantit pas l'ordre des relations imbriquées sans syntaxe complexe)
    const courses = rawCourses?.map(course => {
        const sortedChapters = [...course.chapters].sort((a, b) => a.position - b.position).map(chapter => {
            return {
                ...chapter,
                lessons: [...chapter.lessons].sort((a, b) => a.position - b.position)
            };
        });
        return { ...course, chapters: sortedChapters };
    }) || [];

    // Étape "course" du parcours d'onboarding : uniquement pertinente si un premier module est
    // affiché et accessible (sinon son bouton "Start" n'existe pas — cf. rendu ci-dessous).
    const hasCourseStep = courses.length > 0 && hasCourseAccess({ isFree: courses[0].isFree }, subscriptionInfo);

    return (
        <>
            <OnboardingTour
                active={isFirstVisit}
                studentName={profile?.name || "Student"}
                hasTsoStep={hasTsoStep}
                hasCourseStep={hasCourseStep}
            />

            <NewBadgeDialog badges={newBadges} />

            {/* TSO ACCESS CARD */}
            <div className="mb-10 bg-slate-900 rounded-[2rem] p-6 md:p-8 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-slate-800">
                <div className="flex items-center gap-4">
                    <div className="h-14 w-14 bg-slate-800 rounded-xl flex items-center justify-center border border-slate-700 shrink-0">
                        <Terminal className="h-7 w-7 text-emerald-400" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">Your Mainframe Access (TSO)</h2>
                        <p className="text-slate-400 text-sm mt-1">
                            Use these credentials to connect to the mainframe.
                        </p>
                    </div>
                </div>

                {tsoAccount ? (
                    <div className="flex flex-wrap items-center gap-4 bg-slate-800 p-4 rounded-xl border border-slate-700 w-full md:w-auto">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">User ID</p>
                            <span className="font-mono text-emerald-400 font-bold bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-700 block">
                                {tsoAccount.username}
                            </span>
                        </div>
                        <div className="hidden sm:block h-10 w-px bg-slate-700"></div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Password</p>
                            <span className="font-mono text-white font-bold bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-700 block">
                                {tsoAccount.password}
                            </span>
                        </div>
                        {tsoAccount.host && (
                            <>
                                <div className="hidden sm:block h-10 w-px bg-slate-700"></div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Host</p>
                                    <span className="font-mono text-white font-bold bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-700 block">
                                        {tsoAccount.host}
                                    </span>
                                </div>
                            </>
                        )}
                        {tsoAccount.port && (
                            <>
                                <div className="hidden sm:block h-10 w-px bg-slate-700"></div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Port</p>
                                    <span className="font-mono text-white font-bold bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-700 block">
                                        {tsoAccount.port}
                                    </span>
                                </div>
                            </>
                        )}
                    </div>
                ) : canUnlockTso ? (
                    <TsoUnlockButton id="onboarding-tso-anchor" />
                ) : (
                    <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 w-full md:w-auto flex flex-col sm:flex-row items-center gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-slate-900 rounded-lg shrink-0">
                                <Lock className="h-5 w-5 text-slate-400" />
                            </div>
                            <p className="text-sm text-slate-300 font-medium">
                                {isLifetimeStatus(profile?.subscription_status ?? null)
                                    ? "Your Mainframe access has ended."
                                    : "Your trial has ended."}
                                <br/>
                                <span className="text-xs text-slate-400 font-normal">Upgrade to unlock a TSO account.</span>
                            </p>
                        </div>
                        <SubscribeButton />
                    </div>
                )}
            </div>

            {/* COURSES SECTION */}
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900">Resume Learning</h2>
                <p className="text-slate-500 mt-1">Here are the modules in your learning path.</p>
            </div>

            {courses.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center shadow-sm">
                    <BookOpen className="h-10 w-10 text-slate-400 mx-auto mb-3" />
                    <h3 className="text-lg font-bold text-slate-900">No courses available</h3>
                    <p className="text-sm text-slate-500 mt-1">Learning modules will appear here soon.</p>
                </div>
            ) : (
                <CourseGrid
                    courses={courses}
                    subscriptionInfo={subscriptionInfo}
                    kind="COURSE"
                    firstCardAnchorId="onboarding-course-anchor"
                />
            )}
        </>
    );
}