<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Node extends Model
{
    protected $fillable = [
        'name',
        'ip_address',
        'api_url',
        'api_key',
        'location',
        'status',
        'resource_stats',
        'is_active',
    ];

    protected $casts = [
        'resource_stats' => 'array',
        'is_active' => 'boolean',
    ];

    public function instances(): HasMany
    {
        return $this->hasMany(Instance::class);
    }
}
