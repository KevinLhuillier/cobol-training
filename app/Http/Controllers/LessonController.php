<?php

namespace App\Http\Controllers;

use App\Models\Lesson;
use Illuminate\Http\Request;

class LessonController extends Controller
{
    public function home()
    {
        $lessons = Lesson::latest()->take(3)->get();
        return view('home', compact('lessons'));
    }

    public function index()
    {
        $lessons = Lesson::all();
        return view('lessons.index', compact('lessons'));
    }

    public function show($id)
    {
        $lesson = Lesson::with('sections.videos')->findOrFail($id);
        return view('lessons.show', compact('lesson'));
    }
}
