<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ConsultationSeeder extends Seeder
{
    public function run(): void
    {
        $dima = DB::table('doctors')
            ->join('users', 'doctors.user_id', '=', 'users.id')
            ->where('users.email', 'dima@clinic.com')
            ->value('doctors.id');

        $nobogh = DB::table('doctors')
            ->join('users', 'doctors.user_id', '=', 'users.id')
            ->where('users.email', 'nobogh@clinic.com')
            ->value('doctors.id');

        $mohamed = DB::table('patients')
            ->join('users', 'patients.user_id', '=', 'users.id')
            ->where('users.email', 'mohamed@gmail.com')
            ->value('patients.id');

        $fatima = DB::table('patients')
            ->join('users', 'patients.user_id', '=', 'users.id')
            ->where('users.email', 'fatima@gmail.com')
            ->value('patients.id');

        DB::table('consultations')->insert([

            [
                'message' => 'لدي صداع مستمر منذ عدة أيام وأشعر بالتعب.',
                'doctor_reply' => 'يفضل الحصول على قسط كافٍ من الراحة وشرب كمية كافية من الماء. إذا استمر الصداع يرجى إجراء الفحوصات اللازمة.',
                'status' => 'closed',
                'doctor_id' => $dima,
                'patient_id' => $mohamed,
                'created_at' => now(),
                'updated_at' => now(),
            ],

            [
                'message' => 'أعاني من ألم في الحلق وارتفاع بسيط في الحرارة.',
                'doctor_reply' => null,
                'status' => 'open',
                'doctor_id' => $dima,
                'patient_id' => $fatima,
                'created_at' => now(),
                'updated_at' => now(),
            ],

            [
                'message' => 'أشعر بألم في الظهر منذ أسبوع تقريباً.',
                'doctor_reply' => 'يفضل تجنب المجهود الزائد وإجراء فحص سريري لتحديد سبب الألم.',
                'status' => 'closed',
                'doctor_id' => $nobogh,
                'patient_id' => $mohamed,
                'created_at' => now(),
                'updated_at' => now(),
            ],

            [
                'message' => 'أريد الاستفسار عن نتيجة الفحص الأخير.',
                'doctor_reply' => null,
                'status' => 'open',
                'doctor_id' => $nobogh,
                'patient_id' => $fatima,
                'created_at' => now(),
                'updated_at' => now(),
            ],

        ]);
    }
}
