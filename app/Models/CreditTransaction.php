<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CreditTransaction extends Model
{
    protected $fillable = [
        'user_id',
        'amount',
        'type',
        'description',
        'balance_after',
        'reference_id'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
