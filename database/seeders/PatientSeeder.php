<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PatientSeeder extends Seeder
{
    public function run(): void
    {
        $patients = [
            [
                'email' => 'mohamed@gmail.com',
                'mobile' => '0551234567',
                'gender' => 'male',
                'birthdate' => '1990-05-15',
                'address' => 'الفرقان',
            ],
            [
                'email' => 'fatima@gmail.com',
                'mobile' => '0559876543',
                'gender' => 'female',
                'birthdate' => '1985-11-20',
                'address' => 'شارع النيل',
            ],
            [
                'email' => 'khalid@gmail.com',
                'mobile' => '0553334444',
                'gender' => 'male',
                'birthdate' => '1995-03-10',
                'address' => 'الموغامبو',
            ],
        ];

        foreach ($patients as $patient) {

            $user = DB::table('users')
                ->where('email', $patient['email'])
                ->first();

            DB::table('patients')->insert([
                'mobile' => $patient['mobile'],
                'gender' => $patient['gender'],
                'birthdate' => $patient['birthdate'],
                'address' => $patient['address'],
                'user_id' => $user->id,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
