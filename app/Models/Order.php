<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Order extends Model
{
    protected $fillable = [
        'user_id',
        'plan_id',
        'plan_name',
        'amount',
        'payment_proof_path',
        'status',
        'expires_at',
        'suspended_at',
        'admin_notes',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'suspended_at' => 'datetime',
    ];

    /**
     * Get the user that owns the order.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the plan associated with the order.
     */
    public function plan(): BelongsTo
    {
        return $this->belongsTo(Plan::class);
    }

    /**
     * Get the instance associated with the order.
     */
    public function instance(): HasOne
    {
        return $this->hasOne(Instance::class);
    }
}
