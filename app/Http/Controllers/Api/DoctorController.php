<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Models\Doctor;
use App\Models\Appointment;
use App\Models\MedicalFile;
use App\Models\Consultation;
use App\Http\Controllers\Controller;

class DoctorController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $doctors = Doctor::all();

        return response()->json([
            'status' => true,
            'data' => $doctors
        ], 200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $doctor = Doctor::find($id);

        if (!$doctor) {
            return response()->json([
                'status' => false,
                'message' => 'الطبيب غير موجود'
            ], 404);
        }

        return response()->json([
            'status' => true,
            'data' => $doctor
        ], 200);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }

    /**
     * عرض الأطباء حسب القسم
     */
    public function getDoctorByDepartment($department_id)
    {
        $doctors = Doctor::where('department_id', $department_id)
            ->with('user')
            ->get();

        if ($doctors->isEmpty()) {
            return response()->json([
                'status' => false,
                'message' => 'لا يوجد أطباء في هذا القسم'
            ], 404);
        }

        return response()->json([
            'doctors' => $doctors->map(function ($doctor) {
                return [
                    'id' => $doctor->id,
                    'name' => $doctor->user->name,
                ];
            })
        ]);
    }

    /**
     * مواعيد الطبيب
     */
    public function appointments(Request $request)
    {
        $doctor = $request->user()->doctor;

        $query = Appointment::with(['patient.user'])
            ->where('doctor_id', $doctor->id);

        // فلترة حسب الحالة
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // فلترة حسب التاريخ
        if ($request->filled('date')) {
            $query->whereDate('appointment_datetime', $request->date);
        }

        // البحث باسم المريض
        if ($request->filled('search')) {
            $search = $request->search;

            $query->whereHas('patient.user', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            });
        }

        $appointments = $query
            ->orderBy('appointment_datetime')
            ->get();

        return response()->json($appointments);
    }

    /**
     * إنشاء موعد جديد من قبل الطبيب
     */
    public function createAppointment(Request $request)
    {
        $doctor = $request->user()->doctor;

        if (!$doctor) {
            return response()->json([
                'message' => 'Doctor not found'
            ], 403);
        }

        $request->validate([
            'appointment_datetime' => [
                'required',
                'date',
                'after_or_equal:now',
            ],
        ]);

        $exists = Appointment::where('doctor_id', $doctor->id)
            ->where(
                'appointment_datetime',
                $request->appointment_datetime
            )
            ->exists();

        if ($exists) {
            return response()->json([
                'message' => 'يوجد موعد في هذا التاريخ والوقت مسبقًا'
            ], 422);
        }

        $appointment = Appointment::create([
            'appointment_datetime' => $request->appointment_datetime,
            'status' => 'available',
            'doctor_id' => $doctor->id,
            'patient_id' => null,
            'diagnosis' => null,
        ]);

        return response()->json([
            'message' => 'تمت إضافة الموعد بنجاح',
            'appointment' => $appointment
        ], 201);
    }

    /**
     * إكمال الموعد وإضافة التشخيص
     */
    public function completeAppointment(Request $request, $id)
    {
        $doctor = $request->user()->doctor;

        $appointment = Appointment::where('doctor_id', $doctor->id)
            ->findOrFail($id);

        $appointment->status = 'completed';

        if ($request->filled('diagnosis')) {
            $appointment->diagnosis = $request->diagnosis;
        }

        $appointment->save();

        return response()->json([
            'message' => 'Appointment completed successfully',
            'appointment' => $appointment
        ]);
    }

    /**
     * Dashboard الطبيب
     */
    public function dashboard(Request $request)
    {
        $doctor = $request->user()->doctor;

        $todayAppointments = Appointment::where('doctor_id', $doctor->id)
            ->whereDate('appointment_datetime', today())
            ->count();

        $newConsultations = Consultation::where('doctor_id', $doctor->id)
            ->where('status', 'open')
            ->count();

        $pendingLab = MedicalFile::where('requested_by', $doctor->id)
            ->where('file_type', 'Lab')
            ->where('status', 'pending')
            ->count();

        $pendingRadiology = MedicalFile::where('requested_by', $doctor->id)
            ->where('file_type', 'Radiology')
            ->where('status', 'pending')
            ->count();

        // مواعيد اليوم
        $appointments = Appointment::with('patient.user')
            ->where('doctor_id', $doctor->id)
            ->whereDate('appointment_datetime', today())
            ->orderBy('appointment_datetime')
            ->get()
            ->map(function ($appointment) {
                return [
                    'id' => $appointment->id,
                    'patient_id' => $appointment->patient_id,
                    'patient_name' => $appointment->patient->user->name ?? null,
                    'time' => $appointment->appointment_datetime,
                    'status' => $appointment->status,
                ];
            });

        // آخر الاستشارات
        $consultations = Consultation::with('patient.user')
            ->where('doctor_id', $doctor->id)
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($consultation) {
                return [
                    'id' => $consultation->id,
                    'patient_name' => $consultation->patient->user->name ?? null,
                    'message' => $consultation->message,
                    'doctor_reply' => $consultation->doctor_reply,
                    'status' => $consultation->status,
                    'created_at' => $consultation->created_at,
                ];
            });

        return response()->json([
            'stats' => [
                'today_appointments' => $todayAppointments,
                'new_consultations' => $newConsultations,
                'pending_lab' => $pendingLab,
                'pending_radiology' => $pendingRadiology,
            ],

            'today_appointments' => $appointments,

            'latest_consultations' => $consultations,
        ]);
    }
}
