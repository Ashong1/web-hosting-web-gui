<?php

namespace App\Http\Controllers\Reseller;

use App\Http\Controllers\Controller;
use App\Models\Plan;
use App\Models\ResellerPlan;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PlanController extends Controller
{
    public function index(Request $request)
    {
        $reseller = $request->user();
        $plans = Plan::where('is_active', true)->orderBy('price', 'asc')->get();
        $overrides = $reseller->resellerPlans->keyBy('plan_id');

        return Inertia::render('Reseller/Plans', [
            'plans' => $plans,
            'overrides' => $overrides,
        ]);
    }

    public function update(Request $request)
    {
        $request->validate([
            'plan_id' => 'required|exists:plans,id',
            'custom_price' => 'required|numeric|min:0',
        ]);

        ResellerPlan::updateOrCreate(
            [
                'reseller_id' => auth()->id(),
                'plan_id' => $request->plan_id,
            ],
            [
                'custom_price' => $request->custom_price,
                'is_active' => true,
            ]
        );

        return back()->with('success', 'Custom pricing updated successfully.');
    }
}
