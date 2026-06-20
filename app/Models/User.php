<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'is_reseller',
        'is_suspended',
        'credits',
        'referral_code',
        'referred_by',
        'provider_id',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $appends = [];

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($user) {
            if (!$user->referral_code) {
                $user->referral_code = 'ASERO-' . strtoupper(\Illuminate\Support\Str::random(8));
            }
        });
    }

    const ROLE_ROOT = 'root';
    const ROLE_SUPPORT = 'support';
    const ROLE_BILLING = 'billing';
    const ROLE_CLIENT = 'client';

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_suspended' => 'boolean',
            'is_reseller' => 'boolean',
        ];
    }

    public function hasAdminRole(): bool
    {
        return in_array($this->role, [self::ROLE_ROOT, self::ROLE_SUPPORT, self::ROLE_BILLING]);
    }

    public function isRoot(): bool
    {
        return $this->role === self::ROLE_ROOT;
    }

    /**
     * Virtual attribute for frontend admin checks.
     */
    public function getIsAdminAttribute(): bool
    {
        return $this->hasAdminRole();
    }

    /**
     * Get the orders for the user.
     */
    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    /**
     * Get the instances for the user.
     */
    public function instances(): HasMany
    {
        return $this->hasMany(Instance::class);
    }

    /**
     * Get the API keys for the user.
     */
    public function apiKeys(): HasMany
    {
        return $this->hasMany(ApiKey::class);
    }

    /**
     * Get the tickets for the user.
     */
    public function tickets(): HasMany
    {
        return $this->hasMany(Ticket::class);
    }

    /**
     * Get the audit logs for the user.
     */
    public function auditLogs(): HasMany
    {
        return $this->hasMany(AuditLog::class);
    }

    public function referrer()
    {
        return $this->belongsTo(User::class, 'referred_by');
    }

    public function referrals()
    {
        return $this->hasMany(Referral::class, 'referrer_id');
    }

    public function creditTransactions(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(CreditTransaction::class);
    }

    public function resellerSettings()
    {
        return $this->hasOne(ResellerSetting::class);
    }

    /**
     * Get the reseller plans for this user (if they are a reseller).
     */
    public function resellerPlans(): HasMany
    {
        return $this->hasMany(ResellerPlan::class, 'reseller_id');
    }

    /**
     * Get the reseller (provider) that owns this user.
     */
    public function provider()
    {
        return $this->belongsTo(User::class, 'provider_id');
    }

    /**
     * Get the clients owned by this reseller.
     */
    public function subClients()
    {
        return $this->hasMany(User::class, 'provider_id');
    }

    /**
     * Get the orders from sub-clients (for resellers).
     */
    public function subClientOrders()
    {
        return $this->hasManyThrough(Order::class, User::class, 'provider_id', 'user_id');
    }
}
