<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Lesson extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'url',
        'section_id',
        'position'
    ];

    public function section(): BelongsTo
    {
        return $this->belongsTo(Section::class);
    }
    public function progression() : HasMany
    {
        return $this->hasMany(Progression::class);
    }

    public function isWatchedByUser($userId): bool
    {
        return $this->progression()->where('user_id', $userId)->exists();
    }
}
