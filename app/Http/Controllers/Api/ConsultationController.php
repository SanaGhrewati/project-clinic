<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Consultation;

class ConsultationController extends Controller
{
    public function index(Request $request)
    {
        $doctor = $request->user()->doctor;

        $query = Consultation::with('patient.user')
            ->where('doctor_id', $doctor->id);

        if ($request->status) {
            $query->where('status', $request->status);
        }

        if ($request->search) {
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
                    'patient_name' => $consultation->patient->user->name,
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

    public function reply(Request $request, $id)
    {
        $request->validate([
            'doctor_reply' => 'required|string'
        ]);

        $doctor = $request->user()->doctor;

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
}