import { prisma } from "@/prisma/client";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { redirect } from "next/navigation";
import { Terminal, User, BookOpen, Check } from "lucide-react";
import { ReviewActionButtons } from "@/components/review-action-button";

export default async function AdminReviewsPage() {
    // Admin session verification
    const cookieStore = await cookies();
    const token = cookieStore.get("session_token")?.value;
    if (!token) return redirect("/login");

    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        await jwtVerify(token, secret);
        // Add admin role verification here if needed
    } catch {
        return redirect("/login");
    }

    // Fetch all pending exercises with their relations
    const pendingReviews = await prisma.lessonProgress.findMany({
        where: {
            exerciseStatus: "PENDING_REVIEW"
        },
        include: {
            lesson: {
                include: {
                    chapter: {
                        include: {
                            course: true
                        }
                    }
                }
            },
            // 🟢 We include the user to get their name
            user: true
        },
        orderBy: { updatedAt: "asc" } // Oldest first
    });

    return (
        <div className="min-h-screen bg-slate-50 font-sans p-4 md:p-6 lg:p-8">
            <div className="max-w-6xl mx-auto">
                {/* HEADER */}
                <div className="mb-8 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-slate-900 rounded-xl flex items-center justify-center text-emerald-400 shadow-sm">
                            <Terminal className="h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                                Pending Reviews
                            </h1>
                            <p className="text-sm text-slate-500">
                                {pendingReviews.length} exercise{pendingReviews.length !== 1 ? 's' : ''} to review
                            </p>
                        </div>
                    </div>
                </div>

                {/* EXERCISES LIST */}
                {pendingReviews.length === 0 ? (
                    <div className="bg-white rounded-[2rem] border border-slate-100 p-16 text-center shadow-sm flex flex-col items-center">
                        <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                            <Check className="h-8 w-8 text-slate-300" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">No pending reviews</h3>
                        <p className="text-slate-500 mt-2">Great job, all exercises have been reviewed!</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {pendingReviews.map((review) => (
                            <div key={review.id} className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                                {/* Contextual Information */}
                                <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider">
                                            <BookOpen className="h-3.5 w-3.5" />
                                            {review.lesson.chapter.course.title}
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900">
                                            {review.lesson.chapter.title} - {review.lesson.title}
                                        </h3>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm font-medium text-slate-600 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
                                        <User className="h-4 w-4 text-slate-400" />
                                        {/* 🟢 Display the user's name (fallback to ID if name is missing) */}
                                        <span>Student: <span className="font-bold text-slate-900">{review.user?.name || review.userId}</span></span>
                                    </div>
                                </div>

                                {/* Student's Code */}
                                <div className="p-6">
                                    <p className="text-sm font-bold text-slate-500 mb-3">Submitted solution:</p>
                                    <div className="bg-slate-900 rounded-xl p-4 overflow-x-auto shadow-inner border border-slate-800">
                                        <pre className="text-emerald-400 font-mono text-sm whitespace-pre-wrap">
                                            <code>{review.exerciseAnswer}</code>
                                        </pre>
                                    </div>
                                </div>

                                {/* Actions Bar */}
                                <div className="p-6 bg-slate-50 border-t border-slate-100">
                                    <ReviewActionButtons progressId={review.id} />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}