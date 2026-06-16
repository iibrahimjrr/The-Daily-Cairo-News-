<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\Category;
use App\Models\Comment;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class AdminAnalyticsController extends Controller
{
    public function index(): JsonResponse
    {
        $data = Cache::remember('analytics:dashboard', 300, function () {
            return [
                'totals' => [
                    'articles' => Article::count(),
                    'published_articles' => Article::where('status', 'published')->count(),
                    'draft_articles' => Article::where('status', 'draft')->count(),
                    'users' => User::count(),
                    'comments' => Comment::count(),
                    'categories' => Category::count(),
                    'total_views' => Article::sum('views_count'),
                ],
                'recent_articles' => Article::with(['category', 'author'])
                    ->orderBy('created_at', 'desc')
                    ->take(5)
                    ->get(),
                'top_articles' => Article::with(['category', 'author'])
                    ->published()
                    ->orderBy('views_count', 'desc')
                    ->take(5)
                    ->get(),
                'recent_users' => User::with('roles')
                    ->orderBy('created_at', 'desc')
                    ->take(5)
                    ->get()
                    ->map(fn($u) => [
                        'id' => $u->id,
                        'name' => $u->name,
                        'email' => $u->email,
                        'avatar' => $u->avatar_url,
                        'roles' => $u->getRoleNames(),
                        'created_at' => $u->created_at,
                    ]),
                'articles_by_category' => Category::withCount('publishedArticles')
                    ->orderBy('published_articles_count', 'desc')
                    ->get(),
                'articles_by_month' => Article::select(
                    DB::raw('YEAR(created_at) as year'),
                    DB::raw('MONTH(created_at) as month'),
                    DB::raw('COUNT(*) as count')
                )
                    ->where('created_at', '>=', now()->subMonths(6))
                    ->groupBy('year', 'month')
                    ->orderBy('year')
                    ->orderBy('month')
                    ->get(),
            ];
        });

        return response()->json(['data' => $data]);
    }

    public function articles(): JsonResponse
    {
        $data = [
            'by_status' => Article::select('status', DB::raw('COUNT(*) as count'))
                ->groupBy('status')
                ->pluck('count', 'status'),
            'views_over_time' => Article::select(
                DB::raw('DATE(published_at) as date'),
                DB::raw('SUM(views_count) as views')
            )
                ->published()
                ->where('published_at', '>=', now()->subDays(30))
                ->groupBy('date')
                ->orderBy('date')
                ->get(),
        ];

        return response()->json(['data' => $data]);
    }

    public function users(): JsonResponse
    {
        $data = [
            'registrations_over_time' => User::select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('COUNT(*) as count')
            )
                ->where('created_at', '>=', now()->subDays(30))
                ->groupBy('date')
                ->orderBy('date')
                ->get(),
            'by_role' => DB::table('model_has_roles')
                ->join('roles', 'model_has_roles.role_id', '=', 'roles.id')
                ->select('roles.name', DB::raw('COUNT(*) as count'))
                ->groupBy('roles.name')
                ->pluck('count', 'name'),
        ];

        return response()->json(['data' => $data]);
    }
}
