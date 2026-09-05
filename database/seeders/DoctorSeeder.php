<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DoctorSeeder extends Seeder
{
    public function run(): void
    {
        $doctors = [
            [
                'email' => 'dima@clinic.com',
                'mobile' => '0501234567',
                'doctor_type' => 'General',
                'department_id' => 1,
            ],
            [
                'email' => 'nobogh@clinic.com',
                'mobile' => '0507654321',
                'doctor_type' => 'General',
                'department_id' => 2,
            ],
            [
                'email' => 'bayan@clinic.com',
                'mobile' => '0509876543',
                'doctor_type' => 'General',
                'department_id' => 3,
            ],
            [
                'email' => 'maryam@clinic.com',
                'mobile' => '0501112233',
                'doctor_type' => 'General',
                'department_id' => 4,
            ],
            [
                'email' => 'sana@clinic.com',
                'mobile' => '0504445566',
                'doctor_type' => 'Lab',
                'department_id' => 5,
            ],
            [
                'email' => 'noor@clinic.com',
                'mobile' => '0507778899',
                'doctor_type' => 'Radiology',
                'department_id' => 6,
            ],
        ];

        foreach ($doctors as $doctor) {

            $user = DB::table('users')
                ->where('email', $doctor['email'])
                ->first();

            DB::table('doctors')->insert([
                'mobile' => $doctor['mobile'],
                'doctor_type' => $doctor['doctor_type'],
                'department_id' => $doctor['department_id'],
                'user_id' => $user->id,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
