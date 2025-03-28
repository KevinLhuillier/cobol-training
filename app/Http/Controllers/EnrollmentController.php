<?php

namespace App\Http\Controllers;

use App\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class EnrollmentController extends Controller
{
    public function store(Course $course)
    {
        $user = Auth::user();
        $user->enrollments()->attach($course->id);

        return redirect()->route('learn.show', [$course->id, $course->sections()->first()->id, $course->sections()->first()->lessons()->first()->id]);
    }
}
