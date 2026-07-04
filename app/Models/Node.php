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
        'api_key' => 'encrypted',
        'resource_stats' => 'array',
        'is_active' => 'boolean',
    ];

    public function getTunnelTargetAttribute(): ?string
    {
        return $this->resource_stats['tunnel_target'] ?? config('services.cloudflare.tunnel_target');
    }

    public function instances(): HasMany
    {
        return $this->hasMany(Instance::class);
    }
}
