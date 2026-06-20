<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ResellerSetting extends Model
{
    protected $fillable = [
        'user_id',
        'brand_name',
        'logo_path',
        'gcash_qr_path',
        'custom_domain',
        'support_email',
        'nameserver_1',
        'nameserver_2',
        'colors',
        'is_active'
    ];

    protected $casts = [
        'colors' => 'json',
        'is_active' => 'boolean'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
