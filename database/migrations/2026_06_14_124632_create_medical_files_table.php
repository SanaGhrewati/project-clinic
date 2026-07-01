<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    
    public function up(): void
    {
      Schema::create('medical_files', function (Blueprint $table) {
        $table->id();

        $table->foreignId('patient_id')
            ->constrained('patients')
            ->onDelete('cascade');

        $table->foreignId('requested_by')
            ->constrained('doctors')
            ->onDelete('cascade');

        $table->foreignId('performed_by')
            ->nullable()
            ->constrained('doctors')
            ->nullOnDelete();

        $table->enum('file_type', [
            'Lab',
            'Radiology'
        ]);

        $table->string('file_url')
            ->nullable();

        $table->text('result')
            ->nullable();

       $table->enum('status', [
        'pending',
        'done'
        ])->default('pending');

     $table->timestamps();
        }); 
       
       
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('medical_files');
    }
};
