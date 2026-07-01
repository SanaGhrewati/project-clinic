<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PatientSeeder extends Seeder
{
 public function run(): void
{
    DB::table('patients')->insert([
        [
            
            'mobile' => '0551234567',
            'gender' => 'male',
            'birthdate' => '1990-05-15',
            'address' => 'الفرقان',
            'user_id' => 7,
            'created_at' => now(),
            'updated_at' => now(),
        ],
        [
    
            'mobile' => '0559876543',
            'gender' => 'female',
            'birthdate' => '1985-11-20',
            'address' => 'شارع النيل',
            'user_id' => 8,
            'created_at' => now(),
            'updated_at' => now(),
        ],
        [
            
            'mobile' => '0553334444',
            'gender' => 'male',
            'birthdate' => '1995-03-10',
            'address' => 'الموغامبو',
            'user_id' => 9,
            'created_at' => now(),
            'updated_at' => now(),
        ],
    ]);
}  
}
