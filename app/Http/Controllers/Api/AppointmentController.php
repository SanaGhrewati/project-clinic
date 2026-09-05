<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Doctor;

class AppointmentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $patient = auth()->user()->patient;

        if (!$patient) {
            return response()->json([
                'success' => false,
                'message' => 'عذراً، لا يمكنك عرض المواعيد لأنك لست مسجلاً كمريض في النظام. يرجى تسجيل حساب مريض أولاً.'
            ], 422);
        }

        $appointments = Appointment::with([
            'doctor.user:id,name',
            'doctor.department:id,name'
        ])
            ->where('patient_id', $patient->id)
            ->orderBy('appointment_datetime', 'desc')
            ->get();

        $appointments = $appointments->map(function ($appointment) {
            return [
                'id' => $appointment->id,
                'appointment_datetime' => $appointment->appointment_datetime,
                'status' => $appointment->status,
                'diagnosis' => $appointment->diagnosis,
                'doctor_name' => $appointment->doctor?->user?->name,
                'department_name' => $appointment->doctor?->department?->name,
            ];
        });

        $upcoming = $appointments
            ->where('appointment_datetime', '>=', now())
            ->values();

        $past = $appointments
            ->where('appointment_datetime', '<', now())
            ->values();

        return response()->json([
            'success' => true,
            'data' => [
                'upcoming' => $upcoming,
                'past' => $past
            ]
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'appointment_datetime' => 'required|date|after:now',
            'doctor_id' => 'required|exists:doctors,id',
        ]);

        $patient = auth()->user()->patient;

        if (!$patient) {
            return response()->json([
                'success' => false,
                'message' => 'عذراً، لا يمكنك حجز موعد لأنك لست مسجلاً كمريض في النظام. يرجى تسجيل حساب مريض أولاً.'
            ], 422);
        }

        $appointment = Appointment::where('doctor_id', $request->doctor_id)
            ->where('appointment_datetime', $request->appointment_datetime)
            ->where('status', 'available')
            ->first();

        if (!$appointment) {
            return response()->json([
                'success' => false,
                'message' => 'عذراً، هذا الموعد تم حجزه للتو من قبل مستخدم آخر.'
            ], 422);
        }

        $appointment->update([
            'status' => 'booked',
            'patient_id' => $patient->id,
            'diagnosis' => null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'تم حجز الموعد بنجاح.',
            'data' => $appointment
        ], 201);
    }
    /**
     * Display the specified resource.
     */

    public function show($id)
    {
        $appointment = Appointment::with([
            'doctor.user',
            'doctor.department',
            'patient.user'
        ])->findOrFail($id);

        return response()->json([
            'appointment' => $appointment
        ]);
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
    public function cancel(string $id) //الغاء موعد cancel appointment
    {
        $patient = auth()->user()->patient;
        if (!$patient) {
            return response()->json([
                'success' => false,
                'message' => 'عذراً، لا يمكنك إلغاء موعد لأنك لست مسجلاً كمريض في النظام. يرجى تسجيل حساب مريض أولاً.'
            ], 422);
        }

        $appointment = Appointment::where('id', $id)
            ->where('patient_id', $patient->id)
            ->first();

        if (!$appointment) {
            return response()->json([
                'success' => false,
                'message' => 'الموعد غير موجود.'
            ], 404);
        }

        if ($appointment->status === 'cancelled') {
            return response()->json([
                'success' => false,
                'message' => 'الموعد تم إلغاؤه بالفعل.'
            ], 400);
        }

        $appointment->status = 'available';
        $appointment->save();

        return response()->json([
            'success' => true,
            'message' => 'تم إلغاء الموعد بنجاح.',
            'data' => $appointment
        ]);
    }

    public function getAvailableAppointments(Request $request, $doctor_id)
    {
        $doctorExists = Doctor::where('id', $doctor_id)->exists();
        if (!$doctorExists) {
            return response()->json(['success' => false, 'message' => 'Doctor not found'], 404);
        }


        $availableAppointments = Appointment::where('doctor_id', $doctor_id)
            ->where('status', 'available')
            ->where('appointment_datetime', '>=', now())
            ->orderBy('appointment_datetime', 'asc')     // ترتيب المواعيد من الأقرب للأبعد
            ->get();

        return response()->json([
            'success' => true,
            'data' => $availableAppointments
        ]);
    }
}
