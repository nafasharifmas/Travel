<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Register a new user account.
     */
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:191|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $userRole = Role::firstOrCreate(
            ['name' => 'user'],
            ['display_name' => 'Registered User', 'permissions' => ['itineraries.manage']]
        );

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role_id' => $userRole->id,
            'is_active' => true,
            'email_verified_at' => now(), // verified for standard local baseline
        ]);

        $token = $user->createToken('visitflow-auth-token')->plainTextToken;

        return response()->json([
            'message' => 'Registration successful. Welcome to Visitflow!',
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $userRole->name,
                'is_admin' => $user->isAdmin(),
                'is_active' => $user->is_active,
            ],
        ], 201);
    }

    /**
     * Authenticate a user and create a role-scoped token session.
     */
    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        $user = User::with('role')->where('email', $validated['email'])->first();

        if (!$user || !Hash::check($validated['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials do not match our records.'],
            ]);
        }

        if (!$user->is_active) {
            return response()->json([
                'message' => 'This account has been deactivated. Please contact support.',
            ], 403);
        }

        // Invalidate old tokens for clean session boundary
        $user->tokens()->delete();

        $token = $user->createToken('visitflow-auth-token')->plainTextToken;

        return response()->json([
            'message' => 'Sign in successful.',
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role ? $user->role->name : 'user',
                'is_admin' => $user->isAdmin(),
                'is_active' => $user->is_active,
            ],
        ]);
    }

    /**
     * Invalidate session and revoke tokens.
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Successfully signed out.',
        ]);
    }

    /**
     * Get current authenticated user details.
     */
    public function user(Request $request): JsonResponse
    {
        $user = $request->user()->load('role');

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role ? $user->role->name : 'user',
                'is_admin' => $user->isAdmin(),
                'is_active' => $user->is_active,
            ],
        ]);
    }
}

