<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SecurityScan extends Model
{
    protected $fillable = ['instance_id', 'type', 'status', 'result', 'scanned_at'];

    protected $casts = [
        'result' => 'json',
        'scanned_at' => 'datetime',
    ];

    public function instance()
    {
        return $this->belongsTo(Instance::class);
    }
}
