<?php

use App\Http\Controllers\Api\ArticleController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\CommentController;
use App\Http\Controllers\Api\SearchController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Auth\PasswordController;
use App\Http\Controllers\Admin\AdminArticleController;
use App\Http\Controllers\Admin\AdminCategoryController;
use App\Http\Controllers\Admin\AdminUserController;
use App\Http\Controllers\Admin\AdminAnalyticsController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes — The Daily Cairo
|--------------------------------------------------------------------------
|
| All routes are prefixed with /api/v1 automatically by Laravel's
| RouteServiceProvider (api prefix) + the prefix below.
|
| Authentication: Laravel Sanctum — Bearer token
| Authorization: Spatie Laravel Permission — roles: admin, editor, user
|
*/

Route::prefix('v1')->group(function () {

    // ── Public routes ────────────────────────────────────────────────────────

    // Authentication
    Route::prefix('auth')->group(function () {
        Route::post('/register',       [AuthController::class, 'register'])->middleware('throttle:5,1');
        Route::post('/login',          [AuthController::class, 'login'])->middleware('throttle:10,1');
        Route::post('/forgot-password',[PasswordController::class, 'forgotPassword'])->middleware('throttle:5,1');
        Route::post('/reset-password', [PasswordController::class, 'resetPassword'])->middleware('throttle:5,1');
        Route::get('/verify-email/{id}/{hash}', [AuthController::class, 'verifyEmail'])
            ->middleware('signed')
            ->name('verification.verify');
    });

    // Public articles
    Route::get('/articles',                     [ArticleController::class, 'index']);
    Route::get('/articles/featured',            [ArticleController::class, 'featured']);
    Route::get('/articles/breaking',            [ArticleController::class, 'breaking']);
    Route::get('/articles/trending',            [ArticleController::class, 'trending']);
    Route::get('/articles/{slug}',              [ArticleController::class, 'show']);
    Route::get('/articles/{slug}/related',      [ArticleController::class, 'related']);
    Route::post('/articles/{id}/view',          [ArticleController::class, 'incrementView']);
    Route::get('/articles/{articleId}/comments',[CommentController::class, 'index']);

    // Public categories
    Route::get('/categories',                   [CategoryController::class, 'index']);
    Route::get('/categories/{slug}',            [CategoryController::class, 'show']);
    Route::get('/categories/{slug}/articles',   [CategoryController::class, 'articles']);

    // Search
    Route::get('/search',                       [SearchController::class, 'search']);


    // ── Authenticated routes (Sanctum Bearer token) ──────────────────────────

    Route::middleware('auth:sanctum')->group(function () {

        // Auth actions
        Route::post('/auth/logout',                  [AuthController::class, 'logout']);
        Route::get('/auth/me',                       [AuthController::class, 'me']);
        Route::post('/auth/resend-verification',     [AuthController::class, 'resendVerification']);

        // User profile
        Route::get('/user/profile',                  [UserController::class, 'profile']);
        Route::put('/user/profile',                  [UserController::class, 'updateProfile']);
        Route::post('/user/avatar',                  [UserController::class, 'updateAvatar']);
        Route::put('/user/password',                 [UserController::class, 'updatePassword']);

        // Bookmarks
        Route::get('/user/bookmarks',                [UserController::class, 'bookmarks']);
        Route::post('/user/bookmarks/{articleId}',   [UserController::class, 'addBookmark']);
        Route::delete('/user/bookmarks/{articleId}', [UserController::class, 'removeBookmark']);

        // Reading history
        Route::get('/user/history',                  [UserController::class, 'readingHistory']);
        Route::post('/user/history/{articleId}',     [UserController::class, 'addToHistory']);
        Route::delete('/user/history',               [UserController::class, 'clearHistory']);

        // Notifications
        Route::get('/user/notifications',                    [UserController::class, 'notifications']);
        Route::post('/user/notifications/{id}/read',         [UserController::class, 'markNotificationRead']);
        Route::post('/user/notifications/read-all',          [UserController::class, 'markAllNotificationsRead']);

        // Comments (authenticated)
        Route::post('/articles/{articleId}/comments',        [CommentController::class, 'store']);
        Route::put('/comments/{id}',                         [CommentController::class, 'update']);
        Route::delete('/comments/{id}',                      [CommentController::class, 'destroy']);


        // ── Admin & Editor routes ─────────────────────────────────────────────

        Route::middleware('role:admin|editor')->prefix('admin')->group(function () {

            // Article management
            Route::get('/articles',                          [AdminArticleController::class, 'index']);
            Route::post('/articles',                         [AdminArticleController::class, 'store']);
            Route::get('/articles/{id}',                     [AdminArticleController::class, 'show']);
            Route::put('/articles/{id}',                     [AdminArticleController::class, 'update']);
            Route::delete('/articles/{id}',                  [AdminArticleController::class, 'destroy']);
            Route::post('/articles/{id}/publish',            [AdminArticleController::class, 'publish']);
            Route::post('/articles/{id}/unpublish',          [AdminArticleController::class, 'unpublish']);
            Route::post('/articles/{id}/breaking',           [AdminArticleController::class, 'setBreaking']);
            Route::post('/articles/{id}/trending',           [AdminArticleController::class, 'setTrending']);
            Route::post('/articles/upload-image',            [AdminArticleController::class, 'uploadImage']);

            // Category management
            Route::get('/categories',                        [AdminCategoryController::class, 'index']);
            Route::post('/categories',                       [AdminCategoryController::class, 'store']);
            Route::put('/categories/{id}',                   [AdminCategoryController::class, 'update']);
            Route::delete('/categories/{id}',                [AdminCategoryController::class, 'destroy']);

            // Analytics (editors can view)
            Route::get('/analytics',                         [AdminAnalyticsController::class, 'index']);
            Route::get('/analytics/articles',                [AdminAnalyticsController::class, 'articles']);
            Route::get('/analytics/users',                   [AdminAnalyticsController::class, 'users']);


            // ── Admin-only routes ─────────────────────────────────────────────

            Route::middleware('role:admin')->group(function () {
                Route::get('/users',                         [AdminUserController::class, 'index']);
                Route::get('/users/{id}',                    [AdminUserController::class, 'show']);
                Route::put('/users/{id}',                    [AdminUserController::class, 'update']);
                Route::delete('/users/{id}',                 [AdminUserController::class, 'destroy']);
                Route::post('/users/{id}/role',              [AdminUserController::class, 'assignRole']);
                Route::post('/users/{id}/ban',               [AdminUserController::class, 'ban']);
                Route::post('/users/{id}/unban',             [AdminUserController::class, 'unban']);
            });
        });
    });
});
