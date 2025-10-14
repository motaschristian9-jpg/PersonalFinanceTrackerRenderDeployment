<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use Illuminate\Support\Carbon;

class ResetPasswordController extends Controller
{
    public function reset(Request $request)
    {
        // Validate inputs
        $request->validate([
            'email' => 'required|email|exists:users,email',
            'token' => 'required',
            'password' => 'required|min:8|confirmed',
        ]);

        // Check if token + email exists in password_resets
        $reset = DB::table('password_resets')
            ->where('email', $request->email)
            ->where('token', $request->token)
            ->first();

        if (!$reset) {
            return response()->json([
                'message' => '❌ Failed to reset password. Invalid token or email.'
            ], 400);
        }

        // (Optional) Check expiry – example: token valid for 60 minutes
        if (Carbon::parse($reset->created_at)->addMinutes(60)->isPast()) {
            return response()->json([
                'message' => '❌ Token has expired. Please request a new password reset link.'
            ], 400);
        }

        // Update the user’s password
        User::where('email', $request->email)->update([
            'password' => Hash::make($request->password),
        ]);

        // Delete the reset record so it can’t be reused
        DB::table('password_resets')->where('email', $request->email)->delete();

        return response()->json([
            'message' => '✅ Password has been reset successfully!'
        ], 200);
    }

    public function changePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required',
            'new_password' => 'required|min:8|confirmed',
        ]);

        $user = auth()->user();

        // Check current password
        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'message' => '❌ Current password is incorrect.'
            ], 400);
        }

        // Update to new password
        $user->update([
            'password' => Hash::make($request->new_password),
        ]);

        return response()->json([
            'message' => '✅ Password changed successfully!'
        ], 200);
    }
}
