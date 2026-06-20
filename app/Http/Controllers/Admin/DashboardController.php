<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Order;
use App\Models\Instance;
use App\Services\DokployService;
use App\Jobs\ProvisionInstanceJob;
use App\Notifications\OrderStatusUpdated;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(DokployService $dokploy)
    {
        $totalRevenue = Order::where('status', 'approved')->orWhere('status', 'fulfilled')->sum('amount');
        
        // Fetch live count from Dokploy
        $liveApplications = $dokploy->getAllApplications();
        $activeInstancesCount = collect($liveApplications)->where('status', 'running')->count();

        $recentOrders = Order::with('user')
            ->latest()
            ->limit(5)
            ->get()
            ->map(fn ($order) => [
                'id' => $order->id,
                'type' => 'order',
                'description' => "Order #{$order->id} by {$order->user->email} ({$order->status})",
                'created_at' => $order->created_at->diffForHumans(),
            ]);

        $recentInstances = Instance::with('user')
            ->latest()
            ->limit(5)
            ->get()
            ->map(fn ($instance) => [
                'id' => $instance->id,
                'type' => 'instance',
                'description' => "Instance '{$instance->name}' deployed by {$instance->user->email}",
                'created_at' => $instance->created_at->diffForHumans(),
            ]);

        $recentActivity = $recentOrders->concat($recentInstances)
            ->sortByDesc('created_at')
            ->values()
            ->take(5);

        return Inertia::render('Admin/Dashboard', [
            'pendingOrders' => Order::where('status', 'pending')->with('user')->get(),
            'totalClients' => \App\Models\User::where('role', 'client')->where('is_suspended', false)->count(),
            'activeInstances' => $activeInstancesCount,
            'totalRevenue' => $totalRevenue,
            'recentActivity' => $recentActivity,
            'uptimeKumaUrl' => config('services.uptime_kuma.url'),
        ]);
    }

    public function approveOrder(Order $order)
    {
        $order->update(['status' => 'approved']);
        $notes = json_decode($order->admin_notes, true);
        $user = $order->user;

        if (isset($notes['type']) && $notes['type'] === 'topup') {
            $user->increment('credits', $order->amount);
            
            $user->creditTransactions()->create([
                'amount' => $order->amount,
                'type' => 'deposit',
                'description' => 'Credit Deposit (Manual Verification)',
                'balance_after' => $user->credits,
                'reference_id' => 'order_' . $order->id,
            ]);

            $order->update(['status' => 'fulfilled']);
        } else {
            // Trigger One-Click Deploy
            ProvisionInstanceJob::dispatch($order);
        }

        // Notify user
        $user->notify(new OrderStatusUpdated($order));

        AuditLog::log('admin.order_approve', $order);

        return back()->with('success', 'Order approved and processed.');
    }

    public function rejectOrder(Order $order, Request $request)
    {
        $order->update([
            'status' => 'rejected',
            'admin_notes' => $request->notes
        ]);

        // Notify user
        $order->user->notify(new OrderStatusUpdated($order));

        AuditLog::log('admin.order_reject', $order, ['reason' => $request->notes]);

        return back()->with('success', 'Order rejected.');
    }
}
