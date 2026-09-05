<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $users = [
            [
                'name' => 'Admin',
                'email' => 'admin@clinic.com',
                'password' => Hash::make('00000000'),
                'role' => 'admin',
                'approved' => true,
            ],
            [
                'name' => 'ديما نجم',
                'email' => 'dima@clinic.com',
                'password' => Hash::make('12345678'),
                'role' => 'doctor',
                'approved' => true,
            ],
            [
                'name' => 'نبوغ حميدي',
                'email' => 'nobogh@clinic.com',
                'password' => Hash::make('12345678'),
                'role' => 'doctor',
                'approved' => true,
            ],
            [
                'name' => 'بيان مصطو',
                'email' => 'bayan@clinic.com',
                'password' => Hash::make('12345678'),
                'role' => 'doctor',
                'approved' => true,
            ],
            [
                'name' => 'مريم الأحمد',
                'email' => 'maryam@clinic.com',
                'password' => Hash::make('12345678'),
                'role' => 'doctor',
                'approved' => true,
            ],
            [
                'name' => 'سنا غريواتي',
                'email' => 'sana@clinic.com',
                'password' => Hash::make('12345678'),
                'role' => 'doctor',
                'approved' => true,
            ],
            [
                'name' => 'نور الدين',
                'email' => 'noor@clinic.com',
                'password' => Hash::make('12345678'),
                'role' => 'doctor',
                'approved' => true,
            ],
            [
                'name' => 'محمد علي',
                'email' => 'mohamed@gmail.com',
                'password' => Hash::make('password123'),
                'role' => 'patient',
                'approved' => true,
            ],
            [
                'name' => 'فاطمة حسن',
                'email' => 'fatima@gmail.com',
                'password' => Hash::make('password123'),
                'role' => 'patient',
                'approved' => true,
            ],
            [
                'name' => 'خالد أحمد',
                'email' => 'khalid@gmail.com',
                'password' => Hash::make('password123'),
                'role' => 'patient',
                'approved' => true,
            ],
        ];

        foreach ($users as $user) {
            DB::table('users')->updateOrInsert(
                ['email' => $user['email']],
                [
                    'name' => $user['name'],
                    'password' => $user['password'],
                    'role' => $user['role'],
                    'approved' => $user['approved'],
                    'updated_at' => now(),
                ]
            );
        }
    }
}
