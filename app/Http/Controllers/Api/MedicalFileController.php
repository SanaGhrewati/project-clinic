<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\MedicalFile;
use Illuminate\Support\Facades\Auth;

class MedicalFileController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'patient_id'   => 'required|exists:patients,id',
            'file_type'    => 'required|in:Lab,Radiology',
            'request_name' => 'required|string|max:255',
            'notes'        => 'nullable|string',
        ]);

        $doctor = Auth::user()->doctor;

        MedicalFile::create([
            'patient_id'   => $request->patient_id,
            'requested_by' => $doctor->id,
            'performed_by' => null,
            'file_type'    => $request->file_type,
            'file_url'     => $request->request_name,
            'result'       => $request->notes,
            'status'       => 'pending',
        ]);

        return response()->json([
            'message' => 'Medical file request created successfully'
        ]);
    }
}