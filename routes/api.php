<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\DoctorController;
use App\Http\Controllers\Api\DoctorPatientController;
use App\Http\Controllers\Api\PrescriptionController;
use App\Http\Controllers\Api\MedicalFileController;
use App\Http\Controllers\Api\ConsultationController;
use App\Http\Controllers\Api\StaffController;

Route::post('/login', [AuthController::class, 'login']);



Route::middleware('auth:sanctum')->group(function () {


    Route::get('/user', function (Request $request) {

        return $request->user();

    });

    
    Route::post('/logout', [AuthController::class, 'logout']);


    Route::get('/admin/stats',
    [AdminController::class,'stats']);


    Route::get('/doctors', [AdminController::class, 'index']);

    Route::post('/doctors', [AdminController::class, 'store']);

    Route::put('/doctors/{id}', [AdminController::class, 'update']);

    Route::delete('/doctors/{id}', [AdminController::class, 'destroy']);

    Route::get('/doctor/appointments', [DoctorController::class, 'appointments']);

    Route::get('/doctor/dashboard', [DoctorController::class, 'dashboard']);

    Route::post('/doctor/appointments', [DoctorController::class, 'createAppointment']);

    Route::patch('/doctor/appointments/{id}', [DoctorController::class, 'completeAppointment']);

    Route::get('/doctor/patients/{patient}', [DoctorPatientController::class, 'show']);

    Route::post('/doctor/prescriptions', [PrescriptionController::class, 'store']);

    Route::post('/doctor/medical-files', [MedicalFileController::class, 'store']);

    Route::get('/doctor/consultations', [ConsultationController::class, 'index']);

    Route::post('/doctor/consultations/{id}/reply', [ConsultationController::class, 'reply']);

    Route::get('/staff/requests', [StaffController::class, 'index']);

    Route::get('/staff/requests/{id}', [StaffController::class, 'show']);
    
    Route::post('/staff/requests/{id}', [StaffController::class, 'update']);
    
    Route::get('/staff/stats', [StaffController::class, 'stats']);

});