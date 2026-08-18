<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Doctor;
use App\Models\Patient;
use App\Models\Appointment;
use App\Models\Consultation;
use App\Models\MedicalFile;

class AdminController extends Controller
{
    public function stats()
    {
        return response()->json([

            'totalDoctors' => Doctor::count(),

            'generalDoctors' => Doctor::where('doctor_type', 'General')->count(),

            'labUsers' => Doctor::where('doctor_type', 'Lab')->count(),

            'radiologyUsers' => Doctor::where('doctor_type', 'Radiology')->count(),

            'patients' => Patient::count(),

            'appointments' => Appointment::count(),

            'openConsultations' => Consultation::where('status', 'open')->count(),

            'pendingLab' => MedicalFile::where('file_type', 'Lab')
                ->where('status', 'pending')
                ->count(),

            'pendingRadiology' => MedicalFile::where('file_type', 'Radiology')
                ->where('status', 'pending')
                ->count(),

        ]);
    }


    public function index()
    {
        $doctors = Doctor::with(['user', 'department'])->get();

        return response()->json($doctors);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:3',
            'mobile' => 'required',
            'department_id' => 'required|exists:departments,id',
            'doctor_type' => 'required|in:General,Lab,Radiology',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'doctor',
            'approved' => true,
        ]);

        $doctor = Doctor::create([
            'user_id' => $user->id,
            'department_id' => $request->department_id,
            'doctor_type' => $request->doctor_type,
            'mobile' => $request->mobile,
        ]);

        return response()->json([
            'message' => 'تمت إضافة الطبيب بنجاح',
            'doctor' => $doctor->load(['user', 'department'])
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $doctor = Doctor::findOrFail($id);

        $user = User::findOrFail($doctor->user_id);

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $user->id,
            'mobile' => 'required',
            'department_id' => 'required|exists:departments,id',
            'doctor_type' => 'required|in:General,Lab,Radiology',
        ]);

        $user->name = $request->name;
        $user->email = $request->email;

        if ($request->filled('password')) {
            $user->password = Hash::make($request->password);
        }

        $user->save();

        $doctor->mobile = $request->mobile;
        $doctor->department_id = $request->department_id;
        $doctor->doctor_type = $request->doctor_type;

        $doctor->save();

        return response()->json([
            'message' => 'تم تعديل بيانات الطبيب بنجاح',
            'doctor' => $doctor->load(['user', 'department'])
        ]);
    }

    public function destroy($id)
    {
        $doctor = Doctor::findOrFail($id);

        $user = User::findOrFail($doctor->user_id);

        $doctor->delete();

        $user->delete();

        return response()->json([
            'message' => 'تم حذف الطبيب بنجاح'
        ]);
    }

}

