<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DoctorSeeder extends Seeder
{
public function run(): void
{
   DB::table('doctors')->insert([

[
    'mobile' => '0501234567',
    'doctor_type' => 'General',
    'department_id' => 1,
    'user_id' => 1,
    'created_at' => now(),
    'updated_at' => now(),
],

[
    'mobile' => '0507654321',
    'doctor_type' => 'General',
    'department_id' => 2,
    'user_id' => 2,
    'created_at' => now(),
    'updated_at' => now(),
],

[
    'mobile' => '0509876543',
    'doctor_type' => 'General',
    'department_id' => 3,
    'user_id' => 3,
    'created_at' => now(),
    'updated_at' => now(),
],

[
    'mobile' => '0501112233',
    'doctor_type' => 'General',
    'department_id' => 4,
    'user_id' => 4,
    'created_at' => now(),
    'updated_at' => now(),
],

[
    'mobile' => '0504445566',
    'doctor_type' => 'Lab',
    'department_id' => 5,
    'user_id' => 5,
    'created_at' => now(),
    'updated_at' => now(),
],

[
    'mobile' => '0507778899',
    'doctor_type' => 'Radiology',
    'department_id' => 6,
    'user_id' => 6,
    'created_at' => now(),
    'updated_at' => now(),
],

]);
}
}
