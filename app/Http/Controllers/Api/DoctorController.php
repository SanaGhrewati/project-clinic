<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Appointment;
use App\Models\MedicalFile;
use App\Models\Consultation;

class DoctorController extends Controller
{
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

    public function dashboard(Request $request)
    {
        $doctor = $request->user()->doctor;

        // إحصائيات لوحة الطبيب
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