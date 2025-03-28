<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role'
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function isAdmin()
    {
        return $this->role === 'admin';
    }

    public function courses()
    {
        return $this->hasMany(Course::class, 'created_by');
    }

    public function progression()
    {
        return $this->hasMany(Progression::class);
    }

    public function enrollments()
    {
        return $this->belongsToMany(Course::class, 'enrollments')->withPivot('progress');
    }

    public function isEnrolledIn(Course $course)
    {
        return $this->enrollments()->where('course_id', $course->id)->exists();
    }

    public function updateCourseProgress(Course $course)
    {
        $totalLessons = $course->sections->sum(function ($section) {
            return $section->lessons->count();
        });

        $watchedLessons = $this->progression()
            ->whereHas('lesson.section', function ($query) use ($course) {
                $query->where('course_id', $course->id);
            })
            ->count();

        $progress = round(($watchedLessons / $totalLessons) * 100);

        $this->enrollments()->updateExistingPivot($course->id, ['progress' => $progress]);
    }

    public function getCourseProgress(Course $course)
    {
        //dd($this->enrollments()->where('course_id', $course->id));
        return $this->enrollments()->where('course_id', $course->id)->first()->pivot->progress;
    }
}
