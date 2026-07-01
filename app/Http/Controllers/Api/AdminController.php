<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Appointment;
use App\Models\Patient;


class AdminController extends Controller
{

public function stats()
{

return response()->json([


'totalDoctors' =>
User::where('role','doctor')->count(),


'patients' =>
User::where('role','patient')->count(),


'appointments' =>
Appointment::count()



]);


}


}