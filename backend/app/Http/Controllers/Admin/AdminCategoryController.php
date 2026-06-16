<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class AdminCategoryController extends Controller
{
    public function index(): JsonResponse
    {
        $categories = Category::withCount(['articles', 'publishedArticles'])
            ->orderBy('order')
            ->get();

        return response()->json(['data' => $categories]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100', 'unique:categories'],
            'description' => ['nullable', 'string', 'max:500'],
            'color' => ['nullable', 'string', 'max:20'],
            'icon' => ['nullable', 'string', 'max:50'],
            'order' => ['nullable', 'integer'],
        ]);

        $category = Category::create([
            ...$validated,
            'slug' => Str::slug($validated['name']),
            'is_active' => true,
        ]);

        Cache::forget('categories:all');

        return response()->json([
            'message' => 'Category created.',
            'data' => $category,
        ], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $category = Category::findOrFail($id);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100', 'unique:categories,name,' . $id],
            'description' => ['nullable', 'string', 'max:500'],
            'color' => ['nullable', 'string', 'max:20'],
            'icon' => ['nullable', 'string', 'max:50'],
            'is_active' => ['boolean'],
            'order' => ['nullable', 'integer'],
        ]);

        if ($validated['name'] !== $category->name) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        $category->update($validated);
        Cache::forget('categories:all');

        return response()->json(['message' => 'Category updated.', 'data' => $category->fresh()]);
    }

    public function destroy(int $id): JsonResponse
    {
        $category = Category::withCount('articles')->findOrFail($id);

        if ($category->articles_count > 0) {
            return response()->json([
                'message' => 'Cannot delete category with articles. Move articles first.',
            ], 422);
        }

        $category->delete();
        Cache::forget('categories:all');

        return response()->json(['message' => 'Category deleted.']);
    }
}
