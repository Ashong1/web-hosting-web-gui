<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Instance extends Model
{
    protected $fillable = [
        'user_id',
        'node_id',
        'order_id',
        'project_type',
        'name',
        'dokploy_project_id',
        'dokploy_service_id',
        'dokploy_database_id',
        'webhook_secret',
        'repository_url',
        'repository_branch',
        'build_command',
        'compose_file',
        'install_command',
        'env_vars',
        'deployment_status',
        'public_url',
        'status',
        'auto_backups_enabled',
        'replicas',
        'credentials',
        'provisioning_progress',
    ];

    protected $casts = [
        'credentials' => 'json',
        'provisioning_progress' => 'json',
        'env_vars' => 'encrypted:json',
        'auto_backups_enabled' => 'boolean',
        'webhook_secret' => 'encrypted',
    ];

    /**
     * Get the user that owns the instance.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the order that created the instance.
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function backups(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(InstanceBackup::class);
    }

    public function metricsHistory(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(InstanceMetricsHistory::class);
    }
}
