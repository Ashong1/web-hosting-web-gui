<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $host = $request->getHost();
        $user = $request->user();
        
        // 1. Resolve Reseller by Hostname
        $reseller = \App\Models\ResellerSetting::where('custom_domain', $host)->where('is_active', true)->first();

        // 2. If no domain match, resolve by User's Provider
        if (!$reseller && $user && $user->provider_id) {
            $reseller = \App\Models\ResellerSetting::where('user_id', $user->provider_id)->first();
        }

        $brand = [
            'name' => $reseller ? $reseller->brand_name : 'AseroTech',
            'logo' => $reseller ? $reseller->logo_path : null,
            'is_custom' => $reseller ? true : false,
            'support_email' => $reseller ? $reseller->support_email : 'fleet@aserotech.com',
            'colors' => $reseller ? $reseller->colors : null,
        ];

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user ? $user->load('resellerSettings') : null,
            ],
            'brand' => $brand,
            'pricing_rates' => config('services.pricing.rates'),
        ];
    }
}
