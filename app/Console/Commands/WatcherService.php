<?php

namespace App\Console\Commands;

use App\Models\Instance;
use App\Services\DokployService;
use App\Events\NodeStatusUpdated;
use App\Models\AuditLog;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class WatcherService extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'asero:watcher';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Guardian Process: Monitors node health and triggers automated recovery.';

    /**
     * Execute the console command.
     */
    public function handle(DokployService $dokploy)
    {
        $this->info("Guardian Protocol Engaged. Monitoring all infrastructure nodes...");

        $nodes = \App\Models\Node::where('is_active', true)->get();

        foreach ($nodes as $node) {
            $this->comment(" -> Scanning Node: {$node->name} ({$node->ip_address})");
            
            try {
                $dokploy->setNode($node);
                $liveApps = collect($dokploy->getAllApplications());
                $instances = $node->instances()->where('status', 'active')->get();

                foreach ($instances as $instance) {
                    $live = $liveApps->firstWhere('id', $instance->dokploy_service_id);
                    $currentStatus = $live['status'] ?? 'unknown';

                    // Cache the live status to avoid synchronous API polling during web requests
                    \Illuminate\Support\Facades\Cache::put("instance.{$instance->id}.live_status", $currentStatus, now()->addDays(7));

                    if ($currentStatus === 'stopped' || $currentStatus === 'error') {
                        $this->warn("Node Alert: Instance {$instance->id} ({$instance->name}) on node {$node->id} is {$currentStatus}. Attempting recovery...");
                        
                        $success = $dokploy->controlInstance($instance->dokploy_service_id, 'start');

                        if ($success) {
                            $this->info("Recovery Successful: Node {$instance->id} has been re-synchronized.");
                            \Illuminate\Support\Facades\Cache::put("instance.{$instance->id}.live_status", 'running', now()->addDays(7));
                            AuditLog::log('instance.auto_recovery', $instance, ['previous_status' => $currentStatus, 'node_id' => $node->id]);
                            
                            // Notify frontend via WebSocket
                            event(new NodeStatusUpdated($instance, 'running'));
                        } else {
                            $this->error("Recovery Failed: Manual intervention required for Node {$instance->id}.");
                        }
                    }

                    // Record Metrics History
                    if ($live) {
                        \App\Models\InstanceMetricsHistory::create([
                            'instance_id' => $instance->id,
                            'cpu_usage' => $this->parseToFloat($live['cpu'] ?? '0'),
                            'memory_usage' => $this->parseToFloat($live['memory'] ?? '0'),
                            'memory_limit' => $this->parseToFloat($live['memory_limit'] ?? '0'),
                            'recorded_at' => now(),
                        ]);
                    }
                }

                // Webhook Fail-safe: Reconcile stuck deploying or pending instances (older than 5 minutes)
                $deployingInstances = $node->instances()
                    ->whereIn('deployment_status', ['deploying', 'pending'])
                    ->where('updated_at', '<', now()->subMinutes(5))
                    ->get();

                foreach ($deployingInstances as $instance) {
                    $live = $liveApps->firstWhere('id', $instance->dokploy_service_id);
                    if ($live) {
                        $currentStatus = $live['status'] ?? 'unknown';
                        if ($currentStatus === 'running') {
                            $this->info("Fail-safe Sync: Stuck deploying instance {$instance->id} resolved to running.");
                            $instance->update([
                                'status' => 'active',
                                'deployment_status' => 'live'
                            ]);
                            \Illuminate\Support\Facades\Cache::put("instance.{$instance->id}.live_status", 'running', now()->addDays(7));
                            event(new NodeStatusUpdated($instance, 'running'));
                            broadcast(new \App\Events\SystemSignalBroadcast($instance->user, "Fail-safe: {$instance->name} has been recovered and is now operational."));
                            AuditLog::log('instance.failsafe_recovery', $instance, ['status' => 'running']);
                        } elseif ($currentStatus === 'failed' || $currentStatus === 'error') {
                            $this->warn("Fail-safe Sync: Stuck deploying instance {$instance->id} resolved to failed.");
                            $instance->update([
                                'status' => 'failed',
                                'deployment_status' => 'failed'
                            ]);
                            \Illuminate\Support\Facades\Cache::put("instance.{$instance->id}.live_status", 'stopped', now()->addDays(7));
                            event(new NodeStatusUpdated($instance, 'stopped'));
                            broadcast(new \App\Events\SystemSignalBroadcast($instance->user, "Fail-safe: {$instance->name} deployment was marked as failed."));
                            AuditLog::log('instance.failsafe_recovery', $instance, ['status' => 'failed']);
                        }
                    }
                }
            } catch (\Exception $e) {
                $this->error("Failed to sync with Node #{$node->id}: " . $e->getMessage());
            }
        }

        $this->info("Guardian cycle complete.");
    }

    private function parseToFloat($value)
    {
        return (float) filter_var($value, FILTER_SANITIZE_NUMBER_FLOAT, FILTER_FLAG_ALLOW_FRACTION);
    }
}
