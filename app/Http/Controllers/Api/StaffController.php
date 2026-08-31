<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\MedicalFile;
use Illuminate\Support\Facades\Auth;

class StaffController extends Controller
{
    /**
     * عرض طلبات المختص
     */
    public function index(Request $request)
    {
        $doctor = Auth::user()->doctor;

        if (
            !$doctor ||
            !in_array($doctor->doctor_type, ['Lab', 'Radiology'])
        ) {
            return response()->json([
                'message' => 'Unauthorized'
            ], 403);
        }

        $query = MedicalFile::with([
            'patient.user',
            'requestedBy.user',
            'performedBy.user'
        ]);

        // المختص المخبري يرى طلبات Lab فقط
        if ($doctor->doctor_type === 'Lab') {
            $query->where('file_type', 'Lab');
        }

        // مختص الأشعة يرى طلبات Radiology فقط
        if ($doctor->doctor_type === 'Radiology') {
            $query->where('file_type', 'Radiology');
        }

        // فلترة حسب الحالة
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // البحث باسم المريض
        if ($request->filled('search')) {

            $search = $request->search;

            $query->whereHas('patient.user', function ($q) use ($search) {

                $q->where(
                    'name',
                    'like',
                    "%{$search}%"
                );
            });
        }

        $requests = $query
            ->latest()
            ->get()
            ->map(function ($medicalFile) {

                return [
                    'id' => $medicalFile->id,

                    'patient_id' =>
                        $medicalFile->patient_id,

                    'patient_name' =>
                        $medicalFile->patient->user->name ?? '-',

                    'doctor_name' =>
                        $medicalFile->requestedBy->user->name ?? '-',

                    'file_type' =>
                        $medicalFile->file_type,

                    'file_url' =>
                        $medicalFile->file_url,

                    'result' =>
                        $medicalFile->result,

                    'status' =>
                        $medicalFile->status,

                    'created_at' =>
                        $medicalFile->created_at,
                ];
            });

        return response()->json([
            'requests' => $requests
        ]);
    }


    /**
     * عرض تفاصيل طلب واحد
     */
    public function show($id)
    {
        $doctor = Auth::user()->doctor;

        if (
            !$doctor ||
            !in_array($doctor->doctor_type, ['Lab', 'Radiology'])
        ) {
            return response()->json([
                'message' => 'Unauthorized'
            ], 403);
        }

        $medicalFile = MedicalFile::with([
            'patient.user',
            'requestedBy.user',
            'performedBy.user'
        ])->findOrFail($id);

        // التأكد أن نوع الطلب يناسب اختصاص المختص
        if (
            ($doctor->doctor_type === 'Lab' &&
                $medicalFile->file_type !== 'Lab')

            ||

            ($doctor->doctor_type === 'Radiology' &&
                $medicalFile->file_type !== 'Radiology')
        ) {
            return response()->json([
                'message' => 'Unauthorized'
            ], 403);
        }

        return response()->json([
            'request' => [
                'id' => $medicalFile->id,

                'patient_id' =>
                    $medicalFile->patient_id,

                'patient_name' =>
                    $medicalFile->patient->user->name ?? '-',

                'doctor_name' =>
                    $medicalFile->requestedBy->user->name ?? '-',

                'file_type' =>
                    $medicalFile->file_type,

                'file_url' =>
                    $medicalFile->file_url,

                'result' =>
                    $medicalFile->result,
                    'status' =>
                    $medicalFile->status,

                'created_at' =>
                    $medicalFile->created_at,
            ]
        ]);
    }


    /**
     * حفظ نتيجة الفحص
     */
    
    public function update(Request $request, $id)
{
    $doctor = Auth::user()->doctor;

    if (
        !$doctor ||
        !in_array($doctor->doctor_type, ['Lab', 'Radiology'])
    ) {
        return response()->json([
            'message' => 'Unauthorized'
        ], 403);
    }

    $medicalFile = MedicalFile::findOrFail($id);

    // التأكد أن الطلب يناسب اختصاص المختص
    if (
        ($doctor->doctor_type === 'Lab' &&
            $medicalFile->file_type !== 'Lab') ||

        ($doctor->doctor_type === 'Radiology' &&
            $medicalFile->file_type !== 'Radiology')
    ) {
        return response()->json([
            'message' => 'Unauthorized'
        ], 403);
    }

    $request->validate([
        'result' => 'nullable|string',
        'file' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:10240',
    ]);

    // حفظ النتيجة النصية
    $medicalFile->result = $request->result;

    // حفظ الملف إذا تم اختياره
    if ($request->hasFile('file')) {

        $file = $request->file('file');

        $path = $file->store(
            'medical-files',
            'public'
        );

        $medicalFile->file_url = 'storage/' . $path;
    }

    // تسجيل المختص الذي نفذ الفحص
    $medicalFile->performed_by = $doctor->id;

    // تغيير الحالة
    $medicalFile->status = 'done';

    $medicalFile->save();

    return response()->json([
        'message' => 'Result saved successfully',
        'request' => [
            'id' => $medicalFile->id,
            'patient_id' => $medicalFile->patient_id,
            'patient_name' => $medicalFile->patient->user->name ?? '-',
            'doctor_name' => $medicalFile->requestedBy->user->name ?? '-',
            'file_type' => $medicalFile->file_type,
            'file_url' => $medicalFile->file_url,
            'result' => $medicalFile->result,
            'status' => $medicalFile->status,
            'created_at' => $medicalFile->created_at,
        ]
    ]);
}

    /**
     * إحصائيات لوحة المختص
     */
    public function stats()
    {
        $doctor = Auth::user()->doctor;

        if (
            !$doctor ||
            !in_array($doctor->doctor_type, ['Lab', 'Radiology'])
        ) {
            return response()->json([
                'message' => 'Unauthorized'
            ], 403);
        }

        $query = MedicalFile::query();

        if ($doctor->doctor_type === 'Lab') {

            $query->where(
                'file_type',
                'Lab'
            );
        }

        if ($doctor->doctor_type === 'Radiology') {

            $query->where(
                'file_type',
                'Radiology'
            );
        }

        return response()->json([

            'pending' =>
                (clone $query)
                    ->where('status', 'pending')
                    ->count(),

            'completed' =>
                (clone $query)
                    ->where('status', 'done')
                    ->count(),

            'total' =>
                $query->count(),
        ]);
    }
}