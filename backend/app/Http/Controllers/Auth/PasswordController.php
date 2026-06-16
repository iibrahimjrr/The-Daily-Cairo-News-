<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;

class PasswordController extends Controller
{
    /**
     * Send a password reset link to the provided email.
     */
    public function forgotPassword(Request $request): JsonResponse
    {
        $request->validate([
            'email' => ['required', 'email'],
        ], [
            'email.required' => 'Please enter your email address.',
            'email.email'    => 'Please enter a valid email address.',
        ]);

        $status = Password::sendResetLink($request->only('email'));

        // Always respond with success to avoid email enumeration attacks
        return response()->json([
            'message' => 'If this email is registered, a password reset link has been sent.',
        ], 200);
    }

    /**
     * Reset the user's password using the token from the email.
     */
    public function resetPassword(Request $request): JsonResponse
    {
        $request->validate([
            'token'                 => ['required', 'string'],
            'email'                 => ['required', 'email'],
            'password'              => ['required', 'confirmed', Rules\Password::min(8)->letters()->numbers()],
            'password_confirmation' => ['required'],
        ], [
            'token.required'        => 'Reset token is missing.',
            'email.required'        => 'Please enter your email address.',
            'password.min'          => 'Password must be at least 8 characters with letters and numbers.',
            'password.confirmed'    => 'Password confirmation does not match.',
        ]);

        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user) use ($request) {
                $user->forceFill([
                    'password' => Hash::make($request->password),
                ])->save();

                // Revoke all Sanctum tokens on password reset
                $user->tokens()->delete();
            }
        );

        if ($status !== Password::PASSWORD_RESET) {
            throw ValidationException::withMessages([
                'email' => ['This password reset link is invalid or has expired. Please request a new one.'],
            ]);
        }

        return response()->json([
            'message' => 'Password reset successfully! You can now login with your new password.',
        ], 200);
    }
}
