<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AppointmentSeeder extends Seeder
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

        DB::table('appointments')->insert([
            [
                'appointment_datetime' => '2026-09-10 09:00:00',
                'status' => 'available',
                'diagnosis' => null,
                'doctor_id' => $dima,
                'patient_id' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'appointment_datetime' => '2026-09-10 10:00:00',
                'status' => 'available',
                'diagnosis' => null,
                'doctor_id' => $dima,
                'patient_id' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'appointment_datetime' => '2026-09-10 11:00:00',
                'status' => 'available',
                'diagnosis' => null,
                'doctor_id' => $nobogh,
                'patient_id' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'appointment_datetime' => '2026-09-11 09:00:00',
                'status' => 'booked',
                'diagnosis' => null,
                'doctor_id' => $dima,
                'patient_id' => $mohamed,
                'created_at' => now(),
                'updated_at' => now(),
            ],

            [
                'appointment_datetime' => '2026-09-10 09:00:00',
                'status' => 'available',
                'diagnosis' => null,
                'doctor_id' => $nobogh,
                'patient_id' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'appointment_datetime' => '2026-09-10 10:00:00',
                'status' => 'available',
                'diagnosis' => null,
                'doctor_id' => $nobogh,
                'patient_id' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'appointment_datetime' => '2026-09-11 10:00:00',
                'status' => 'booked',
                'diagnosis' => null,
                'doctor_id' => $nobogh,
                'patient_id' => $fatima,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'appointment_datetime' => '2026-09-12 10:00:00',
                'status' => 'completed',
                'diagnosis' => 'التهاب حلق',
                'doctor_id' => $nobogh,
                'patient_id' => $fatima,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
