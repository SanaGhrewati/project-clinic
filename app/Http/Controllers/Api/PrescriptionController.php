<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Prescription;

class PrescriptionController extends Controller
{
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
        ]);
    }
}