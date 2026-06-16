<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;

class UserController extends Controller
{
    public function profile(Request $request): JsonResponse
    {
        $user = $request->user()->load('roles');

        return response()->json([
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'avatar' => $user->avatar_url,
                'bio' => $user->bio,
                'email_verified_at' => $user->email_verified_at,
                'roles' => $user->getRoleNames(),
                'created_at' => $user->created_at,
            ],
        ]);
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'min:2'],
            'bio' => ['nullable', 'string', 'max:500'],
            'email' => ['required', 'email', 'unique:users,email,' . $user->id],
        ]);

        $user->update($validated);

        return response()->json([
            'message' => 'Profile updated successfully.',
            'data' => $user->fresh(),
        ]);
    }

    public function updateAvatar(Request $request): JsonResponse
    {
        $request->validate([
            'avatar' => ['required', 'image', 'mimes:jpeg,png,jpg,gif', 'max:2048'],
        ]);

        $user = $request->user();

        if ($user->avatar && !str_starts_with($user->avatar, 'http')) {
            Storage::disk('public')->delete($user->avatar);
        }

        $path = $request->file('avatar')->store('avatars', 'public');
        $user->update(['avatar' => $path]);

        return response()->json([
            'message' => 'Avatar updated successfully.',
            'avatar' => $user->fresh()->avatar_url,
        ]);
    }

    public function updatePassword(Request $request): JsonResponse
    {
        $request->validate([
            'current_password' => ['required', 'string'],
            'password' => ['required', 'confirmed', Password::min(8)->letters()->numbers()],
        ]);

        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['The current password you entered is incorrect.'],
            ]);
        }

        $user->update(['password' => Hash::make($request->password)]);
        $user->tokens()->delete();

        return response()->json([
            'message' => 'Password updated successfully. Please login again.',
        ]);
    }

    public function bookmarks(Request $request): JsonResponse
    {
        $bookmarks = $request->user()
            ->bookmarks()
            ->with(['category', 'author'])
            ->published()
            ->orderByPivot('created_at', 'desc')
            ->paginate(12);

        return response()->json([
            'data' => $bookmarks->items(),
            'meta' => [
                'current_page' => $bookmarks->currentPage(),
                'last_page' => $bookmarks->lastPage(),
                'total' => $bookmarks->total(),
            ],
        ]);
    }

    public function addBookmark(Request $request, int $articleId): JsonResponse
    {
        $request->user()->bookmarks()->syncWithoutDetaching([$articleId]);

        return response()->json(['message' => 'Article bookmarked.']);
    }

    public function removeBookmark(Request $request, int $articleId): JsonResponse
    {
        $request->user()->bookmarks()->detach($articleId);

        return response()->json(['message' => 'Bookmark removed.']);
    }

    public function readingHistory(Request $request): JsonResponse
    {
        $history = $request->user()
            ->readingHistory()
            ->with(['category', 'author'])
            ->published()
            ->paginate(20);

        return response()->json([
            'data' => $history->items(),
            'meta' => [
                'current_page' => $history->currentPage(),
                'last_page' => $history->lastPage(),
                'total' => $history->total(),
            ],
        ]);
    }

    public function addToHistory(Request $request, int $articleId): JsonResponse
    {
        $user = $request->user();
        $user->readingHistory()->syncWithoutDetaching([
            $articleId => ['read_at' => now()],
        ]);

        // Keep only last 50 items
        $historyIds = $user->readingHistory()
            ->orderByPivot('read_at', 'desc')
            ->pluck('articles.id');

        if ($historyIds->count() > 50) {
            $toRemove = $historyIds->slice(50);
            $user->readingHistory()->detach($toRemove);
        }

        return response()->json(['message' => 'Added to reading history.']);
    }

    public function clearHistory(Request $request): JsonResponse
    {
        $request->user()->readingHistory()->detach();

        return response()->json(['message' => 'Reading history cleared.']);
    }

    public function notifications(Request $request): JsonResponse
    {
        $notifications = $request->user()
            ->notifications()
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json([
            'data' => $notifications->items(),
            'unread_count' => $request->user()->unreadNotifications()->count(),
            'meta' => [
                'current_page' => $notifications->currentPage(),
                'last_page' => $notifications->lastPage(),
            ],
        ]);
    }

    public function markNotificationRead(Request $request, string $id): JsonResponse
    {
        $request->user()->notifications()->where('id', $id)->update(['read_at' => now()]);

        return response()->json(['message' => 'Notification marked as read.']);
    }

    public function markAllNotificationsRead(Request $request): JsonResponse
    {
        $request->user()->unreadNotifications->markAsRead();

        return response()->json(['message' => 'All notifications marked as read.']);
    }
}
