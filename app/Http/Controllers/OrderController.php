<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Order;
use App\Models\Plan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $reseller = null;
        $adminSettings = null;

        // 1. Resolve Reseller Context
        if ($user->provider_id) {
            $reseller = User::find($user->provider_id);
            $adminSettings = $reseller->resellerSettings;
        }

        // 2. If no reseller, use Root settings
        if (!$adminSettings) {
            $adminSettings = \App\Models\ResellerSetting::whereHas('user', function ($query) {
                $query->where('role', 'root');
            })->first();
        }

        // 3. Fetch Plans with Pricing Context
        $plans = Plan::where('is_active', true)->orderBy('price', 'asc')->get()->map(function ($plan) use ($reseller) {
            if ($reseller) {
                $override = $reseller->resellerPlans()->where('plan_id', $plan->id)->first();
                if ($override) {
                    $plan->price = $override->custom_price;
                }
            }
            return $plan;
        })->sortBy('price')->values();

        return Inertia::render('Orders/Index', [
            'plans' => $plans,
            'adminSettings' => $adminSettings
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'plan_id' => 'required|string',
            'app_name' => 'required|string|alpha_dash|max:255',
            'subdomain' => 'required|string|alpha_dash|max:255|unique:instances,name',
            'payment_method' => 'required|in:hyperswitch,credits,qrph',
            'payment_proof' => 'required_if:payment_method,qrph|image|max:5120',
            'cpu' => 'required_if:plan_id,custom|nullable|numeric|min:0.5|max:8',
            'ram' => 'required_if:plan_id,custom|nullable|integer|min:512|max:16384',
            'storage' => 'required_if:plan_id,custom|nullable|integer|min:10|max:200',
            'replicas' => 'nullable|integer|min:1|max:5',
        ]);

        $user = $request->user();
        $reseller = $user->provider_id ? User::find($user->provider_id) : null;

        if ($request->plan_id === 'custom') {
            $cpu = (float) $request->cpu;
            $memory = (int) $request->ram;
            $storage = (int) $request->storage;
            $replicas = (int) ($request->replicas ?? 1);

            $rates = config('services.pricing.rates');
            $unitPrice = ($cpu * $rates['cpu']) + (($memory / 1024.0) * $rates['ram']) + ($storage * $rates['storage']);
            $effectivePrice = $unitPrice * $replicas;

            $plan = new Plan();
            $plan->id = null;
            $plan->name = "Custom Flex Node ({$cpu} Core, " . ($memory >= 1024 ? ($memory/1024)."GB" : $memory."MB") . " RAM, {$storage}GB SSD)";
            $plan->price = $effectivePrice;
            $plan->image = 'wordpress:latest';
            $plan->resource_limits = [
                'cpu' => $cpu,
                'memory' => $memory,
                'storage' => $storage,
                'replicas' => $replicas,
            ];
        } else {
            $plan = Plan::findOrFail($request->plan_id);
            $effectivePrice = $plan->price;
            if ($reseller) {
                $override = $reseller->resellerPlans()->where('plan_id', $plan->id)->first();
                if ($override) {
                    $effectivePrice = $override->custom_price;
                }
            }
        }

        if ($request->payment_method === 'credits') {
            if ($user->credits < $effectivePrice) {
                return back()->with('error', 'Insufficient cloud credits. Please top-up your account.');
            }

            // Deduct Credits from Client
            $user->decrement('credits', $effectivePrice);
            
            $order = Order::create([
                'user_id' => $user->id,
                'plan_id' => $plan->id,
                'plan_name' => $plan->name,
                'amount' => $effectivePrice,
                'status' => 'approved',
                'admin_notes' => json_encode([
                    'type' => 'new_deployment',
                    'app_name' => $request->app_name,
                    'subdomain' => $request->subdomain,
                    'method' => 'credits',
                    'is_reseller_order' => $reseller ? true : false,
                    'cpu' => $request->plan_id === 'custom' ? $cpu : null,
                    'ram' => $request->plan_id === 'custom' ? $memory : null,
                    'storage' => $request->plan_id === 'custom' ? $storage : null,
                    'replicas' => $request->plan_id === 'custom' ? $replicas : 1,
                ]),
            ]);

            $user->creditTransactions()->create([
                'amount' => -$effectivePrice,
                'type' => 'deduction',
                'description' => "Provisioning: {$plan->name} ({$request->app_name})",
                'balance_after' => $user->credits,
                'reference_id' => 'order_' . $order->id,
            ]);

            // If it's a reseller order, we need to deduct BASE PRICE from Reseller NOW if it's credit pay
            if ($reseller) {
                $reseller->decrement('credits', $plan->price);
                $reseller->creditTransactions()->create([
                    'amount' => -$plan->price,
                    'type' => 'deduction',
                    'description' => "Base Cost: {$plan->name} for {$user->email}",
                    'balance_after' => $reseller->credits,
                    'reference_id' => 'reseller_base_cost_' . $order->id,
                ]);
            }

            \App\Jobs\ProvisionInstanceJob::dispatch($order);

            AuditLog::log('order.credit_pay', $order);

            return redirect()->route('dashboard')->with('success', 'Credit transaction verified. Node provisioning engaged.');
        }

        if ($request->payment_method === 'qrph') {
            $path = $request->file('payment_proof')->store('payment_proofs', 'public');

            $order = Order::create([
                'user_id' => $user->id,
                'plan_id' => $plan->id,
                'plan_name' => $plan->name,
                'amount' => $effectivePrice,
                'status' => $reseller ? 'pending_reseller' : 'pending',
                'payment_proof_path' => $path,
                'admin_notes' => json_encode([
                    'type' => 'new_deployment',
                    'app_name' => $request->app_name,
                    'subdomain' => $request->subdomain,
                    'method' => 'qrph',
                    'cpu' => $request->plan_id === 'custom' ? $cpu : null,
                    'ram' => $request->plan_id === 'custom' ? $memory : null,
                    'storage' => $request->plan_id === 'custom' ? $storage : null,
                    'replicas' => $request->plan_id === 'custom' ? $replicas : 1,
                ]),
            ]);

            AuditLog::log('order.qrph_pay', $order);

            $message = $reseller 
                ? "Payment proof submitted to {$reseller->resellerSettings->brand_name}. Awaiting reseller authorization."
                : 'Payment proof submitted. Awaiting manual verification by AseroTech Fleet Ops.';

            return redirect()->route('dashboard')->with('success', $message);
        }

        // Standard flow handled by frontend Hyperswitch integration
        return back()->with('message', 'Processing payment intent...');
    }
}
