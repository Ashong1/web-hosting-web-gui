<?php

namespace App\Http\Controllers;

use App\Models\ResellerSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class ResellerController extends Controller
{
    public function index(Request $request)
    {
        return Inertia::render('Reseller/Index', [
            'settings' => $request->user()->resellerSettings,
        ]);
    }

    public function update(Request $request)
    {
        $request->validate([
            'brand_name' => 'nullable|string|max:50',
            'support_email' => 'nullable|email|max:100',
            'custom_domain' => 'nullable|string|max:100',
            'nameserver_1' => 'nullable|string|max:100',
            'nameserver_2' => 'nullable|string|max:100',
            'logo' => 'nullable|image|max:1024',
            'gcash_qr' => 'nullable|image|max:2048',
        ]);

        $settings = $request->user()->resellerSettings ?? new ResellerSetting(['user_id' => auth()->id()]);

        if ($request->hasFile('logo')) {
            $path = $request->file('logo')->store('branding', 'public');
            $settings->logo_path = $path;
        }

        if ($request->hasFile('gcash_qr')) {
            $path = $request->file('gcash_qr')->store('branding', 'public');
            $settings->gcash_qr_path = $path;
        }

        $settings->fill($request->only([
            'brand_name',
            'support_email',
            'custom_domain',
            'nameserver_1',
            'nameserver_2'
        ]));

        $settings->is_active = true;
        $settings->save();

        return back()->with('success', 'System protocols updated successfully.');
    }
}
