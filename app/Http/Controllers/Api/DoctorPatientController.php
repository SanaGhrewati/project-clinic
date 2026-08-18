<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\Patient;
use App\Models\Appointment;
use App\Models\Prescription;
use App\Models\MedicalFile;

class DoctorPatientController extends Controller
{

public function show(Request $request, Patient $patient)
    {
        $appointment = Appointment::with('doctor.user')
            ->where('patient_id', $patient->id)
            ->when($request->appointment_id, function ($query) use ($request) {
                $query->where('id', $request->appointment_id);
            })
            ->latest('appointment_datetime')
            ->first();

        $labs = MedicalFile::where('patient_id', $patient->id)
            ->where('file_type', 'Lab')
            ->latest()
            ->get();

        $radiology = MedicalFile::where('patient_id', $patient->id)
            ->where('file_type', 'Radiology')
            ->latest()
            ->get();

        $prescriptions = Prescription::whereHas('appointment', function ($query) use ($patient) {
            $query->where('patient_id', $patient->id);
        })->get();

        $appointments = Appointment::where('patient_id', $patient->id)
            ->orderByDesc('appointment_datetime')
            ->get();

        return response()->json([
            'patient' => [
            'id' => $patient->id,
            'name' => $patient->user->name,
            'mobile' => $patient->mobile,
            'gender' => $patient->gender,
            'birthdate' => $patient->birthdate,
            'address' => $patient->address,
            'file_number' => $patient->id,
            'age' => \Carbon\Carbon::parse($patient->birthdate)->age,
            ],
            'appointment' => $appointment,
            'labs' => $labs,
            'radiology' => $radiology,
            'prescriptions' => $prescriptions,
            'appointments' => $appointments,
        ]);
    }

}
