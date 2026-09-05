<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class ProfileController extends Controller
{
    public function show(Request $request)
    {
        $user = auth()->user();
        $patient = $user->patient;
        return response()->json([
            'success' => true,
            'data' => [
                'name' => $user->name,
                'email' => $user->email,
                'mobile' => $patient?->mobile,
                'gender' => $patient?->gender,
                'birthdate' => $patient?->birthdate,
                'address' => $patient?->address,
            ]
        ]);
    }

    public function update(Request $request)
    {
        $user = auth()->user();
        $patient = $user->patient;

        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $user->id,
            'mobile' => 'nullable|string|max:20',
            'gender' => 'nullable|string|in:male,female,other',
            'birthdate' => 'nullable|date',
            'address' => 'nullable|string|max:255',
        ]);

        $user->update($validatedData);
        $patient->update($validatedData);

        return response()->json([
            'success' => true,
            'data' => [
                'name' => $user->name,
                'email' => $user->email,
                'mobile' => $patient?->mobile,
                'gender' => $patient?->gender,
                'birthdate' => $patient?->birthdate,
                'address' => $patient?->address,
            ]
        ]);
    }
}
