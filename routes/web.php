<?php

use App\Http\Controllers\CourseController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\EnrollmentController;
use App\Http\Controllers\LearnController;
use App\Http\Controllers\LessonController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\PurchaseController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\MailController;

//Route::get('/', function () {
//    return view('welcome');
//})->name('home');

//Route::get('/dashboard', function () {
//    return view('dashboard');
//})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
});

Route::get('/', [CourseController::class, 'home'])->name('home');
Route::get('/courses', [CourseController::class, 'index'])->name('courses.index');
Route::get('/courses/{id}', [CourseController::class, 'show'])->name('courses.show');
Route::post('/courses/{course}/enroll', [EnrollmentController::class, 'store'])->name('enroll');
Route::get('/courses/{course}/purchase', [PurchaseController::class, 'create'])->name('purchase');

Route::middleware('auth')->group(function () {
    Route::get('/learn/{course}/{section}/{lesson}', [LearnController::class, 'show'])->name('learn.show');
    Route::post('/learn/{lesson}/mark-as-watched', [LearnController::class, 'markAsWatched'])->name('learn.markAsWatched');
    Route::get('/learn/{course}', [LearnController::class, 'continue'])->name('learn.continue');
});

Route::get('/send-test-mail', [MailController::class, 'sendTestMail'])->name('send.test.mail');



//Route::middleware(['auth', 'admin'])->group(function () {
//    Route::get('/admin/dashboard', [AdminController::class, 'index'])->name('admin.dashboard');
//});

require __DIR__.'/auth.php';
