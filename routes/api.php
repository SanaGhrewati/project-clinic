<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\DepartmentController;
use App\Http\Controllers\Api\DoctorController;
use App\Http\Controllers\Api\AppointmentController;
use App\Http\Controllers\Api\PrescriptionController;
use App\Http\Controllers\Api\ConsultationController;
use App\Http\Controllers\Api\MedicalFileController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\DoctorPatientController;
use App\Http\Controllers\Api\StaffController;


// Authentication
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);


// Protected routes
Route::middleware('auth:sanctum')->group(function () {

    // User
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    Route::post('/logout', [AuthController::class, 'logout']);


    // Departments
    Route::apiResource('departments', DepartmentController::class)
        ->only(['index', 'show']);


    // Doctors
    Route::apiResource('doctors', DoctorController::class)
        ->only(['index', 'show']);

    Route::get(
        '/departments/{department_id}/doctors',
        [DoctorController::class, 'getDoctorByDepartment']
    );


    // Appointments
    Route::controller(AppointmentController::class)->group(function () {

        Route::get(
            '/doctors/{doctor_id}/appointments/available',
            'getAvailableAppointments'
        );

        Route::get('/appointments', 'index');

        Route::post('/appointments', 'store');

        Route::put('/appointments/{id}/cancel', 'cancel');

        Route::get('/appointments/{id}', 'show');
    });


    // Prescriptions
    Route::apiResource('prescriptions', PrescriptionController::class)
        ->only(['index', 'show']);


    // Consultations - Patient
    Route::post(
        '/doctors/{doctor_id}/consultations',
        [ConsultationController::class, 'store']
    );

    Route::get(
        '/consultations',
        [ConsultationController::class, 'index']
    );


    // Medical File - Patient
    Route::get(
        '/medical-file',
        [MedicalFileController::class, 'index']
    );


    // Profile - Patient
    Route::get(
        '/profile',
        [ProfileController::class, 'show']
    );

    Route::put(
        '/profile',
        [ProfileController::class, 'update']
    );


    // Admin
    Route::get(
        '/admin/stats',
        [AdminController::class, 'stats']
    );

    Route::get(
        '/doctors',
        [AdminController::class, 'index']
    );

    Route::post(
        '/doctors',
        [AdminController::class, 'store']
    );

    Route::put(
        '/doctors/{id}',
        [AdminController::class, 'update']
    );

    Route::delete(
        '/doctors/{id}',
        [AdminController::class, 'destroy']
    );


    // Doctor
    Route::get(
        '/doctor/appointments',
        [DoctorController::class, 'appointments']
    );

    Route::get(
        '/doctor/dashboard',
        [DoctorController::class, 'dashboard']
    );

    Route::post(
        '/doctor/appointments',
        [DoctorController::class, 'createAppointment']
    );

    Route::patch(
        '/doctor/appointments/{id}',
        [DoctorController::class, 'completeAppointment']
    );

    Route::get(
        '/doctor/patients/{patient}',
        [DoctorPatientController::class, 'show']
    );

    Route::post(
        '/doctor/prescriptions',
        [PrescriptionController::class, 'store']
    );

    Route::post(
        '/doctor/medical-files',
        [MedicalFileController::class, 'store']
    );

    Route::get(
        '/doctor/consultations',
        [ConsultationController::class, 'index']
    );

    Route::post(
        '/doctor/consultations/{id}/reply',
        [ConsultationController::class, 'reply']
    );


    // Staff
    Route::get(
        '/staff/requests',
        [StaffController::class, 'index']
    );

    Route::get(
        '/staff/requests/{id}',
        [StaffController::class, 'show']
    );

    Route::post(
        '/staff/requests/{id}',
        [StaffController::class, 'update']
    );

    Route::get(
        '/staff/stats',
        [StaffController::class, 'stats']
    );
});
