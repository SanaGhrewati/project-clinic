<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class MedicalFileSeeder extends Seeder
{
    public function run(): void
    {
        // =========================
        // الحصول على المرضى عن طريق الإيميل
        // =========================

        $mohamed = DB::table('patients')
            ->join('users', 'patients.user_id', '=', 'users.id')
            ->where('users.email', 'mohamed@gmail.com')
            ->value('patients.id');

        $fatima = DB::table('patients')
            ->join('users', 'patients.user_id', '=', 'users.id')
            ->where('users.email', 'fatima@gmail.com')
            ->value('patients.id');

        $khalid = DB::table('patients')
            ->join('users', 'patients.user_id', '=', 'users.id')
            ->where('users.email', 'khalid@gmail.com')
            ->value('patients.id');


        // =========================
        // الحصول على الأطباء عن طريق الإيميل
        // =========================

        $dima = DB::table('doctors')
            ->join('users', 'doctors.user_id', '=', 'users.id')
            ->where('users.email', 'dima@clinic.com')
            ->value('doctors.id');

        $nobogh = DB::table('doctors')
            ->join('users', 'doctors.user_id', '=', 'users.id')
            ->where('users.email', 'nobogh@clinic.com')
            ->value('doctors.id');

        $sana = DB::table('doctors')
            ->join('users', 'doctors.user_id', '=', 'users.id')
            ->where('users.email', 'sana@clinic.com')
            ->value('doctors.id');

        $noor = DB::table('doctors')
            ->join('users', 'doctors.user_id', '=', 'users.id')
            ->where('users.email', 'noor@clinic.com')
            ->value('doctors.id');


        // =========================
        // إدخال الملفات الطبية
        // =========================

        DB::table('medical_files')->insert([

            // نتيجة تحليل مخبري مكتملة
            [
                'patient_id' => $mohamed,
                'requested_by' => $dima,
                'performed_by' => $sana,
                'file_type' => 'Lab',
                'file_url' => 'https://example.com/files/lab-result-1.pdf',
                'result' => 'Normal blood test results.',
                'status' => 'done',
                'created_at' => now(),
                'updated_at' => now(),
            ],

            // طلب أشعة قيد الانتظار
            [
                'patient_id' => $fatima,
                'requested_by' => $dima,
                'performed_by' => null,
                'file_type' => 'Radiology',
                'file_url' => null,
                'result' => null,
                'status' => 'pending',
                'created_at' => now(),
                'updated_at' => now(),
            ],

            // نتيجة أشعة مكتملة
            [
                'patient_id' => $khalid,
                'requested_by' => $nobogh,
                'performed_by' => $noor,
                'file_type' => 'Radiology',
                'file_url' => 'https://example.com/files/xray-1.jpg',
                'result' => 'No abnormal findings detected.',
                'status' => 'done',
                'created_at' => now(),
                'updated_at' => now(),
            ],

        ]);
    }
}