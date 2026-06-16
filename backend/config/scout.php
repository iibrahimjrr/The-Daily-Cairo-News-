<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Default Search Engine
    |--------------------------------------------------------------------------
    |
    | Default: "database" (works out of the box, no extra services needed).
    | Change to "meilisearch" for production full-text search.
    |
    */

    'driver' => env('SCOUT_DRIVER', 'database'),

    'prefix' => env('SCOUT_PREFIX', ''),

    'queue' => env('SCOUT_QUEUE', false),

    'after_commit' => false,

    'chunk' => [
        'searchable'   => 500,
        'unsearchable' => 500,
    ],

    'soft_delete' => false,

    'identify' => false,

    /*
    |--------------------------------------------------------------------------
    | Meilisearch Configuration
    |--------------------------------------------------------------------------
    |
    | Set SCOUT_DRIVER=meilisearch in .env to use Meilisearch for faster
    | full-text search. Run: php artisan scout:import "App\Models\Article"
    |
    */

    'meilisearch' => [
        'host' => env('MEILISEARCH_HOST', 'http://localhost:7700'),
        'key'  => env('MEILISEARCH_KEY', null),
        'index-settings' => [
            'articles' => [
                'filterableAttributes' => ['category', 'status', 'is_breaking', 'is_trending'],
                'sortableAttributes'   => ['published_at', 'views_count'],
            ],
        ],
    ],

    'algolia' => [
        'id'     => env('ALGOLIA_APP_ID', ''),
        'secret' => env('ALGOLIA_SECRET', ''),
    ],

];
