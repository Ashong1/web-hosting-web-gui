<?php

namespace App\Http\Controllers\Reseller;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Order;
use App\Models\User;
use App\Jobs\ProvisionInstanceJob;
use App\Notifications\OrderStatusUpdated;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $reseller = $request->user();
        
        $pendingOrders = $reseller->subClientOrders()
            ->whereIn('status', ['pending', 'pending_reseller'])
            ->with('user')
            ->latest()
            ->get();

        $totalRevenue = $reseller->subClientOrders()
            ->where('status', 'approved')
            ->sum('amount');

        $totalSubClients = $reseller->subClients()->count();
        
        $activeInstances = DB::table('instances')
            ->join('users', 'instances.user_id', '=', 'users.id')
            ->where('users.provider_id', $reseller->id)
            ->count();

        return Inertia::render('Reseller/Dashboard', [
            'pendingOrders' => $pendingOrders,
            'stats' => [
                'totalRevenue' => $totalRevenue,
                'totalClients' => $totalSubClients,
                'activeInstances' => $activeInstances,
                'credits' => $reseller->credits,
            ]
        ]);
    }

    public function approveOrder(Request $request, Order $order)
    {
        $reseller = $request->user();
        
        // Ensure the order belongs to one of this reseller's clients
        if ($order->user->provider_id !== $reseller->id) {
            return abort(403);
        }

        $plan = $order->plan;
        $basePrice = $plan->price;

        if ($reseller->credits < $basePrice) {
            return back()->with('error', 'Insufficient credits to approve this order. Please top-up your reseller balance.');
        }

        DB::transaction(function () use ($reseller, $order, $basePrice, $plan) {
            // 1. Deduct Base Price from Reseller
            $reseller->decrement('credits', $basePrice);
            
            // 2. Log Reseller Transaction
            $reseller->creditTransactions()->create([
                'amount' => -$basePrice,
                'type' => 'deduction',
                'description' => "Reseller Fulfillment: {$plan->name} for {$order->user->email}",
                'balance_after' => $reseller->credits,
                'reference_id' => 'reseller_order_' . $order->id,
            ]);

            // 3. Approve the Order
            $order->update(['status' => 'approved']);

            // 4. Provision Instance
            ProvisionInstanceJob::dispatch($order);

            // 5. Notify Client
            $order->user->notify(new OrderStatusUpdated($order));

            AuditLog::log('reseller.order_approve', $order, ['reseller_id' => $reseller->id]);
        });

        return back()->with('success', 'Order approved. Infrastructure provisioning engaged.');
    }

    public function rejectOrder(Request $request, Order $order)
    {
        $reseller = $request->user();
        
        if ($order->user->provider_id !== $reseller->id) {
            return abort(403);
        }

        $order->update([
            'status' => 'rejected',
            'admin_notes' => $request->notes
        ]);

        $order->user->notify(new OrderStatusUpdated($order));

        AuditLog::log('reseller.order_reject', $order, ['reason' => $request->notes, 'reseller_id' => $reseller->id]);

        return back()->with('success', 'Order rejected.');
    }
}
