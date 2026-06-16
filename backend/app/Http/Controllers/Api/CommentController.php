<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\Comment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CommentController extends Controller
{
    public function index(int $articleId): JsonResponse
    {
        $comments = Comment::with(['user', 'replies.user'])
            ->where('article_id', $articleId)
            ->whereNull('parent_id')
            ->where('is_approved', true)
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json([
            'data' => $comments->items(),
            'meta' => ['total' => $comments->total()],
        ]);
    }

    public function store(Request $request, int $articleId): JsonResponse
    {
        $request->validate([
            'content' => ['required', 'string', 'max:1000', 'min:3'],
            'parent_id' => ['nullable', 'exists:comments,id'],
        ]);

        Article::published()->findOrFail($articleId);

        $comment = Comment::create([
            'article_id' => $articleId,
            'user_id' => $request->user()->id,
            'content' => $request->content,
            'parent_id' => $request->parent_id,
            'is_approved' => true,
        ]);

        $comment->load('user');

        return response()->json([
            'message' => 'Comment posted.',
            'data' => $comment,
        ], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $comment = Comment::where('user_id', $request->user()->id)->findOrFail($id);

        $request->validate([
            'content' => ['required', 'string', 'max:1000', 'min:3'],
        ]);

        $comment->update(['content' => $request->content]);

        return response()->json(['message' => 'Comment updated.', 'data' => $comment]);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $comment = Comment::findOrFail($id);
        $user = $request->user();

        if ($comment->user_id !== $user->id && !$user->hasRole(['admin', 'editor'])) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $comment->delete();

        return response()->json(['message' => 'Comment deleted.']);
    }
}
