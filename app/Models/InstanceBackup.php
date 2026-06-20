<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InstanceBackup extends Model
{
    protected $fillable = ['instance_id', 'name', 'backup_id', 'storage_disk', 'status', 'size_bytes'];

    public function instance()
    {
        return $this->belongsTo(Instance::class);
    }
}
