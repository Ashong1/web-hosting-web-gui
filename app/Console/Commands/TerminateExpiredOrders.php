<?php

namespace App\Console\Commands;

use App\Models\Order;
use App\Services\DokployService;
use App\Services\CloudflareService;
use App\Services\UptimeKumaService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class TerminateExpiredOrders extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'orders:terminate-expired';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Automatically terminate Dokploy instances for expired orders';

    /**
     * Execute the console command.
     */
    public function handle(
        DokployService $dokploy,
        CloudflareService $cloudflare,
        UptimeKumaService $uptimeKuma
    ) {
        // STAGE 1: Graceful Suspension
        // Find orders that just expired but haven't been suspended yet
        $toSuspend = Order::where('expires_at', '<', now())
            ->where('status', 'fulfilled')
            ->whereNull('suspended_at')
            ->with('instance')
            ->get();

        foreach ($toSuspend as $order) {
            $this->info("Suspension Protocol: Order #{$order->id} has expired. Entering grace period...");
            
            try {
                if ($order->instance) {
                    $instance = $order->instance;
                    $dokploy->setNode($instance->node);
                    
                    // Stop the instance instead of deleting it
                    $success = $dokploy->controlInstance($instance->dokploy_service_id, 'stop');
                    
                    if ($success) {
                        $this->comment(" -> Node cluster '{$instance->name}' has been safely halted.");
                    }
                }

                $order->update([
                    'status' => 'suspended',
                    'suspended_at' => now(),
                    'admin_notes' => $order->admin_notes . "\n[" . now()->toDateString() . "] Automated: Protocol suspended. 7-day data retention active."
                ]);

                // Notify User
                $order->user->notify(new \App\Notifications\OrderStatusUpdated($order, 'Your service has been suspended due to expiry. You have 7 days to top up before data erasure.'));
                
            } catch (\Exception $e) {
                Log::error("Suspension failed for Order #{$order->id}: " . $e->getMessage());
            }
        }

        // STAGE 2: Permanent Termination (The Nuclear Option)
        // Find orders that have been suspended for more than 7 days
        $toTerminate = Order::where('status', 'suspended')
            ->where('suspended_at', '<', now()->subDays(7))
            ->with('instance')
            ->get();

        if ($toTerminate->isEmpty() && $toSuspend->isEmpty()) {
            $this->info('No orders require processing at this time.');
            return;
        }

        foreach ($toTerminate as $order) {
            $this->warn("Nuclear Protocol: Grace period expired for Order #{$order->id}. Commencing data erasure...");

            try {
                if ($order->instance) {
                    $instance = $order->instance;
                    $dokploy->setNode($instance->node);

                    // 1. Terminate on Dokploy (App and DB)
                    if ($instance->dokploy_service_id) {
                        $this->info(" -> Deleting Dokploy service: {$instance->dokploy_service_id}");
                        $dokploy->deleteInstance($instance->dokploy_service_id);
                    }
                    if ($instance->dokploy_database_id) {
                        $this->info(" -> Deleting Dokploy database: {$instance->dokploy_database_id}");
                        $dokploy->deleteDatabase($instance->dokploy_database_id);
                    }

                    // 2. Delete Cloudflare DNS
                    if ($instance->public_url) {
                        $subdomain = explode('.', $instance->public_url)[0];
                        $this->info(" -> Withdrawing Cloudflare DNS: {$subdomain}");
                        $cloudflare->deleteDnsRecord($subdomain);
                    }

                    // 3. Delete Uptime Kuma Monitor
                    if ($instance->public_url) {
                        $monitorUrl = "https://" . $instance->public_url;
                        $this->info(" -> Deactivating health probe: {$monitorUrl}");
                        $uptimeKuma->deleteMonitor($monitorUrl);
                    }

                    // 4. Delete Instance record
                    $instance->delete();
                }

                // Mark order as completely terminated/rejected
                $order->update([
                    'status' => 'rejected', 
                    'admin_notes' => $order->admin_notes . "\n[" . now()->toDateString() . "] Automated: Permanent termination completed."
                ]);
                
                Log::alert("Order #{$order->id} permanently terminated after grace period.");

            } catch (\Exception $e) {
                Log::error("Nuclear Protocol failed for Order #{$order->id}: " . $e->getMessage());
            }
        }

        $this->info('Lifecycle management cycle complete.');
    }
}
