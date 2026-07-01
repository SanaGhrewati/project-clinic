<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    
    public function up(): void
    {
       Schema::create('appointments', function (Blueprint $table) {
        $table->id();
        $table->dateTime('appointment_datetime');
        $table->enum('status', ['available', 'booked', 'completed', 'cancelled'])
          ->default('available');
        $table->text('diagnosis')->nullable();  
        $table->foreignId('doctor_id')
          ->constrained()
          ->onDelete('cascade');
        $table->foreignId('patient_id')
          ->nullable()
          ->constrained()
          ->onDelete('set null');
        $table->unique(['doctor_id', 'appointment_datetime']);
        $table->timestamps();
        });
    }

    
    public function down(): void
    {
        Schema::dropIfExists('appointments');
    }
};
