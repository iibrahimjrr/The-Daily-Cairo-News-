<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Article;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class ArticleController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Article::with(['category:id,name,slug,color', 'author:id,name,avatar'])
            ->published()
            ->orderBy('published_at', 'desc');

        if ($request->category) {
            $query->whereHas('category', fn ($q) => $q->where('slug', $request->category));
        }

        if ($request->tag) {
            $query->whereJsonContains('tags', $request->tag);
        }

        $perPage  = min((int) $request->get('per_page', 12), 50);
        $articles = $query->paginate($perPage);

        return response()->json([
            'data' => collect($articles->items())->map(fn ($a) => $this->articleResource($a)),
            'meta' => [
                'current_page' => $articles->currentPage(),
                'last_page'    => $articles->lastPage(),
                'per_page'     => $articles->perPage(),
                'total'        => $articles->total(),
            ],
        ]);
    }

    public function show(string $slug): JsonResponse
    {
        $article = Cache::remember("article:slug:{$slug}", 300, function () use ($slug) {
            return Article::with([
                'category:id,name,slug,color',
                'author:id,name,avatar',
                'comments.user:id,name,avatar',
                'comments.replies.user:id,name,avatar',
            ])
                ->published()
                ->where('slug', $slug)
                ->firstOrFail();
        });

        return response()->json(['data' => $this->articleResource($article, true)]);
    }

    public function featured(): JsonResponse
    {
        $articles = Cache::remember('articles:featured', 300, function () {
            return Article::with(['category:id,name,slug,color', 'author:id,name,avatar'])
                ->featured()
                ->orderBy('published_at', 'desc')
                ->take(5)
                ->get();
        });

        return response()->json([
            'data' => $articles->map(fn ($a) => $this->articleResource($a)),
        ]);
    }

    public function breaking(): JsonResponse
    {
        $articles = Cache::remember('articles:breaking', 60, function () {
            return Article::with(['category:id,name,slug,color', 'author:id,name,avatar'])
                ->breaking()
                ->orderBy('published_at', 'desc')
                ->take(5)
                ->get();
        });

        return response()->json([
            'data' => $articles->map(fn ($a) => $this->articleResource($a)),
        ]);
    }

    public function trending(): JsonResponse
    {
        $articles = Cache::remember('articles:trending', 300, function () {
            return Article::with(['category:id,name,slug,color', 'author:id,name,avatar'])
                ->trending()
                ->orderBy('views_count', 'desc')
                ->take(5)
                ->get();
        });

        return response()->json([
            'data' => $articles->map(fn ($a) => $this->articleResource($a)),
        ]);
    }

    public function related(string $slug): JsonResponse
    {
        $article = Article::published()->where('slug', $slug)->firstOrFail();

        $related = Article::with(['category:id,name,slug,color', 'author:id,name,avatar'])
            ->published()
            ->where('category_id', $article->category_id)
            ->where('id', '!=', $article->id)
            ->orderBy('published_at', 'desc')
            ->take(4)
            ->get();

        return response()->json([
            'data' => $related->map(fn ($a) => $this->articleResource($a)),
        ]);
    }

    public function incrementView(int $id): JsonResponse
    {
        Article::where('id', $id)->increment('views_count');
        Cache::forget("article:slug:{$id}");

        return response()->json(['success' => true]);
    }

    // ─── Resource helper ──────────────────────────────────────────────────────

    private function articleResource(Article $article, bool $full = false): array
    {
        $data = [
            'id'             => $article->id,
            'title'          => $article->title,
            'subtitle'       => $article->subtitle,
            'slug'           => $article->slug,
            'excerpt'        => $article->excerpt,
            'featured_image' => $article->featured_image_url,
            'category'       => $article->category ? [
                'id'    => $article->category->id,
                'name'  => $article->category->name,
                'slug'  => $article->category->slug,
                'color' => $article->category->color,
            ] : null,
            'author' => $article->author ? [
                'id'     => $article->author->id,
                'name'   => $article->author->name,
                'avatar' => $article->author->avatar_url,
            ] : null,
            'tags'         => $article->tags ?? [],
            'views_count'  => $article->views_count,
            'read_time'    => $article->read_time,
            'is_breaking'  => $article->is_breaking,
            'is_trending'  => $article->is_trending,
            'is_featured'  => $article->is_featured,
            'status'       => $article->status,
            'published_at' => $article->published_at,
            'created_at'   => $article->created_at,
        ];

        if ($full) {
            $data['content']          = $article->content;
            $data['meta_title']       = $article->meta_title;
            $data['meta_description'] = $article->meta_description;
            $data['comments']         = $article->comments->map(function ($c) {
                return [
                    'id'      => $c->id,
                    'content' => $c->content,
                    'user'    => [
                        'id'     => $c->user->id,
                        'name'   => $c->user->name,
                        'avatar' => $c->user->avatar_url,
                    ],
                    'replies'    => $c->replies->map(fn ($r) => [
                        'id'         => $r->id,
                        'content'    => $r->content,
                        'user'       => [
                            'id'     => $r->user->id,
                            'name'   => $r->user->name,
                            'avatar' => $r->user->avatar_url,
                        ],
                        'created_at' => $r->created_at,
                    ]),
                    'created_at' => $c->created_at,
                ];
            });
        }

        return $data;
    }
}
