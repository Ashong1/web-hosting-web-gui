<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Plan extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'description',
        'price',
        'image',
        'features',
        'resource_limits',
        'is_active',
    ];

    protected $casts = [
        'features' => 'json',
        'resource_limits' => 'json',
        'is_active' => 'boolean',
    ];

    /**
     * Get the reseller-specific pricing for this plan.
     */
    public function resellerPlans(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(ResellerPlan::class);
    }
}
