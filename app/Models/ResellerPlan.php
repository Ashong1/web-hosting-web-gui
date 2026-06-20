<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ResellerPlan extends Model
{
    protected $fillable = [
        'reseller_id',
        'plan_id',
        'custom_price',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'custom_price' => 'decimal:2',
    ];

    /**
     * Get the reseller that owns the custom plan pricing.
     */
    public function reseller(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reseller_id');
    }

    /**
     * Get the base plan associated with this custom pricing.
     */
    public function plan(): BelongsTo
    {
        return $this->belongsTo(Plan::class);
    }
}
