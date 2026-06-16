<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Laravel\Scout\Searchable;

class Article extends Model
{
    use HasFactory, SoftDeletes, Searchable;

    protected $fillable = [
        'title',
        'subtitle',
        'slug',
        'content',
        'excerpt',
        'featured_image',
        'category_id',
        'author_id',
        'status',
        'is_breaking',
        'is_trending',
        'is_featured',
        'views_count',
        'read_time',
        'tags',
        'meta_title',
        'meta_description',
        'published_at',
    ];

    protected $casts = [
        'is_breaking'  => 'boolean',
        'is_trending'  => 'boolean',
        'is_featured'  => 'boolean',
        'tags'         => 'array',
        'published_at' => 'datetime',
        'views_count'  => 'integer',
        'read_time'    => 'integer',
    ];

    // ─── Scout ───────────────────────────────────────────────────────────────

    /**
     * Get the indexable data array for the model.
     * Used by Laravel Scout (Meilisearch or database driver).
     */
    public function toSearchableArray(): array
    {
        return [
            'id'       => $this->id,
            'title'    => $this->title,
            'subtitle' => $this->subtitle,
            'excerpt'  => $this->excerpt,
            'tags'     => $this->tags,
        ];
    }

    /**
     * Determine if the model should be searchable.
     * Only published articles are indexed.
     */
    public function shouldBeSearchable(): bool
    {
        return $this->status === 'published';
    }

    // ─── Relationships ────────────────────────────────────────────────────────

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class)->whereNull('parent_id')->where('is_approved', true);
    }

    public function allComments(): HasMany
    {
        return $this->hasMany(Comment::class);
    }

    public function bookmarkedBy(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'bookmarks')->withTimestamps();
    }

    // ─── Accessors ────────────────────────────────────────────────────────────

    public function getFeaturedImageUrlAttribute(): ?string
    {
        if (! $this->featured_image) {
            return null;
        }
        if (str_starts_with($this->featured_image, 'http')) {
            return $this->featured_image;
        }
        return asset('storage/' . $this->featured_image);
    }

    // ─── Query Scopes ─────────────────────────────────────────────────────────

    public function scopePublished($query)
    {
        return $query->where('status', 'published')
                     ->where('published_at', '<=', now());
    }

    public function scopeBreaking($query)
    {
        return $query->published()->where('is_breaking', true);
    }

    public function scopeTrending($query)
    {
        return $query->published()->where('is_trending', true);
    }

    public function scopeFeatured($query)
    {
        return $query->published()->where('is_featured', true);
    }
}
