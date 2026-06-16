<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Register a new user account.
     * Uses Laravel Sanctum to issue a Bearer token.
     */
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'                  => ['required', 'string', 'max:255', 'min:2'],
            'email'                 => ['required', 'string', 'email:rfc,dns', 'max:255', 'unique:users,email'],
            'password'              => ['required', 'confirmed', Password::min(8)->letters()->numbers()],
            'password_confirmation' => ['required'],
        ], [
            'name.required'             => 'Please enter your full name.',
            'name.min'                  => 'Name must be at least 2 characters.',
            'email.required'            => 'Please enter your email address.',
            'email.email'               => 'Please enter a valid email address.',
            'email.unique'              => 'This email is already registered. Please login instead.',
            'password.required'         => 'Please create a password.',
            'password.confirmed'        => 'Password confirmation does not match.',
            'password_confirmation.required' => 'Please confirm your password.',
        ]);

        /** @var User $user */
        $user = User::create([
            'name'     => $validated['name'],
            'email'    => $validated['email'],
            'password' => Hash::make($validated['password']),
        ]);

        // Assign default user role (Spatie)
        $user->assignRole('user');

        // Fire registered event (triggers email verification if configured)
        event(new Registered($user));

        // Issue a Sanctum token
        $token = $user->createToken('auth_token', ['*'])->plainTextToken;

        return response()->json([
            'message' => 'Account created successfully! Welcome to The Daily Cairo.',
            'user'    => $this->userResource($user),
            'token'   => $token,
        ], 201);
    }

    /**
     * Log in with email and password.
     * Revokes all previous tokens and issues a fresh Sanctum Bearer token.
     */
    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email'    => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ], [
            'email.required'    => 'Please enter your email address.',
            'email.email'       => 'Please enter a valid email address.',
            'password.required' => 'Please enter your password.',
        ]);

        // Attempt authentication
        if (! Auth::attempt($credentials, $request->boolean('remember'))) {
            throw ValidationException::withMessages([
                'email' => ['The email or password you entered is incorrect. Please try again.'],
            ]);
        }

        /** @var User $user */
        $user = User::where('email', $credentials['email'])->firstOrFail();

        // Check if user is banned
        if ($user->is_banned) {
            Auth::logout();
            return response()->json([
                'message' => 'Your account has been suspended. Reason: ' . ($user->ban_reason ?? 'Violation of terms of service.'),
            ], 403);
        }

        // Revoke all old tokens (single-session approach)
        $user->tokens()->delete();

        // Issue fresh Sanctum token
        $token = $user->createToken('auth_token', ['*'])->plainTextToken;

        return response()->json([
            'message' => 'Welcome back, ' . $user->name . '!',
            'user'    => $this->userResource($user),
            'token'   => $token,
        ], 200);
    }

    /**
     * Logout: revoke the current access token.
     */
    public function logout(Request $request): JsonResponse
    {
        // Delete the specific token used in this request
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully.'], 200);
    }

    /**
     * Return the authenticated user's information.
     */
    public function me(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user()->load('roles');

        return response()->json([
            'user' => $this->userResource($user),
        ], 200);
    }

    /**
     * Verify email address via signed URL.
     */
    public function verifyEmail(Request $request, string $id, string $hash): JsonResponse
    {
        /** @var User $user */
        $user = User::findOrFail($id);

        if (! hash_equals(sha1($user->getEmailForVerification()), $hash)) {
            return response()->json(['message' => 'Invalid or expired verification link.'], 400);
        }

        if ($user->hasVerifiedEmail()) {
            return response()->json(['message' => 'Email is already verified.'], 200);
        }

        if ($user->markEmailAsVerified()) {
            event(new Verified($user));
        }

        return response()->json(['message' => 'Email verified successfully!'], 200);
    }

    /**
     * Resend email verification notification.
     */
    public function resendVerification(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        if ($user->hasVerifiedEmail()) {
            return response()->json(['message' => 'Email is already verified.'], 400);
        }

        $user->sendEmailVerificationNotification();

        return response()->json(['message' => 'Verification email sent. Please check your inbox.'], 200);
    }

    /**
     * Build a consistent user resource array.
     */
    private function userResource(User $user): array
    {
        return [
            'id'                => $user->id,
            'name'              => $user->name,
            'email'             => $user->email,
            'avatar'            => $user->avatar_url,
            'bio'               => $user->bio,
            'email_verified_at' => $user->email_verified_at,
            'roles'             => $user->getRoleNames(),
            'is_admin'          => $user->hasRole('admin'),
            'is_editor'         => $user->hasRole('editor'),
            'created_at'        => $user->created_at,
        ];
    }
}
