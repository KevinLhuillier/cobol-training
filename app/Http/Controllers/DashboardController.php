<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Progression;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        $enrolledCourses = $user->courses;
        // Récupérer la leçon la plus récemment ajoutée dans la table progression pour l'utilisateur
        $recentProgression = Progression::where('user_id', $user->id)
            ->orderBy('date', 'desc')
            ->first();

        // Récupérer le cours correspondant à cette leçon
        $recentCourse = $recentProgression ? $recentProgression->lesson->section->course : null;

        return view('dashboard.index', [
            'user' => $user,
            'enrolledCourses' => $enrolledCourses,
            'recentCourse' => $recentCourse
        ]);
    }
}
