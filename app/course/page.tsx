import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
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

export default function CoursePlayer() {
    // Données factices pour l'exemple
    const chapters = [
        {
            id: "chap-1",
            title: "Introduction à l'écosystème",
            lessons: [
                { id: 1, title: "Architecture Mainframe", duration: "12:30", status: "completed" },
                { id: 2, title: "Z/OS et TSO/ISPF", duration: "18:45", status: "completed" },
            ]
        },
        {
            id: "chap-2",
            title: "Fondations COBOL",
            lessons: [
                { id: 3, title: "La division IDENTIFICATION & ENVIRONMENT", duration: "15:20", status: "completed" },
                { id: 4, title: "Déclaration de variables (DATA DIVISION)", duration: "22:10", status: "current" },
                { id: 5, title: "Logique de traitement (PROCEDURE DIVISION)", duration: "31:05", status: "locked" },
            ]
        },
        {
            id: "chap-3",
            title: "Manipulation de Fichiers (JCL)",
            lessons: [
                { id: 6, title: "Structure d'un JOB", duration: "14:15", status: "locked" },
                { id: 7, title: "Les cartes DD et le traitement Batch", duration: "25:40", status: "locked" },
            ]
        }
    ];

    return (
        // Fond global légèrement gris pour faire ressortir les panneaux blancs
        <div className="min-h-screen bg-slate-100 p-4 md:p-6 lg:p-8 flex flex-col gap-6 font-sans">

            {/* HEADER FLOTTANT ET ARRONDI */}
            <header className="bg-white rounded-2xl shadow-sm h-16 flex items-center px-6 shrink-0 justify-between max-w-[1600px] w-full mx-auto">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" className="text-slate-500 hover:text-slate-900 rounded-full">
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <h1 className="font-semibold text-slate-800">
                        Formation Complète : Développement COBOL & JCL
                    </h1>
                </div>
                <div className="text-sm text-slate-500 font-medium bg-slate-50 px-4 py-1.5 rounded-full">
                    Progression : 42%
                </div>
            </header>

            {/* LAYOUT PRINCIPAL (Séparé avec un gap) */}
            <main className="flex-1 max-w-[1600px] w-full mx-auto flex flex-col lg:flex-row gap-6 overflow-hidden">

                {/* ZONE VIDÉO (Panneau central arrondi) */}
                <section className="flex-1 bg-white rounded-3xl shadow-sm p-6 lg:p-8 flex flex-col overflow-y-auto">
                    <div className="max-w-5xl mx-auto w-full space-y-6">

                        <div>
                            <p className="text-sm font-medium text-blue-600 mb-1">Chapitre 2 • Leçon 4</p>
                            <h2 className="text-2xl font-bold text-slate-900">Déclaration de variables (DATA DIVISION)</h2>
                        </div>

                        {/* LECTEUR VIDÉO */}
                        <div className="w-full aspect-video bg-slate-900 rounded-2xl shadow-md flex flex-col items-center justify-center relative group cursor-pointer overflow-hidden border-4 border-slate-50">
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                            <PlayCircle className="h-16 w-16 text-white/90 group-hover:scale-110 transition-transform relative z-10 drop-shadow-lg" />
                            <div className="absolute bottom-4 left-4 right-4 flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
                                    <div className="h-full w-1/3 bg-blue-500 rounded-full" />
                                </div>
                                <span className="text-white text-sm font-medium drop-shadow-md">08:14 / 22:10</span>
                            </div>
                        </div>

                        {/* ACTION & DESCRIPTION */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-6">
                            <p className="text-slate-600 max-w-2xl text-sm leading-relaxed">
                                Apprenez à structurer vos données. Nous aborderons les niveaux de variables (01, 05, 77, 88), les clauses PIC et les bonnes pratiques de nommage dans les systèmes d'information.
                            </p>
                            <Button size="lg" className="shrink-0 bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-md">
                                <Check className="mr-2 h-4 w-4" />
                                Valider la leçon
                            </Button>
                        </div>
                    </div>
                </section>

                {/* BARRE LATÉRALE (Panneau de droite arrondi) */}
                <aside className="w-full lg:w-[400px] xl:w-[430px] bg-white rounded-3xl shadow-sm flex flex-col shrink-0 lg:h-[calc(100vh-10rem)] overflow-hidden">

                    <div className="p-6 bg-slate-50/50 rounded-t-3xl border-b border-slate-100">
                        <h3 className="font-bold text-slate-900 mb-4">Contenu du cours</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm text-slate-600">
                                <span>3/8 leçons terminées</span>
                                <span className="font-medium text-slate-900">42%</span>
                            </div>
                            {/* Barre de progression avec couleurs inversées via Tailwind */}
                            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
                                <div className="h-full bg-slate-800 rounded-full transition-all duration-500" style={{ width: '42%' }} />
                            </div>
                        </div>
                    </div>

                    <ScrollArea className="flex-1 p-4">
                        {/* @ts-expect-error - Contournement conflit type Radix/React 19 */}
                        <Accordion type="multiple" defaultValue={["chap-2"]} className="w-full space-y-3">
                            {chapters.map((chapter, index) => (
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
                                            {chapter.lessons.map((lesson) => (
                                                <div
                                                    key={lesson.id}
                                                    className={`flex items-start gap-3 p-3 rounded-lg transition-all ${
                                                        lesson.status === "current"
                                                            ? "bg-white shadow-sm ring-1 ring-slate-200"
                                                            : "hover:bg-slate-100/50"
                                                    } ${lesson.status === "locked" ? "opacity-50" : "cursor-pointer"}`}
                                                >
                                                    <div className="mt-0.5 shrink-0">
                                                        {lesson.status === "completed" && <CheckCircle2 className="h-5 w-5 text-green-700" />}
                                                        {lesson.status === "current" && <PlayCircle className="h-5 w-5 text-blue-600" />}
                                                        {lesson.status === "locked" && <Lock className="h-4 w-4 text-slate-400 mt-0.5" />}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className={`text-sm ${
                                                            lesson.status === "current" ? "font-bold text-slate-900" : "font-medium text-slate-600"
                                                        }`}>
                                                            {lesson.id}. {lesson.title}
                                                        </p>
                                                        <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                                                            {lesson.status === "current" ? (
                                                                <span className="text-blue-600 font-medium">En cours • {lesson.duration}</span>
                                                            ) : (
                                                                <span>{lesson.duration}</span>
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
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