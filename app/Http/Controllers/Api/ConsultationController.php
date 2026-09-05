<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Consultation;
use App\Models\Doctor;

class ConsultationController extends Controller
{
    /**
     * عرض الاستشارات حسب نوع المستخدم
     */
    public function index(Request $request)
    {
        $user = $request->user();

        // إذا كان المستخدم مريض
        if ($user->role === 'patient') {

            $patient = $user->patient;

            if (!$patient) {
                return response()->json([
                    'success' => false,
                    'message' => 'المستخدم غير مسجل كمريض'
                ], 422);
            }

            $consultations = Consultation::where('patient_id', $patient->id)
                ->with(['doctor.user', 'doctor.department'])
                ->latest()
                ->get();

            return response()->json([
                'success' => true,
                'consultations' => $consultations,
            ]);
        }

        // إذا كان المستخدم طبيب
        if ($user->role === 'doctor') {

            $doctor = $user->doctor;

            if (!$doctor) {
                return response()->json([
                    'success' => false,
                    'message' => 'المستخدم غير مسجل كطبيب'
                ], 422);
            }

            $query = Consultation::with('patient.user')
                ->where('doctor_id', $doctor->id);

            if ($request->filled('status')) {
                $query->where('status', $request->status);
            }

            if ($request->filled('search')) {
                $search = $request->search;

                $query->whereHas('patient.user', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%");
                });
            }

            $consultations = $query
                ->latest()
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
                'consultations' => $consultations
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'غير مسموح لهذا المستخدم'
        ], 403);
    }

    /**
     * إنشاء استشارة جديدة من المريض
     */
    public function store(Request $request, $doctor_id)
    {
        $request->validate([
            'message' => 'required|string',
        ]);

        $doctor = Doctor::find($doctor_id);

        if (!$doctor) {
            return response()->json([
                'success' => false,
                'message' => 'الطبيب غير موجود'
            ], 404);
        }

        $patient = auth()->user()->patient;

        if (!$patient) {
            return response()->json([
                'success' => false,
                'message' => 'المستخدم غير مسجل كمريض'
            ], 422);
        }

        $consultation = Consultation::create([
            'message' => $request->message,
            'doctor_id' => $doctor->id,
            'patient_id' => $patient->id,
            'doctor_reply' => null,
            'status' => 'open',
        ]);

        $consultation->load([
            'doctor.user',
            'doctor.department'
        ]);

        return response()->json([
            'success' => true,
            'message' => 'تم ارسال الاستشارة بنجاح',
            'consultation' => $consultation,
        ], 201);
    }

    /**
     * رد الطبيب على الاستشارة
     */
    public function reply(Request $request, $id)
    {
        $request->validate([
            'doctor_reply' => 'required|string'
        ]);

        $doctor = $request->user()->doctor;

        if (!$doctor) {
            return response()->json([
                'success' => false,
                'message' => 'المستخدم غير مسجل كطبيب'
            ], 422);
        }

        $consultation = Consultation::where('id', $id)
            ->where('doctor_id', $doctor->id)
            ->firstOrFail();

        $consultation->update([
            'doctor_reply' => $request->doctor_reply,
            'status' => 'closed',
        ]);

        return response()->json([
            'message' => 'تم إرسال الرد بنجاح'
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
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
}
