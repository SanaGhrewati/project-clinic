<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DepartmentSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('departments')->insert([
            ['name' => 'قلبية', 'description' => 'علاج أمراض القلب والشرايين', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'عصبية', 'description' => 'علاج أمراض الجهاز العصبي', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'عظمية', 'description' => 'علاج الكسور والمفاصل والعظام', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'عينية', 'description' => 'علاج أمراض العيون', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'مخبر', 'description' => 'التحاليل الطبية', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'أشعة', 'description' => ' التصوير الشعاعي', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}
