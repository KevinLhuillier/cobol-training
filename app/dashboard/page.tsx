import { prisma } from "@/prisma/client";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Terminal, Lock, Play, BookOpen, CheckCircle } from "lucide-react";

export default async function DashboardPage() {
    // 1. Authentication: Retrieve cookie and userId
    const cookieStore = await cookies();
    const token = cookieStore.get("session_token")?.value;

    if (!token) return redirect("/login");

    let userId: string;
    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const { payload } = await jwtVerify(token, secret);
        userId = payload.userId as string;
        if (!userId) return redirect("/login");
    } catch (error) {
        return redirect("/login");
    }

    // 2. Retrieve the user's TSO account
    const tsoAccount = await prisma.tsoUser.findFirst({
        where: { assignedToUserId: userId }
    });

    // 3. Retrieve courses WITH user progress
    const courses = await prisma.course.findMany({
        where: { isPublished: true },
        orderBy: { createdAt: "desc" },
        include: {
            chapters: {
                orderBy: { position: "asc" },
                include: {
                    lessons: {
                        orderBy: { position: "asc" },
                        include: {
                            lessonProgress: {
                                where: { userId: userId }
                            }
                        }
                    }
                }
            }
        }
    });

    return (
        <>
            {/* TSO ACCESS CARD */}
            <div className="mb-10 bg-slate-900 rounded-[2rem] p-6 md:p-8 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-slate-800">
                <div className="flex items-center gap-4">
                    <div className="h-14 w-14 bg-slate-800 rounded-xl flex items-center justify-center border border-slate-700 shrink-0">
                        <Terminal className="h-7 w-7 text-emerald-400" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">Your Mainframe Access (TSO)</h2>
                        <p className="text-slate-400 text-sm mt-1">
                            Use these credentials to connect to the emulator.
                        </p>
                    </div>
                </div>

                {tsoAccount ? (
                    <div className="flex flex-wrap items-center gap-4 bg-slate-800 p-4 rounded-xl border border-slate-700 w-full md:w-auto">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Username</p>
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
                    </div>
                ) : (
                    <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 w-full md:w-auto flex items-center gap-3">
                        <div className="p-2 bg-slate-900 rounded-lg">
                            <Lock className="h-5 w-5 text-slate-400" />
                        </div>
                        <p className="text-sm text-slate-300 font-medium">
                            No access assigned.<br/>
                            <span className="text-xs text-slate-400 font-normal">Please contact your instructor.</span>
                        </p>
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
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {courses.map((course, index) => {
                        const allLessons = course.chapters.flatMap(chap => chap.lessons);
                        const totalLessons = allLessons.length;
                        const completedLessons = allLessons.filter(l => l.lessonProgress?.[0]?.isCompleted);
                        const progress = totalLessons === 0 ? 0 : Math.round((completedLessons.length / totalLessons) * 100);
                        const nextUncompletedLesson = allLessons.find(l => !l.lessonProgress?.[0]?.isCompleted);

                        let href = `/dashboard/courses/${course.id}`;
                        if (nextUncompletedLesson) {
                            href = `/dashboard/courses/${course.id}?lessonId=${nextUncompletedLesson.id}`;
                        } else if (allLessons.length > 0) {
                            href = `/dashboard/courses/${course.id}?lessonId=${allLessons[0].id}`;
                        }

                        const isLocked = false;
                        const gradients = [
                            "from-blue-500 to-cyan-400",
                            "from-slate-700 to-slate-900",
                            "from-purple-500 to-indigo-500",
                            "from-orange-500 to-red-500"
                        ];
                        const randomGradient = gradients[index % gradients.length];

                        return (
                            <div
                                key={course.id}
                                className={`flex flex-col bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 transition-all ${
                                    isLocked ? "opacity-75 grayscale-[20%]" : "hover:shadow-md hover:-translate-y-1"
                                }`}
                            >
                                {course.imageUrl ? (
                                    <div className="h-40 w-full relative">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={course.imageUrl} alt={course.title} className="w-full h-full object-cover" />
                                        <div className="absolute top-4 right-4">
                                            <Badge variant="secondary" className="bg-white text-slate-900 shadow-sm border-none font-semibold">
                                                <span>{progress === 100 ? "Completed" : "Available"}</span>
                                            </Badge>
                                        </div>
                                    </div>
                                ) : (
                                    <div className={`h-40 w-full bg-gradient-to-br ${randomGradient} relative p-4 flex items-end justify-between`}>
                                        <div className="bg-white/20 backdrop-blur-md p-2 rounded-xl">
                                            <Terminal className="h-8 w-8 text-white drop-shadow-md" />
                                        </div>
                                        <Badge variant="secondary" className="bg-white text-slate-900 shadow-sm border-none font-semibold">
                                            <span>{progress === 100 ? "Completed" : "Available"}</span>
                                        </Badge>
                                    </div>
                                )}

                                <div className="p-5 flex flex-col flex-1">
                                    <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-1">
                                        {course.title}
                                    </h3>

                                    <p className="text-xs text-slate-500 mb-6 line-clamp-2">
                                        {course.description || "No description for this module."}
                                    </p>

                                    <div className="mb-6 mt-auto">
                                        <div className="flex justify-between text-xs font-semibold text-slate-600 mb-2">
                                            <span>Progress</span>
                                            <span className={progress === 100 ? "text-emerald-600" : ""}>{progress}%</span>
                                        </div>
                                        <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden shadow-inner">
                                            <div
                                                className={`h-full rounded-full transition-all duration-500 ${progress === 100 ? 'bg-emerald-500' : 'bg-slate-800'}`}
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                    </div>

                                    <Link href={href} className="w-full">
                                        <Button
                                            className={`w-full rounded-xl shadow-sm text-white ${
                                                progress === 100
                                                    ? "bg-emerald-600 hover:bg-emerald-700"
                                                    : "bg-slate-900 hover:bg-slate-800"
                                            }`}
                                        >
                                            {progress === 100 ? (
                                                <><CheckCircle className="mr-2 h-4 w-4" /> Completed (Review)</>
                                            ) : progress > 0 ? (
                                                <><Play className="mr-2 h-4 w-4 fill-current" /> Continue</>
                                            ) : (
                                                <><Play className="mr-2 h-4 w-4 fill-current" /> Start</>
                                            )}
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </>
    );
}