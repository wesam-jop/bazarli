<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Cache;
use App\Models\User;
use Inertia\Inertia;

class AuthController extends Controller
{
    /**
     * Clean phone number - remove all non-digit characters except the number itself
     */
    private function cleanPhoneNumber($phone)
    {
        // Remove all non-digit characters (spaces, dashes, parentheses, plus signs, etc.)
        return preg_replace('/\D/', '', $phone);
    }
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'phone' => 'required|string',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator->errors());
        }

        // Clean phone number before searching
        $cleanedPhone = $this->cleanPhoneNumber($request->phone);
        
        \Log::info('Searching for user with phone:', [
            'original_phone' => $request->phone,
            'cleaned_phone' => $cleanedPhone
        ]);
        
        $user = User::where('phone', $cleanedPhone)->first();
        
        if (!$user) {
            \Log::error('User not found for phone:', ['phone' => $request->phone]);
            return back()->withErrors([
                'phone' => __('app.phone_not_found'),
            ]);
        }
        
        \Log::info('User found:', ['user_id' => $user->id, 'phone' => $user->phone]);

        // Generate OTP
        $otp = '12345'; // Default OTP for development
        Cache::put("login_otp_{$request->phone}", $otp, 300); // 5 minutes

        // Log OTP for development
        \Log::info("Login OTP for {$request->phone}: {$otp}");

        // Redirect to OTP verification
        return redirect()->route('verify.phone', [
            'phone' => $request->phone,
            'user_type' => $user->user_type,
            'action' => 'login'
        ]);
    }

    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'phone' => 'required|string|unique:users',
            'agree_terms' => 'required|accepted',
            'governorate_id' => 'required|exists:governorates,id',
            'city_id' => 'required|exists:cities,id',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator->errors());
        }

        // Clean phone number and check if user already exists
        $cleanedPhone = $this->cleanPhoneNumber($request->phone);
        
        \Log::info('Checking if user exists with phone:', [
            'original_phone' => $request->phone,
            'cleaned_phone' => $cleanedPhone
        ]);
        
        $existingUser = User::where('phone', $cleanedPhone)->first();
        
        if ($existingUser) {
            \Log::info('User already exists:', ['user_id' => $existingUser->id, 'phone' => $existingUser->phone]);
            return back()->withErrors([
                'phone' => __('app.phone_already_registered'),
            ]);
        }

        // Clean phone number before saving
        $cleanedPhone = $this->cleanPhoneNumber($request->phone);
        
        $user = User::create([
            'name' => $request->name,
            'phone' => $cleanedPhone,
            'password' => Hash::make('default_password'), // Default password, not used for login
            'user_type' => 'customer',
            'is_verified' => false,
            'governorate_id' => $request->governorate_id,
            'city_id' => $request->city_id,
        ]);

        // Generate OTP
        $otp = '12345'; // Default OTP for development
        Cache::put("verification_code_{$user->phone}", $otp, 300); // 5 minutes

        // Log OTP for development
        \Log::info("Registration OTP for {$user->phone}: {$otp}");

        // Redirect to verification page
        return redirect()->route('verify.phone', [
            'phone' => $user->phone,
            'user_type' => $user->user_type,
            'action' => 'register'
        ]);
    }

    public function verifyPhone(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'phone' => 'required|string',
            'code' => 'required|string',
            'user_type' => 'required|string',
            'action' => 'required|string',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator->errors());
        }

        // Get the correct cache key based on action
        $cacheKey = $request->action === 'login' 
            ? "login_otp_{$request->phone}" 
            : "verification_code_{$request->phone}";
            
        $cachedCode = Cache::get($cacheKey);
        
        if (!$cachedCode || $cachedCode !== $request->code) {
            return back()->withErrors([
                'code' => __('app.invalid_verification_code'),
            ]);
        }

        // Clean phone number and find user
        $cleanedPhone = $this->cleanPhoneNumber($request->phone);
        
        \Log::info('Verifying phone for user:', [
            'original_phone' => $request->phone,
            'cleaned_phone' => $cleanedPhone
        ]);
        
        $user = User::where('phone', $cleanedPhone)->first();
        
        if (!$user) {
            \Log::error('User not found during verification:', ['phone' => $request->phone]);
            return back()->withErrors([
                'code' => __('app.user_not_found'),
            ]);
        }
        
        \Log::info('User found for verification:', ['user_id' => $user->id, 'phone' => $user->phone]);

        // For registration, mark as verified
        if ($request->action === 'register') {
            $user->update(['is_verified' => true]);
        }

        // Login user
        \Log::info('Attempting to login user:', ['user_id' => $user->id, 'name' => $user->name]);
        Auth::login($user);
        
        // Check if login was successful
        if (Auth::check()) {
            \Log::info('User successfully logged in:', ['user_id' => Auth::id(), 'name' => Auth::user()->name]);
        } else {
            \Log::error('Failed to login user:', ['user_id' => $user->id]);
        }
        
        // Clear verification code
        Cache::forget($cacheKey);
        
        // Redirect to home page for all users
        return redirect()->intended('/');
    }

    public function resendVerification(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'phone' => 'required|string',
            'action' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => 'Invalid request'], 400);
        }

        // Generate new OTP
        $otp = '12345'; // Default OTP for development
        
        // Set the correct cache key based on action
        $cacheKey = $request->action === 'login' 
            ? "login_otp_{$request->phone}" 
            : "verification_code_{$request->phone}";
            
        Cache::put($cacheKey, $otp, 300); // 5 minutes

        // Log OTP for development
        \Log::info("Resent OTP for {$request->phone} ({$request->action}): {$otp}");

        return response()->json(['success' => true]);
    }

    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        
        return redirect('/');
    }
}
