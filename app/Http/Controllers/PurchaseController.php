<?php

namespace App\Http\Controllers;

use App\Models\Course;
use Illuminate\Http\Request;

class PurchaseController extends Controller
{
    public function create(Course $course)
    {
        // Logique d'achat à implémenter
        return view('purchase.create', compact('course'));
    }
}
