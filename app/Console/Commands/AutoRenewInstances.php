<?php

namespace App\Console\Commands;

use App\Models\Order;
use App\Models\User;
use App\Models\AuditLog;
use App\Services\DokployService;
use App\Events\NodeStatusUpdated;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

#[Signature('asero:auto-renew')]
#[Description('Heartbeat Protocol: Automatically renews expiring or suspended instances using user credit balance.')]
class AutoRenewInstances extends Command
{
    /**
     * Execute the console command.
     */
    public function handle(DokployService $dokploy)
    {
        $this->info("Heartbeat Protocol Engaged. Scanning for renewal opportunities...");

        // 1. Find orders expiring within 24 hours or already suspended (within grace period)
        $orders = Order::where(function($query) {
                $query->whereBetween('expires_at', [now(), now()->addHours(24)])
                      ->orWhere('status', 'suspended');
            })
            ->whereIn('status', ['fulfilled', 'suspended'])
            ->with(['user', 'instance', 'plan'])
            ->get();

        $this->comment("Found {$orders->count()} orders in the renewal window.");

        foreach ($orders as $order) {
            $user = $order->user;
            $plan = $order->plan;

            if (!$plan) {
                $this->error(" -> Order #{$order->id}: No associated plan found. Skipping.");
                continue;
            }

            if ($user->credits >= $plan->price) {
                $this->info(" -> Renewing Order #{$order->id} for '{$user->name}' (₱{$plan->price})...");

                try {
                    DB::transaction(function () use ($user, $plan, $order, $dokploy) {
                        // Re-lock user for update
                        $user = User::where('id', $user->id)->lockForUpdate()->first();
                        
                        // Second credit check inside lock
                        if ($user->credits < $plan->price) throw new \Exception("Insufficient credits at lock time.");

                        // 1. Deduct Credits
                        $user->decrement('credits', $plan->price);

                        // 2. Log Transaction
                        $user->creditTransactions()->create([
                            'amount' => -$plan->price,
                            'type' => 'deduction',
                            'description' => "Auto-Renewal Heartbeat: {$order->plan_name}",
                            'balance_after' => $user->credits,
                            'reference_id' => 'renewal_' . $order->id,
                        ]);

                        // 3. Extend Expiry
                        $newExpiry = ($order->expires_at > now() ? $order->expires_at : now())->addDays(30);
                        $wasSuspended = $order->status === 'suspended';

                        $order->update([
                            'expires_at' => $newExpiry,
                            'status' => 'fulfilled',
                            'suspended_at' => null,
                            'admin_notes' => $order->admin_notes . "\n[" . now()->toDateString() . "] Automated: Protocol renewed via Heartbeat. New expiry: " . $newExpiry->toDateString()
                        ]);

                        // 4. Recovery if suspended
                        if ($wasSuspended && $order->instance) {
                            $dokploy->setNode($order->instance->node);
                            $dokploy->controlInstance($order->instance->dokploy_service_id, 'start');
                            event(new NodeStatusUpdated($order->instance, 'running'));
                        }

                        AuditLog::log('instance.auto_renew', $order->instance, ['amount' => $plan->price, 'new_expiry' => $newExpiry->toDateString()]);
                    });

                    $this->info("    [SUCCESS] Heartbeat synchronized. Node is stable.");

                } catch (\Exception $e) {
                    $this->error("    [FAILED] Renewal transaction aborted: " . $e->getMessage());
                    Log::error("Auto-renewal failed for Order #{$order->id}: " . $e->getMessage());
                }
            } else {
                $this->warn(" -> Order #{$order->id}: User has insufficient credits (₱{$user->credits} < ₱{$plan->price}). Awaiting manual top-up.");
            }
        }

        $this->info("Heartbeat cycle complete.");
    }
}
