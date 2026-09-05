<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\Prescription;

class PrescriptionController extends Controller
{
    /**
     * عرض وصفات المريض
     */
    public function index()
    {
        $patient = auth()->user()->patient;

        if (!$patient) {
            return response()->json([
                'success' => false,
                'message' => 'المستخدم غير مسجل كمريض'
            ], 422);
        }

        $prescriptions = Prescription::with('appointment.doctor')
            ->whereHas('appointment', function ($query) use ($patient) {
                $query->where('patient_id', $patient->id);
            })
            ->get();

        return response()->json([
            'precreption' => $prescriptions
        ]);
    }

    /**
     * إنشاء وصفة من قبل الطبيب
     */
    public function store(Request $request)
    {
        $request->validate([
            'appointment_id' => 'required|exists:appointments,id',
            'items' => 'required|array'
        ]);

        foreach ($request->items as $item) {
            Prescription::create([
                'appointment_id' => $request->appointment_id,
                'medication' => $item['medication'],
                'dosage' => $item['dosage'],
                'instruction' => $item['instruction'],
            ]);
        }

        return response()->json([
            'message' => 'Prescription saved successfully'
        ], 201);
    }

    /**
     * عرض وصفة محددة للمريض
     */
    public function show($id)
    {
        $patient = auth()->user()->patient;

        if (!$patient) {
            return response()->json([
                'success' => false,
                'message' => 'المستخدم غير مسجل كمريض'
            ], 422);
        }

        $prescription = Prescription::with('appointment')
            ->whereHas('appointment', function ($query) use ($patient) {
                $query->where('patient_id', $patient->id);
            })
            ->findOrFail($id);

        return response()->json([
            'prescription' => $prescription
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
    public function destroy(string $id)
    {
        //
    }
}
