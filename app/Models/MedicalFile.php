<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MedicalFile extends Model
{
    protected $fillable = [
        'patient_id',
        'requested_by',
        'performed_by',
        'file_type',
        'file_url',
        'result',
        'status'
    ];

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    public function requestedBy()
    {
        return $this->belongsTo(Doctor::class, 'requested_by');
    }

    public function performedBy()
    {
        return $this->belongsTo(Doctor::class, 'performed_by');
    }
}