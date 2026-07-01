<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
   public function run(): void
{
    DB::table('users')->insert([
        [
            'name' => 'Admin',
            'email' => 'admin@clinic.com',
            'password' => Hash::make('0000'),
            'role' => 'admin',
            'approved' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ],
        [
            'name' => 'أحمد الخالد',
            'email' => 'ahmed@clinic.com',
            'password' => Hash::make('123'),
            'role' => 'doctor',
            'approved' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ],
        [
            'name' => 'سارة منصور',
            'email' => 'sara@clinic.com',
            'password' => Hash::make('123'),
            'role' => 'doctor',
            'approved' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ],
        [
            'name' => 'كريم العمر',
            'email' => 'karim@clinic.com',
            'password' => Hash::make('123'),
            'role' => 'doctor',
            'approved' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ],
        
        [
            'name' => 'لينا حسن',
            'email' => 'lina@clinic.com',
            'password' => Hash::make('123'),
            'role' => 'doctor',
            'approved' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ],
        [
            'name' => 'عمر سالم',
            'email' => 'omar@clinic.com',
            'password' => Hash::make('123'),
            'role' => 'doctor',
            'approved' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ],
        [
            'name' => 'نور الدين',
            'email' => 'noor@clinic.com',
            'password' => Hash::make('123'),
            'role' => 'doctor',
            'approved' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ],
        [
            'name' => 'محمد علي',
            'email' => 'mohamed@gmail.com',
            'password' => Hash::make('password123'),
            'role' => 'patient',
            'approved' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ],
        [
            'name' => 'فاطمة حسن',
            'email' => 'fatima@gmail.com',
            'password' => Hash::make('password123'),
            'role' => 'patient',
            'approved' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ],
        [
            'name' => 'خالد أحمد',
            'email' => 'khalid@gmail.com',
            'password' => Hash::make('password123'),
            'role' => 'patient',
            'approved' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ],
    ]);
} 
   
}
