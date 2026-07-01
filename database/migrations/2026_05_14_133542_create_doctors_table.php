<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    
    public function up(): void
    {
       Schema::create('doctors', function (Blueprint $table) {
         $table->id();
         $table->string('mobile');
         $table->enum('doctor_type', [
            'General',
            'Lab',
            'Radiology'
          ]);
         $table->foreignId('department_id')
          ->constrained()
          ->onDelete('cascade');
         $table->foreignId('user_id')
          ->unique()
          ->constrained()
          ->onDelete('cascade');
         $table->timestamps();
        });
    }

    
    public function down(): void
    {
        Schema::dropIfExists('doctors');
    }
};
