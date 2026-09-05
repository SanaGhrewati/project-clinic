<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{

    public function up(): void
    {
        Schema::create('consultations', function (Blueprint $table) {
            $table->id();
            $table->text('message');
            $table->text('doctor_reply')->nullable();
            $table->enum('status', ['open', 'closed'])
                ->default('open');
            $table->foreignId('doctor_id')
                ->constrained()
                ->onDelete('cascade');
            $table->foreignId('patient_id')
                ->constrained()
                ->onDelete('cascade');
            $table->timestamps();
        });
    }


    public function down(): void
    {
        Schema::dropIfExists('consultations');
    }
};
