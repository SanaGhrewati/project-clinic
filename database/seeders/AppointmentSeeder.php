<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AppointmentSeeder extends Seeder
{
 public function run(): void
{
    DB::table('appointments')->insert([
        
        [
            'appointment_datetime' => '2026-06-10 09:00:00',
            'status' => 'available',
            'diagnosis' => null,
            'doctor_id' => 1,
            'patient_id' => null,
            'created_at' => now(),
            'updated_at' => now(),
        ],
        [
            'appointment_datetime' => '2026-06-10 10:00:00',
            'status' => 'available',
            'diagnosis' => null,
            'doctor_id' => 1,
            'patient_id' => null,
            'created_at' => now(),
            'updated_at' => now(),
        ],
        [
            'appointment_datetime' => '2026-06-10 11:00:00',
            'status' => 'available',
            'diagnosis' => null,
            'doctor_id' => 1,
            'patient_id' => null,
            'created_at' => now(),
            'updated_at' => now(),
        ],
        
        [
            'appointment_datetime' => '2026-06-11 09:00:00',
            'status' => 'booked',
            'diagnosis' => null,
            'doctor_id' => 1,
            'patient_id' => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ],
        
        [
            'appointment_datetime' => '2026-06-10 09:00:00',
            'status' => 'available',
            'diagnosis' => null,
            'doctor_id' => 2,
            'patient_id' => null,
            'created_at' => now(),
            'updated_at' => now(),
        ],
        [
            'appointment_datetime' => '2026-06-10 10:00:00',
            'status' => 'available',
            'diagnosis' => null,
            'doctor_id' => 2,
            'patient_id' => null,
            'created_at' => now(),
            'updated_at' => now(),
        ],
        
        [
            'appointment_datetime' => '2026-06-11 10:00:00',
            'status' => 'booked',
            'diagnosis' => null,
            'doctor_id' => 2,
            'patient_id' => 2,
            'created_at' => now(),
            'updated_at' => now(),
        ],
        [
            'appointment_datetime' => '2026-06-12 10:00:00',
            'status' => 'completed',
            'diagnosis' => 'التهاب حلق',
            'doctor_id' => 2,
            'patient_id' => 2,
            'created_at' => now(),
            'updated_at' => now(),
        ]
    ]);
}  
}
