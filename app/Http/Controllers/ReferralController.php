<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class ReferralController extends Controller
{
    public function index(Request $request)
    {
        return Inertia::render('Referrals/Index', [
            'referral_code' => $request->user()->referral_code,
            'referrals' => $request->user()->referrals()->with('referred')->latest()->get(),
            'total_earned' => $request->user()->referrals()->sum('commission_earned'),
        ]);
    }
}
