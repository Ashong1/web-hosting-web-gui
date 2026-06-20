<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ApiKey extends Model
{
    protected $fillable = ['user_id', 'name', 'key', 'last_used_at'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
