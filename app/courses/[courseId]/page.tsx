import { prisma } from "@/prisma/client";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import {
    PlayCircle,
    CheckCircle2,
    Lock,
    Check,
    ChevronLeft
} from "lucide-react";

export default async function CoursePlayer({
                                               params,
                                               searchParams
                                           }: {
    params: Promise<{ courseId: string }>;
    searchParams: Promise<{ lessonId?: string }>;
}) {
    const resolvedParams = await params;
    const resolvedSearchParams = await searchParams;
    const { courseId } = resolvedParams;

    // 1. Récupération du cours, de ses chapitres et de ses leçons depuis Prisma
    const course = await prisma.course.findUnique({
        where: { id: courseId },
        include: {
            chapters: {
                orderBy: { position: "asc" },
                include: {
                    lessons: {
                        orderBy: { position: "asc" },
                    }
                }
            }
        }
    });

    if (!course || !course.isPublished) {
        return notFound();
    }

    // Aplatir toutes les leçons pour trouver facilement la leçon active
    const allLessons = course.chapters.flatMap(chap => chap.lessons);

    if (allLessons.length === 0) {
        return (
            <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl p-8 text-center max-w-md shadow-sm">
                    <h2 className="text-lg font-bold text-slate-900 mb-2">Cours en cours de création</h2>
                    <p className="text-sm text-slate-500 mb-6">Ce cours ne contient pas encore de leçons.</p>
                    <Link href="/">
                        <Button className="bg-slate-900 text-white rounded-xl">Retour au tableau de bord</Button>
                    </Link>
                </div>
            </div>
        );
    }

    // 2. Détermination de la leçon active (soit celle passée en ?lessonId=..., soit la première du cours)
    const currentLesson = allLessons.find(l => l.id === resolvedSearchParams.lessonId) || allLessons[0];

    // Trouver à quel chapitre appartient cette leçon active
    const currentChapter = course.chapters.find(chap => chap.lessons.some(l => l.id === currentLesson.id));

    // Fonction utilitaire pour extraire l'embed Vimeo
    const getVimeoEmbedUrl = (url: string | null) => {
        if (!url) return null;
        const match = url.match(/(?:vimeo\.com\/|video\/|channels\/.+\/|groups\/.+\/videos\/|album\/.+\/video\/)(\d+)/);
        const videoId = match ? match[1] : url.split("/").pop();
        if (!videoId || isNaN(Number(videoId))) return null;
        return `https://player.vimeo.com/video/${videoId}`;
    };

    const vimeoEmbedUrl = getVimeoEmbedUrl(currentLesson.vimeoUrl);

    return (
        <div className="min-h-screen bg-slate-100 p-4 md:p-6 lg:p-8 flex flex-col gap-6 font-sans">

            {/* HEADER FLOTTANT ET ARRONDI */}
            <header className="bg-white rounded-2xl shadow-sm h-16 flex items-center px-6 shrink-0 justify-between max-w-[1600px] w-full mx-auto">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard">
                        <Button variant="ghost" size="icon" className="text-slate-500 hover:text-slate-900 rounded-full">
                            <ChevronLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <h1 className="font-semibold text-slate-800 line-clamp-1">
                        {course.title}
                    </h1>
                </div>
                <div className="text-sm text-slate-500 font-medium bg-slate-50 px-4 py-1.5 rounded-full shrink-0">
                    Formation active
                </div>
            </header>

            {/* LAYOUT PRINCIPAL */}
            <main className="flex-1 max-w-[1600px] w-full mx-auto flex flex-col lg:flex-row gap-6 overflow-hidden">

                {/* ZONE VIDÉO (Panneau central) */}
                <section className="flex-1 bg-white rounded-3xl shadow-sm p-6 lg:p-8 flex flex-col overflow-y-auto">
                    <div className="max-w-5xl mx-auto w-full space-y-6">

                        <div>
                            <p className="text-sm font-medium text-blue-600 mb-1">
                                {currentChapter?.title} • Leçon {currentLesson.position}
                            </p>
                            <h2 className="text-2xl font-bold text-slate-900">{currentLesson.title}</h2>
                        </div>

                        {/* LECTEUR VIDÉO VIMEO */}
                        <div className="w-full aspect-video bg-slate-900 rounded-2xl shadow-md flex flex-col items-center justify-center relative overflow-hidden border-4 border-slate-50">
                            {vimeoEmbedUrl ? (
                                <iframe
                                    src={vimeoEmbedUrl}
                                    className="absolute top-0 left-0 w-full h-full border-0"
                                    allow="autoplay; fullscreen; picture-in-picture"
                                    allowFullScreen
                                />
                            ) : (
                                <div className="flex flex-col items-center justify-center text-slate-400 p-6 text-center">
                                    <PlayCircle className="h-16 w-16 text-slate-600 mb-2" />
                                    <p className="text-sm font-medium">Aucune vidéo disponible pour cette leçon.</p>
                                </div>
                            )}
                        </div>

                        {/* ACTION & DESCRIPTION */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-6">
                            <div className="text-slate-600 max-w-2xl text-sm leading-relaxed">
                                {currentLesson.content ? (
                                    <div dangerouslySetInnerHTML={{ __html: currentLesson.content }} />
                                ) : (
                                    <p className="italic text-slate-400">Aucun contenu textuel pour cette leçon.</p>
                                )}
                            </div>
                            <Button size="lg" className="shrink-0 bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-md">
                                <Check className="mr-2 h-4 w-4" />
                                Valider la leçon
                            </Button>
                        </div>
                    </div>
                </section>

                {/* BARRE LATÉRALE (Panneau de droite) */}
                <aside className="w-full lg:w-[400px] xl:w-[430px] bg-white rounded-3xl shadow-sm flex flex-col shrink-0 lg:h-[calc(100vh-10rem)] overflow-hidden">

                    <div className="p-6 bg-slate-50/50 rounded-t-3xl border-b border-slate-100">
                        <h3 className="font-bold text-slate-900 mb-4">Contenu du cours</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm text-slate-600">
                                <span>{course.chapters.length} chapitres au total</span>
                            </div>
                        </div>
                    </div>

                    <ScrollArea className="flex-1 p-4">
                        {/* @ts-expect-error - Contournement conflit type Radix/React 19 */}
                        <Accordion type="multiple" defaultValue={[currentChapter?.id || ""]} className="w-full space-y-3">
                            {course.chapters.map((chapter, index) => (
                                <AccordionItem key={chapter.id} value={chapter.id} className="border-none bg-slate-50 rounded-xl px-2">
                                    <AccordionTrigger className="hover:no-underline py-4 px-3 text-left rounded-xl transition-colors hover:bg-slate-100">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                                Section {index + 1}
                                            </span>
                                            <span className="text-sm font-bold text-slate-800">
                                                {chapter.title}
                                            </span>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="pt-1 pb-3 px-1">
                                        <div className="space-y-1">
                                            {chapter.lessons.map((lesson) => {
                                                const isCurrent = lesson.id === currentLesson.id;

                                                return (
                                                    <Link
                                                        key={lesson.id}
                                                        href={`/courses/${courseId}?lessonId=${lesson.id}`}
                                                        className={`flex items-start gap-3 p-3 rounded-lg transition-all block ${
                                                            isCurrent
                                                                ? "bg-white shadow-sm ring-1 ring-slate-200"
                                                                : "hover:bg-slate-100/50"
                                                        }`}
                                                    >
                                                        <div className="mt-0.5 shrink-0">
                                                            {isCurrent ? (
                                                                <PlayCircle className="h-5 w-5 text-blue-600" />
                                                            ) : (
                                                                <CheckCircle2 className="h-5 w-5 text-slate-300" />
                                                            )}
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className={`text-sm ${
                                                                isCurrent ? "font-bold text-slate-900" : "font-medium text-slate-600"
                                                            }`}>
                                                                {lesson.position}. {lesson.title}
                                                            </p>
                                                        </div>
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </ScrollArea>
                </aside>
            </main>
        </div>
    );
}