<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Support\Carbon;

class ForgotPasswordController extends Controller
{
    /**
     * Send a password reset link to the given email.
     */
    public function sendResetLink(Request $request)
    {
        // Validate email
        $request->validate([
            'email' => 'required|email|exists:users,email',
        ]);

        // Generate a random token
        $token = Str::random(60);

        // Save token in password_resets table
        DB::table('password_resets')->updateOrInsert(
            ['email' => $request->email],
            [
                'token' => $token,
                'created_at' => Carbon::now(),
            ]
        );

        // Generate the React frontend reset URL
        $resetUrl = "http://localhost:5173/reset-password?token={$token}&email={$request->email}";

        // Send email manually
        Mail::send('emails.reset-password', ['url' => $resetUrl], function ($message) use ($request) {
            $message->to($request->email);
            $message->subject('Reset your password');
        });

        return response()->json([
            'message' => '✅ We’ve sent a password reset link to your email. Please check your inbox (and spam folder).'
        ], 200);
    }
}
