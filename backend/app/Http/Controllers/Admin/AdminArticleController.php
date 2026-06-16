<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Article;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class AdminArticleController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Article::with(['category:id,name,slug,color', 'author:id,name,avatar'])
            ->orderBy('created_at', 'desc');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('category')) {
            $query->where('category_id', $request->category);
        }
        if ($request->filled('search')) {
            $query->where('title', 'like', '%' . $request->search . '%');
        }

        $articles = $query->paginate((int) $request->get('per_page', 15));

        return response()->json([
            'data' => $articles->items(),
            'meta' => [
                'current_page' => $articles->currentPage(),
                'last_page'    => $articles->lastPage(),
                'per_page'     => $articles->perPage(),
                'total'        => $articles->total(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title'            => ['required', 'string', 'max:255', 'min:3'],
            'subtitle'         => ['nullable', 'string', 'max:500'],
            'content'          => ['required', 'string', 'min:10'],
            'excerpt'          => ['nullable', 'string', 'max:500'],
            'category_id'      => ['required', 'integer', 'exists:categories,id'],
            'featured_image'   => ['nullable', 'string'],
            'tags'             => ['nullable', 'array'],
            'tags.*'           => ['string', 'max:50'],
            'status'           => ['required', 'in:draft,published'],
            'is_breaking'      => ['boolean'],
            'is_trending'      => ['boolean'],
            'is_featured'      => ['boolean'],
            'meta_title'       => ['nullable', 'string', 'max:255'],
            'meta_description' => ['nullable', 'string', 'max:500'],
        ]);

        // Generate unique slug
        $slug = $this->generateUniqueSlug($validated['title']);

        // Auto-generate excerpt from content if not provided
        if (empty($validated['excerpt'])) {
            $validated['excerpt'] = Str::limit(strip_tags($validated['content']), 200);
        }

        // Calculate read time (avg 200 wpm)
        $wordCount = str_word_count(strip_tags($validated['content']));
        $readTime  = max(1, (int) ceil($wordCount / 200));

        $article = Article::create([
            ...$validated,
            'slug'         => $slug,
            'author_id'    => $request->user()->id,
            'read_time'    => $readTime,
            'published_at' => $validated['status'] === 'published' ? now() : null,
            'is_breaking'  => $validated['is_breaking']  ?? false,
            'is_trending'  => $validated['is_trending']  ?? false,
            'is_featured'  => $validated['is_featured']  ?? false,
        ]);

        $this->clearArticleCache();

        return response()->json([
            'message' => 'Article created successfully.',
            'data'    => $article->load(['category', 'author']),
        ], 201);
    }

    public function show(int $id): JsonResponse
    {
        $article = Article::with(['category', 'author'])->findOrFail($id);

        return response()->json(['data' => $article]);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $article = Article::findOrFail($id);

        $validated = $request->validate([
            'title'            => ['required', 'string', 'max:255', 'min:3'],
            'subtitle'         => ['nullable', 'string', 'max:500'],
            'content'          => ['required', 'string', 'min:10'],
            'excerpt'          => ['nullable', 'string', 'max:500'],
            'category_id'      => ['required', 'integer', 'exists:categories,id'],
            'featured_image'   => ['nullable', 'string'],
            'tags'             => ['nullable', 'array'],
            'tags.*'           => ['string', 'max:50'],
            'status'           => ['required', 'in:draft,published'],
            'is_breaking'      => ['boolean'],
            'is_trending'      => ['boolean'],
            'is_featured'      => ['boolean'],
            'meta_title'       => ['nullable', 'string', 'max:255'],
            'meta_description' => ['nullable', 'string', 'max:500'],
        ]);

        // Regenerate slug only if title changed
        if ($validated['title'] !== $article->title) {
            $validated['slug'] = $this->generateUniqueSlug($validated['title'], $id);
        }

        // Recalculate read time
        $wordCount            = str_word_count(strip_tags($validated['content']));
        $validated['read_time'] = max(1, (int) ceil($wordCount / 200));

        // Set published_at when first published
        if ($validated['status'] === 'published' && ! $article->published_at) {
            $validated['published_at'] = now();
        }

        $article->update($validated);

        // Clear caches
        Cache::forget("article:slug:{$article->slug}");
        $this->clearArticleCache();

        return response()->json([
            'message' => 'Article updated successfully.',
            'data'    => $article->fresh()->load(['category', 'author']),
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        $article = Article::findOrFail($id);
        Cache::forget("article:slug:{$article->slug}");
        $article->delete();
        $this->clearArticleCache();

        return response()->json(['message' => 'Article deleted successfully.']);
    }

    public function publish(int $id): JsonResponse
    {
        $article = Article::findOrFail($id);
        $article->update([
            'status'       => 'published',
            'published_at' => $article->published_at ?? now(),
        ]);
        $this->clearArticleCache();

        return response()->json(['message' => 'Article published.', 'data' => $article->fresh()]);
    }

    public function unpublish(int $id): JsonResponse
    {
        Article::findOrFail($id)->update(['status' => 'draft']);
        $this->clearArticleCache();

        return response()->json(['message' => 'Article moved to drafts.']);
    }

    public function setBreaking(Request $request, int $id): JsonResponse
    {
        $article = Article::findOrFail($id);
        $article->update(['is_breaking' => (bool) $request->get('is_breaking', true)]);
        Cache::forget('articles:breaking');

        return response()->json([
            'message'    => 'Breaking news status updated.',
            'is_breaking' => $article->fresh()->is_breaking,
        ]);
    }

    public function setTrending(Request $request, int $id): JsonResponse
    {
        $article = Article::findOrFail($id);
        $article->update(['is_trending' => (bool) $request->get('is_trending', true)]);
        Cache::forget('articles:trending');

        return response()->json([
            'message'    => 'Trending status updated.',
            'is_trending' => $article->fresh()->is_trending,
        ]);
    }

    public function uploadImage(Request $request): JsonResponse
    {
        $request->validate([
            'image' => ['required', 'image', 'mimes:jpeg,png,jpg,gif,webp', 'max:5120'],
        ], [
            'image.required' => 'Please select an image to upload.',
            'image.image'    => 'The file must be an image.',
            'image.max'      => 'Image size must not exceed 5MB.',
        ]);

        $path = $request->file('image')->store('articles', 'public');

        return response()->json([
            'url'  => asset('storage/' . $path),
            'path' => $path,
        ]);
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private function generateUniqueSlug(string $title, ?int $excludeId = null): string
    {
        $slug  = Str::slug($title);
        $base  = $slug;
        $count = 1;

        while (true) {
            $query = Article::where('slug', $slug);
            if ($excludeId) {
                $query->where('id', '!=', $excludeId);
            }
            if (! $query->exists()) {
                break;
            }
            $slug = $base . '-' . $count++;
        }

        return $slug;
    }

    private function clearArticleCache(): void
    {
        Cache::forget('articles:featured');
        Cache::forget('articles:breaking');
        Cache::forget('articles:trending');
    }
}
