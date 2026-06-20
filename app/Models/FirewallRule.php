<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FirewallRule extends Model
{
    protected $fillable = ['ip_address', 'type', 'notes', 'is_active', 'created_by'];

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
