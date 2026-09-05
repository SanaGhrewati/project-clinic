<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\MedicalFile;
use Illuminate\Support\Facades\Auth;

class MedicalFileController extends Controller
{
    /**
     * عرض الملفات الطبية الخاصة بالمريض
     */
    public function index()
    {
        $patient = auth()->user()->patient;

        if (!$patient) {
            return response()->json([
                'message' => 'المستخدم غير مسجل كمريض'
            ], 422);
        }

        $medicalFiles = MedicalFile::where('patient_id', $patient->id)
            ->with([
                'requestedBy.user:id,name',
                'performedBy.user:id,name',
            ])
            ->latest()
            ->get();

        $medicalFiles = $medicalFiles->map(function ($file) {
            return [
                'id' => $file->id,
                'file_type' => $file->file_type,
                'file_url' => $file->file_url,
                'result' => $file->result,
                'status' => $file->status,
                'requested_by_name' => $file->requestedBy?->user?->name,
                'performed_by_name' => $file->performedBy?->user?->name,
                'created_at' => $file->created_at,
                'updated_at' => $file->updated_at,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $medicalFiles
        ]);
    }

    /**
     * إنشاء طلب ملف طبي من قبل الطبيب
     */
    public function store(Request $request)
    {
        $request->validate([
            'patient_id'   => 'required|exists:patients,id',
            'file_type'    => 'required|in:Lab,Radiology',
            'request_name' => 'required|string|max:255',
            'notes'        => 'nullable|string',
        ]);

        $doctor = Auth::user()->doctor;

        if (!$doctor) {
            return response()->json([
                'message' => 'المستخدم غير مسجل كطبيب'
            ], 422);
        }

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
        ], 201);
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
