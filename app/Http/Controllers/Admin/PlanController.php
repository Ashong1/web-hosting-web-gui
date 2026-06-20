<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Plan;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class PlanController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Plans/Index', [
            'plans' => Plan::latest()->get()
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric',
            'image' => 'required|string',
            'description' => 'nullable|string',
            'features' => 'required|array',
            'resource_limits' => 'required|array',
        ]);

        $validated['slug'] = Str::slug($validated['name']);
        
        Plan::create($validated);

        return back()->with('success', 'Plan created successfully.');
    }

    public function update(Request $request, Plan $plan)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric',
            'image' => 'required|string',
            'description' => 'nullable|string',
            'features' => 'required|array',
            'resource_limits' => 'required|array',
            'is_active' => 'required|boolean',
        ]);

        $validated['slug'] = Str::slug($validated['name']);
        
        $plan->update($validated);

        return back()->with('success', 'Plan updated successfully.');
    }

    public function destroy(Plan $plan)
    {
        $plan->delete();
        return back()->with('success', 'Plan deleted.');
    }
}
