<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Validation\Rule;
use App\Models\Order;
use App\Models\Plan;

class PaymentController extends Controller
{
    public function createPaymentIntent(Request $request)
    {
        $request->validate([
            'plan_id' => 'required|exists:plans,id',
            'app_name' => 'required_without:instance_id|string|alpha_dash|max:255',
            'subdomain' => 'required_without:instance_id|string|alpha_dash|max:255|unique:instances,name',
            'instance_id' => [
                'nullable',
                Rule::exists('instances', 'id')->where('user_id', auth()->id()),
            ],
        ]);

        $plan = Plan::findOrFail($request->plan_id);

        $metadata = [
            'method' => 'hyperswitch',
        ];

        if ($request->instance_id) {
            $metadata['instance_id'] = $request->instance_id;
            $metadata['type'] = 'renewal';
        } else {
            $metadata['app_name'] = $request->app_name;
            $metadata['subdomain'] = $request->subdomain;
            $metadata['type'] = 'new_deployment';
        }

        // 1. Log a traceable order reference state into your local schema
        $order = Order::create([
            'user_id' => auth()->id(),
            'plan_id' => $plan->id,
            'plan_name' => $plan->name,
            'amount' => $plan->price,
            'status' => 'pending',
            'admin_notes' => json_encode($metadata),
        ]);

        // 2. Dispatch a secure payload request to your Hyperswitch container (.199)
        $response = Http::withHeaders([
            'api-key' => config('services.hyperswitch.secret'),
            'Content-Type' => 'application/json'
        ])->post(config('services.hyperswitch.url') . '/payments', [
            'amount' => (int) ($plan->price * 100), // Values must be passed in cents
            'currency' => 'PHP',
            'customer_id' => 'client_' . auth()->id(),
            'merchant_id' => 'merchant_aserotech',
            'order_id' => 'asero_order_' . $order->id,
            'return_url' => 'https://portal.aserotech.com/dashboard',
        ]);

        if ($response->failed()) {
            return response()->json(['error' => 'Backend payment engine connectivity failure.'], 500);
        }

        $intentData = $response->json();

        // 3. Return the client ephemeral validation key down to your React view
        return response()->json([
            'client_secret' => $intentData['client_secret'] ?? null,
            'payment_id' => $intentData['payment_id'] ?? null
        ]);
    }

    public function createTopupIntent(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric|min:50|max:50000',
        ]);

        $amount = (int) $request->amount;

        // Create a special order for topup
        $order = Order::create([
            'user_id' => auth()->id(),
            'plan_id' => null, // No specific plan
            'plan_name' => 'Credit Deposit',
            'amount' => $amount,
            'status' => 'pending',
            'admin_notes' => json_encode(['type' => 'topup', 'amount' => $amount]),
        ]);

        $response = Http::withHeaders([
            'api-key' => config('services.hyperswitch.secret'),
            'Content-Type' => 'application/json'
        ])->post(config('services.hyperswitch.url') . '/payments', [
            'amount' => $amount * 100,
            'currency' => 'PHP',
            'customer_id' => 'client_' . auth()->id(),
            'merchant_id' => 'merchant_aserotech',
            'order_id' => 'asero_order_' . $order->id,
            'return_url' => 'https://portal.aserotech.com/billing',
        ]);

        if ($response->failed()) {
            return response()->json(['error' => 'Payment engine failure.'], 500);
        }

        $intentData = $response->json();

        return response()->json([
            'client_secret' => $intentData['client_secret'] ?? null,
            'payment_id' => $intentData['payment_id'] ?? null
        ]);
    }

    public function storeManualTopup(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric|min:50|max:50000',
            'payment_proof' => 'required|image|max:5120',
        ]);

        $path = $request->file('payment_proof')->store('payment_proofs', 'public');

        $order = Order::create([
            'user_id' => auth()->id(),
            'plan_id' => null,
            'plan_name' => 'Credit Deposit (Manual)',
            'amount' => $request->amount,
            'status' => 'pending',
            'payment_proof_path' => $path,
            'admin_notes' => json_encode(['type' => 'topup', 'method' => 'qrph']),
        ]);

        \App\Models\AuditLog::log('billing.topup_manual', $order);

        return back()->with('success', 'Top-up proof submitted. Balance will be updated after verification.');
    }
}
