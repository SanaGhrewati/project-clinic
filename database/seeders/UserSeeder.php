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

            // الأطباء
            [
                'name' => 'ديما نجم',
                'email' => 'dima@clinic.com',
                'password' => Hash::make('123'),
                'role' => 'doctor',
                'approved' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'نبوغ حميدي',
                'email' => 'nobogh@clinic.com',
                'password' => Hash::make('123'),
                'role' => 'doctor',
                'approved' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'بيان مصطو',
                'email' => 'bayan@clinic.com',
                'password' => Hash::make('123'),
                'role' => 'doctor',
                'approved' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'مريم الأحمد',
                'email' => 'maryam@clinic.com',
                'password' => Hash::make('123'),
                'role' => 'doctor',
                'approved' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'سنا غريواتي',
                'email' => 'sana@clinic.com',
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

            // المرضى
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