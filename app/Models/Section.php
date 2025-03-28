<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Section extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'course_id',
        'position'
    ];

    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    public function lessons()
    {
        return $this->hasMany(Lesson::class)->orderBy('position');
    }

//    protected static function boot()
//    {
//        parent::boot();
//
//        static::creating(function ($chapitre) {
//            // Déterminer la prochaine position du chapitre dans le cours
//            $dernierChapitre = Section::where('cours_id', $chapitre->cours_id)->max('position');
//            $chapitre->position = $dernierChapitre ? $dernierChapitre + 1 : 1;
//        });
//    }
}
