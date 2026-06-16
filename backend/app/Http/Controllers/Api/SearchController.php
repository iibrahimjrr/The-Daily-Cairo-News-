<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Article;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    /**
     * Search articles using Laravel Scout.
     * Falls back to database LIKE search if Scout driver is unavailable.
     */
    public function search(Request $request): JsonResponse
    {
        $request->validate([
            'q' => ['required', 'string', 'min:2', 'max:100'],
        ], [
            'q.required' => 'Please enter a search term.',
            'q.min'      => 'Search term must be at least 2 characters.',
        ]);

        $query   = trim($request->get('q'));
        $perPage = (int) $request->get('per_page', 10);
        $page    = (int) $request->get('page', 1);

        try {
            // Use Scout (Meilisearch or database driver)
            $results = Article::search($query)
                ->query(fn ($q) => $q
                    ->with(['category:id,name,slug,color', 'author:id,name,avatar'])
                    ->published()
                    ->select(['id', 'title', 'subtitle', 'slug', 'excerpt', 'featured_image',
                              'category_id', 'author_id', 'is_breaking', 'is_trending',
                              'views_count', 'read_time', 'published_at'])
                )
                ->paginate($perPage, 'page', $page);

            return response()->json([
                'data'  => $results->items(),
                'query' => $query,
                'meta'  => [
                    'current_page' => $results->currentPage(),
                    'last_page'    => $results->lastPage(),
                    'per_page'     => $results->perPage(),
                    'total'        => $results->total(),
                ],
            ]);

        } catch (\Exception $e) {
            // Fallback: plain database LIKE search
            $results = Article::with(['category:id,name,slug,color', 'author:id,name,avatar'])
                ->published()
                ->where(function ($q) use ($query) {
                    $q->where('title',    'like', "%{$query}%")
                      ->orWhere('subtitle', 'like', "%{$query}%")
                      ->orWhere('excerpt',  'like', "%{$query}%")
                      ->orWhereJsonContains('tags', $query);
                })
                ->orderBy('published_at', 'desc')
                ->paginate($perPage, ['*'], 'page', $page);

            return response()->json([
                'data'  => $results->items(),
                'query' => $query,
                'meta'  => [
                    'current_page' => $results->currentPage(),
                    'last_page'    => $results->lastPage(),
                    'per_page'     => $results->perPage(),
                    'total'        => $results->total(),
                ],
            ]);
        }
    }
}
