<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PrescriptionSeeder extends Seeder
{
    public function run(): void
    {

        $appointment = DB::table('appointments')
            ->join('doctors', 'appointments.doctor_id', '=', 'doctors.id')
            ->join('users', 'doctors.user_id', '=', 'users.id')
            ->where('users.email', 'nobogh@clinic.com')
            ->where('appointments.appointment_datetime', '2026-09-12 10:00:00')
            ->where('appointments.status', 'completed')
            ->first();

        if (!$appointment) {
            return;
        }


        DB::table('prescriptions')->insert([
            [
                'appointment_id' => $appointment->id,
                'medication' => 'Paracetamol',
                'dosage' => '500 mg',
                'instruction' => 'Take one tablet after meals',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
