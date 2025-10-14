<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Laravel\Socialite\Facades\Socialite;
use App\Models\User;
use Illuminate\Support\Str;
use Tymon\JWTAuth\Facades\JWTAuth;
use Exception;

class GoogleAuthController extends Controller
{
    public function redirect()
    {
        return Socialite::driver('google')->stateless()->redirect();
    }

    public function loginExistingGoogleUser(Request $request)
    {
        $email = $request->input('email');

        if (!$email) {
            return response()->json([
                'success' => false,
                'message' => 'Email is required'
            ], 400);
        }

        $user = User::where('email', $email)->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'No account found with this email. Please register first.'
            ], 404);
        }

        $token = JWTAuth::fromUser($user);

        return response()->json([
            'success' => true,
            'token' => $token,
            'user' => $user
        ]);
    }

    public function loginWithGoogle(Request $request)
    {
        $email = $request->input('email');
        $name = $request->input('name');

        if (!$email || !$name) {
            return response()->json([
                'success' => false,
                'message' => 'Email and name are required'
            ], 400);
        }

        $user = User::firstOrCreate(
            ['email' => $email],
            [
                'name' => $name,
                'password' => bcrypt(Str::random(16)),
            ]
        );

        $token = JWTAuth::fromUser($user);

        return response()->json([
            'success' => true,
            'token' => $token,
            'user' => $user
        ]);
    }

    public function callback(Request $request)
    {
        try {
            $email = $request->input('email');
            $name = $request->input('name');

            if (!$email || !$name) {
                $googleUser = Socialite::driver('google')->stateless()->user();
                $email = $googleUser->getEmail();
                $name = $googleUser->getName();
            }

            if (!$email || !$name) {
                return response()->json([
                    'success' => false,
                    'message' => 'Email and name are required'
                ], 400);
            }

            $user = User::firstOrCreate(
                ['email' => $email],
                [
                    'name' => $name,
                    'password' => bcrypt(Str::random(16)),
                ]
            );

            $token = JWTAuth::fromUser($user);

            return response()->json([
                'success' => true,
                'message' => 'User authenticated successfully',
                'token' => $token,
                'user' => $user
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Google authentication failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
