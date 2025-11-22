<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Register a new user
     */
    public function register(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|string|email|max:255|unique:users',
            'phone' => 'required|string|max:20|unique:users',
            'password' => 'required|string|min:8',
            'password_confirmation' => 'sometimes|required_with:password|same:password',
            'user_type' => 'nullable|in:customer,store_owner,driver',
            'address' => 'nullable|string|max:500',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'password' => Hash::make($request->password),
            'user_type' => $request->user_type ?? 'customer',
            'address' => $request->address,
            'latitude' => $request->latitude,
            'longitude' => $request->longitude,
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'data' => [
                'user' => $user,
                'token' => $token,
                'token_type' => 'Bearer'
            ],
            'message' => 'User registered successfully'
        ], 201);
    }

    /**
     * Login user
     */
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'nullable|email',
            'phone' => 'nullable|string',
            'password' => 'required',
        ]);

        // Login with email or phone
        $credentials = [];
        if ($request->email) {
            $credentials['email'] = $request->email;
        } elseif ($request->phone) {
            $credentials['phone'] = $request->phone;
        } else {
            throw ValidationException::withMessages([
                'email' => ['يجب إدخال البريد الإلكتروني أو رقم الهاتف'],
            ]);
        }
        $credentials['password'] = $request->password;

        if (!Auth::attempt($credentials)) {
            throw ValidationException::withMessages([
                'email' => ['بيانات الدخول غير صحيحة'],
            ]);
        }

        $user = User::where('email', $request->email)
            ->orWhere('phone', $request->phone)
            ->firstOrFail();
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'data' => [
                'user' => $user,
                'token' => $token,
                'token_type' => 'Bearer'
            ],
            'message' => 'Login successful'
        ]);
    }

    /**
     * Logout user
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully'
        ]);
    }

    /**
     * Verify phone (placeholder - implement SMS verification)
     */
    public function verifyPhone(Request $request): JsonResponse
    {
        $request->validate([
            'phone' => 'required|string',
            'code' => 'required|string|size:4',
        ]);

        // TODO: Implement phone verification logic
        // For now, just return success
        
        return response()->json([
            'success' => true,
            'message' => 'تم التحقق من الهاتف بنجاح'
        ]);
    }

    /**
     * Resend verification code
     */
    public function resendVerification(Request $request): JsonResponse
    {
        $request->validate([
            'phone' => 'required|string',
        ]);

        // TODO: Implement resend verification code logic
        
        return response()->json([
            'success' => true,
            'message' => 'تم إعادة إرسال رمز التحقق'
        ]);
    }
}
