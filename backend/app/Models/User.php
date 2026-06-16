<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable implements MustVerifyEmail
{
    use HasApiTokens, HasFactory, Notifiable, HasRoles;

    protected $fillable = [
        'name',
        'email',
        'password',
        'avatar',
        'bio',
        'is_banned',
        'banned_at',
        'ban_reason',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password'          => 'hashed',
        'is_banned'         => 'boolean',
        'banned_at'         => 'datetime',
    ];

    // ─── Relationships ──────────────────────────────────────────────────────────

    public function articles(): HasMany
    {
        return $this->hasMany(Article::class, 'author_id');
    }

    public function bookmarks(): BelongsToMany
    {
        return $this->belongsToMany(Article::class, 'bookmarks')
            ->withTimestamps();
    }

    public function readingHistory(): BelongsToMany
    {
        return $this->belongsToMany(Article::class, 'reading_history')
            ->withPivot('read_at')
            ->withTimestamps()
            ->orderByPivot('read_at', 'desc');
    }

    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class);
    }

    // ─── Accessors ──────────────────────────────────────────────────────────────

    /**
     * Get a full URL for the user's avatar.
     * Falls back to a UI-Avatars generated image if no avatar set.
     */
    public function getAvatarUrlAttribute(): string
    {
        if ($this->avatar) {
            // Already a full URL (e.g. Cloudinary)
            if (str_starts_with($this->avatar, 'http')) {
                return $this->avatar;
            }
            return asset('storage/' . $this->avatar);
        }

        // Generate an avatar from initials
        $name = urlencode($this->name ?? 'User');
        return "https://ui-avatars.com/api/?name={$name}&background=000000&color=ffffff&size=128";
    }
}
