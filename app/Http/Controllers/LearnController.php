<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Lesson;
use App\Models\Progression;
use App\Models\Video;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class LearnController extends Controller
{
    public function show($courseId, $sectionId, $lessonId)
    {
        $user = Auth::user();
        $course = Course::with(['sections.lessons' => function ($query) {
            $query->with(['progression' => function ($query) {
                $query->where('user_id', Auth::id());
            }]);
        }])->findOrFail($courseId);

        // Vérifier si l'utilisateur est inscrit au cours
        if (!$user->isEnrolledIn($course)) {
            return redirect()->route('lessons.show', $lessonId)->with('error', 'You must be enrolled in the course to start learning.');
        }

        $lesson = Lesson::where('id', $lessonId)->where('section_id', $sectionId)->firstOrFail();

        // Récupérer la progression de l'utilisateur pour le cours
        $progress = $user->getCourseProgress($course);

        return view('learn.show', compact('course', 'lesson', 'progress'));
    }

    public function markAsWatched(Request $request, Lesson $lesson): RedirectResponse
    {
        $userId = Auth::id();
        Progression::firstOrCreate(
            ['user_id' => $userId, 'lesson_id' => $lesson->id],
            ['date' => now()]
        );

        // Update Course progress
        Auth::user()->updateCourseProgress($lesson->section->course);

        // Find the next lesson in the current section
        $nextLesson = Lesson::where('section_id', $lesson->section_id)
            ->where('position', '>', $lesson->position)
            ->orderBy('position')
            ->first();

        if ($nextLesson) {
            return redirect()->route('learn.show', [$lesson->section->course_id, $lesson->section_id, $nextLesson->id]);
        }

        // If no next lesson, find the first lesson in the next section
        $nextSection = $lesson->section->course->sections()
            ->where('position', '>', $lesson->section->position)
            ->orderBy('position')
            ->first();

        if ($nextSection) {
            $firstLessonInNextSection = $nextSection->lessons()->orderBy('position')->first();
            if ($firstLessonInNextSection) {
                return redirect()->route('learn.show', [$lesson->section->course_id, $nextSection->id, $firstLessonInNextSection->id]);
            }
        }

        // If it's the last lesson of the last section, redirect to the course page
        return redirect()->route('courses.show', $lesson->section->course_id);
    }

    public function continue(Course $course): RedirectResponse
    {
        $userId = Auth::id();

        // Get the highest positioned lesson for the user in the given course
        $progression = Progression::where('user_id', $userId)
            ->join('lessons', 'progression.lesson_id', '=', 'lessons.id')
            ->join('sections', 'lessons.section_id', '=', 'sections.id')
            ->where('sections.course_id', $course->id)
            ->orderBy('sections.position', 'desc')
            ->orderBy('lessons.position', 'desc')
            ->select('progression.*')
            ->first();

        if ($progression) {
            $lesson = $progression->lesson;
            $section = $lesson->section;
            return redirect()->route('learn.show', [$course->id, $section->id, $lesson->id]);
        }

        // If no progression found, redirect to the first lesson of the first section
        $section = $course->sections()->orderBy('position')->first();
        $lesson = $section->lessons()->orderBy('position')->first();

        return redirect()->route('learn.show', [$course->id, $section->id, $lesson->id]);
    }
}
