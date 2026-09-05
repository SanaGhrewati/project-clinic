<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\Patient;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            "name" => 'required|max:255|string|min:3',
            'email' => 'required|email',
            'password' => 'required|min:8|confirmed',
            'mobile' => 'required|numeric|digits:10',
            'address' => 'required|string|min:3',
            'gender' => 'required|in:male,female',
            'birthdate' => 'required|date',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'patient',
            'approved' => 1,
        ]);

        Patient::create([
            'user_id' => $user->id,
            'address' => $request->address,
            'mobile' => $request->mobile,
            'birthdate' => $request->birthdate,
            'gender' => $request->gender
        ]);

        $token = $user->createToken('mobile-app')->plainTextToken;

        return response()->json([
            'message' => 'User registered successfully',
            'access_token' => $token,
            'token_type' => 'Bearer',
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|min:8'
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'البريد الإلكتروني أو كلمة المرور غير صحيحة'
            ], 401);
        }

        if (!$user->approved) {
            return response()->json([
                'message' => 'الحساب غير مفعل'
            ], 403);
        }

        $token = $user->createToken('clinic-token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'doctor_type' => $user->doctor->doctor_type ?? null
            ]
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->tokens()->delete();

        return response()->json([
            'message' => 'تم تسجيل الخروج'
        ]);
    }
}
