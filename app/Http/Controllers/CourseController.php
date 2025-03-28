<?php

namespace App\Http\Controllers;

use App\Models\Course;
use Illuminate\Http\Request;

class CourseController extends Controller
{
    public function home()
    {
        $courses = Course::latest()->take(3)->get();
        return view('home', compact('courses'));
    }

    public function index()
    {
        $courses = Course::all();
        return view('courses.index', compact('courses'));
    }

    public function show($id)
    {
        $course = Course::with('sections.lessons')->findOrFail($id);
        return view('courses.show', compact('course'));
    }
}
