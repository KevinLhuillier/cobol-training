import { redirect } from "next/navigation";
import Link from "next/link";
import { Terminal, Lock, BookOpen, Play } from "lucide-react";

// 🟢 Import du client serveur Supabase
import { createClient } from "@/utils/supabase/server";
import { ensureTrialStarted, triggerWelcomeEmailAction } from "@/app/actions/auth";
import { hasActiveAccess, hasAnyLessonAccess, isLifetimeStatus } from "@/utils/subscription";
import { TsoUnlockButton } from "@/components/tso-unlock-button";
import { SubscribeButton } from "@/components/subscribe-button";
import { OnboardingTour } from "@/components/onboarding/onboarding-tour";
import { NewBadgeDialog } from "@/components/badges/new-badge-dialog";
import { CourseGrid } from "@/components/courses/course-grid";
import { getFirstName } from "@/utils/first-name";

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
                isFree:is_free,
                lessons (
                    id,
                    title,
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
    const hasCourseStep = courses.length > 0 && hasAnyLessonAccess(courses[0], subscriptionInfo);

    // Carte "Continue where you left off" : premier module accessible commencé mais pas terminé,
    // avec la prochaine leçon non validée (même calcul que les cartes de CourseGrid).
    const inProgress = courses.flatMap((course) => {
        if (!hasAnyLessonAccess(course, subscriptionInfo)) return [];
        const lessons = course.chapters.flatMap((chapter) => chapter.lessons);
        const completed = lessons.filter((lesson) => lesson.lessonProgress?.[0]?.isCompleted).length;
        const nextLesson = lessons.find((lesson) => !lesson.lessonProgress?.[0]?.isCompleted);
        if (completed === 0 || !nextLesson) return [];
        return [{
            course,
            nextLesson,
            completed,
            total: lessons.length,
            progress: Math.round((completed / lessons.length) * 100),
        }];
    })[0];

    const tsoFields = tsoAccount
        ? [
              { label: "User ID", value: tsoAccount.username, highlight: true },
              { label: "Password", value: tsoAccount.password },
              ...(tsoAccount.host ? [{ label: "Host", value: tsoAccount.host }] : []),
              ...(tsoAccount.port ? [{ label: "Port", value: String(tsoAccount.port) }] : []),
          ]
        : [];

    return (
        <div className="flex flex-col gap-8">
            <OnboardingTour
                active={isFirstVisit}
                studentName={profile?.name || "Student"}
                hasTsoStep={hasTsoStep}
                hasCourseStep={hasCourseStep}
            />

            <NewBadgeDialog badges={newBadges} />

            <div>
                <h1 className="text-2xl md:text-[28px] font-bold text-slate-900 tracking-tight">
                    Welcome back, {getFirstName(profile?.name || "Student")}
                </h1>
                <p className="mt-1 text-sm text-ui-muted">Here&apos;s where you are in your learning path.</p>
            </div>

            {/* TSO ACCESS CARD */}
            <section aria-labelledby="tso-title" className="bg-ui-ink rounded-xl p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex items-center gap-4 lg:max-w-xs">
                    <div className="h-11 w-11 bg-emerald-400/10 rounded-lg flex items-center justify-center shrink-0">
                        <Terminal className="h-5 w-5 text-emerald-400" />
                    </div>
                    <div>
                        <h2 id="tso-title" className="text-[17px] font-semibold text-white">Your mainframe access</h2>
                        <p className="text-slate-400 text-sm mt-1">
                            Use these credentials to connect to the mainframe.
                        </p>
                    </div>
                </div>

                {tsoAccount ? (
                    <dl className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full lg:w-auto lg:min-w-[520px]">
                        {tsoFields.map((field) => (
                            <div key={field.label} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 min-w-0">
                                <dt className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{field.label}</dt>
                                <dd className={`mt-1 font-mono text-sm break-all ${field.highlight ? "text-emerald-400" : "text-white"}`}>
                                    {field.value}
                                </dd>
                            </div>
                        ))}
                    </dl>
                ) : canUnlockTso ? (
                    <TsoUnlockButton id="onboarding-tso-anchor" />
                ) : (
                    <div className="bg-white/5 border border-white/10 p-4 rounded-lg w-full lg:w-auto flex flex-col sm:flex-row items-center gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/5 rounded-lg shrink-0">
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
                        <SubscribeButton className="rounded-lg h-10 shadow-none" />
                    </div>
                )}
            </section>

            {/* CONTINUE WHERE YOU LEFT OFF */}
            {inProgress && (
                <section aria-labelledby="continue-title" className="bg-white rounded-xl border border-ui-line overflow-hidden flex flex-col md:flex-row">
                    <div className="relative md:w-[38%] min-h-44 bg-ui-accent-soft flex items-center justify-center">
                        {inProgress.course.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={inProgress.course.imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
                        ) : (
                            <Terminal className="h-10 w-10 text-ui-accent/50" />
                        )}
                        <span className="absolute top-4 left-4 bg-white px-2.5 py-1 rounded-md text-xs font-semibold text-slate-700">
                            In progress
                        </span>
                    </div>
                    <div className="flex-1 p-6 md:p-7 flex flex-col gap-4">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-ui-accent">Continue where you left off</p>
                            <h2 id="continue-title" className="mt-2 text-xl font-bold text-slate-900 tracking-tight">
                                {inProgress.course.title}
                            </h2>
                            <p className="mt-1.5 text-sm text-ui-muted">Next lesson: {inProgress.nextLesson.title}</p>
                        </div>
                        <div>
                            <div className="flex justify-between text-[13px] text-slate-600 mb-2">
                                <span>{inProgress.completed} of {inProgress.total} lessons</span>
                                <span className="font-semibold">{inProgress.progress}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-200/70 rounded-full overflow-hidden">
                                <div className="h-full rounded-full bg-ui-accent" style={{ width: `${inProgress.progress}%` }} />
                            </div>
                        </div>
                        <Link
                            href={`/dashboard/courses/${inProgress.course.id}?lessonId=${inProgress.nextLesson.id}`}
                            className="self-start mt-1 inline-flex items-center gap-2 h-11 px-5 rounded-lg bg-ui-ink hover:bg-ui-ink-hover text-white text-sm font-semibold transition-colors"
                        >
                            <Play className="h-3.5 w-3.5 fill-current" />
                            Continue lesson
                        </Link>
                    </div>
                </section>
            )}

            {/* COURSES SECTION */}
            <section aria-labelledby="modules-title" className="flex flex-col gap-5">
                <div>
                    <h2 id="modules-title" className="text-xl font-bold text-slate-900 tracking-tight">Your learning path</h2>
                    <p className="text-sm text-ui-muted mt-1">Here are the modules in your learning path.</p>
                </div>

                {courses.length === 0 ? (
                    <div className="bg-white rounded-xl border border-ui-line p-12 text-center">
                        <BookOpen className="h-10 w-10 text-slate-400 mx-auto mb-3" />
                        <h3 className="text-lg font-bold text-slate-900">No courses available</h3>
                        <p className="text-sm text-ui-muted mt-1">Learning modules will appear here soon.</p>
                    </div>
                ) : (
                    <CourseGrid
                        courses={courses}
                        subscriptionInfo={subscriptionInfo}
                        kind="COURSE"
                        firstCardAnchorId="onboarding-course-anchor"
                    />
                )}
            </section>
        </div>
    );
}