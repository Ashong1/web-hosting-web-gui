<?php

namespace App\Jobs;

use App\Events\NodeStatusUpdated;
use App\Events\SystemSignalBroadcast;
use App\Models\Order;
use App\Models\Instance;
use App\Services\DokployService;
use App\Services\CloudflareService;
use App\Services\UptimeKumaService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ProvisionInstanceJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected Order $order;

    /**
     * Create a new job instance.
     */
    public function __construct(Order $order)
    {
        $this->order = $order;
    }

    /**
     * Execute the job.
     */
    public function handle(
        DokployService $dokploy,
        CloudflareService $cloudflare,
        UptimeKumaService $uptimeKuma
    ): void {
        $user = $this->order->user;
        $plan = $this->order->plan;
        
        $metadata = json_decode($this->order->admin_notes, true);
        $appName = $metadata['app_name'] ?? "App-{$this->order->id}";
        $subdomain = $metadata['subdomain'] ?? "app-{$this->order->id}";
        
        // Resolve Reseller Custom Domain alignment
        $reseller = $user->provider_id 
            ? \App\Models\ResellerSetting::where('user_id', $user->provider_id)->where('is_active', true)->first()
            : null;
        $parentDomain = ($reseller && $reseller->custom_domain) 
            ? $reseller->custom_domain 
            : 'aserotech.com';

        $publicUrl = "{$subdomain}.{$parentDomain}";

        $cpu = $metadata['cpu'] ?? null;
        $memory = $metadata['ram'] ?? null;
        $storage = $metadata['storage'] ?? null;
        $replicas = $metadata['replicas'] ?? 1;

        if ($plan && !$cpu && !$memory) {
            $limits = $plan->resource_limits ?? [];
            $cpu = $limits['cpu'] ?? 1.0;
            $memory = $limits['memory'] ?? 1024;
            $storage = $limits['storage'] ?? 10;
            $replicas = $limits['replicas'] ?? 1;
        }

        // 1. Initialize Instance Record
        $instance = Instance::create([
            'user_id' => $user->id,
            'order_id' => $this->order->id,
            'name' => $appName,
            'public_url' => $publicUrl,
            'status' => 'provisioning',
            'credentials' => [
                'plan' => $plan ? $plan->name : $this->order->plan_name,
                'image' => $plan ? ($plan->image ?? 'wordpress:latest') : 'wordpress:latest',
                'cpu' => $cpu,
                'memory' => $memory,
                'storage' => $storage,
                'replicas' => $replicas,
            ],
        ]);

        $broadcast = function($step, $status, $message, $progress) use ($user) {
            safe_event(new \App\Events\ProvisioningProgressUpdated($user->id, $this->order->id, $step, $status, $message, $progress));
        };

        try {
            $broadcast('dns', 'processing', 'Orchestrating Cloudflare Edge (CNAME)...', 10);
            $tunnelTarget = config('services.cloudflare.tunnel_target');
            $cloudflare->createDnsRecord($subdomain, $tunnelTarget, 'CNAME', true);
            $broadcast('dns', 'completed', 'Cloudflare DNS routing established.', 20);

            $broadcast('project', 'processing', 'Initializing Dokploy isolation environment...', 30);
            $projectName = "client-" . $user->id;
            try {
                $project = $dokploy->createProject($projectName);
                $dokployProjectId = $project['id'];
            } catch (\Exception $e) {
                Log::info("Project might already exist: " . $e->getMessage());
                $dokployProjectId = "existing-id"; 
            }
            $instance->update(['dokploy_project_id' => $dokployProjectId]);
            $broadcast('project', 'completed', 'Project container group initialized.', 40);

            $broadcast('database', 'processing', 'Provisioning dedicated MySQL cluster...', 50);
            $dbUser = 'user_' . $user->id;
            $dbPass = str()->random(16);
            $dbHost = $appName . '-db';
            $dbName = 'db_' . $appName;

            $database = $dokploy->createDatabase($dokployProjectId, $dbHost, 'mysql', $dbUser, $dbPass);
            if (!$database || !isset($database['id'])) throw new \Exception("Failed to create Dokploy database.");
            
            $instance->update([
                'dokploy_database_id' => $database['id'],
                'credentials' => array_merge($instance->credentials, [
                    'db_host' => $dbHost,
                    'db_user' => $dbUser,
                    'db_pass' => $dbPass,
                    'db_name' => $dbName,
                    'db_type' => 'mysql',
                ])
            ]);
            $broadcast('database', 'completed', 'Database node is online and secured.', 60);

            $broadcast('application', 'processing', 'Setting up application...', 70);
            $application = $dokploy->createApplication($dokployProjectId, $appName, ['dockerImage' => $plan ? ($plan->image ?? 'wordpress:latest') : 'wordpress:latest']);
            if (!$application || !isset($application['id'])) throw new \Exception("Failed to create Dokploy application.");
            
            $dokployServiceId = $application['id'];
            $instance->update(['dokploy_service_id' => $dokployServiceId]);

            // Apply dynamic resource limits (CPU/RAM/Replicas) to the container stack
            if ($cpu && $memory) {
                $dokploy->updateResources($dokployServiceId, (float)$cpu, (int)$memory, (int)$replicas);
            }

            // Inject Hybrid Environment Variables
            $dokploy->updateEnvVars($dokployServiceId, [
                ['key' => 'WORDPRESS_DB_HOST', 'value' => $dbHost],
                ['key' => 'WORDPRESS_DB_NAME', 'value' => $dbName],
                ['key' => 'WORDPRESS_DB_USER', 'value' => $dbUser],
                ['key' => 'WORDPRESS_DB_PASSWORD', 'value' => $dbPass],
            ]);

            $broadcast('application', 'completed', 'Application runtime configured.', 80);

            $broadcast('deployment', 'processing', 'Injecting volume mounts and starting node...', 90);
            $wpVolName = "vol-" . str_replace('.', '-', $publicUrl) . "-wp-content";
            $dokploy->createMount($dokployServiceId, $wpVolName, '/var/www/html/wp-content');
            $dokploy->addDomain($dokployServiceId, $publicUrl, 80, true);
            $dokploy->deploy($dokployServiceId);
            $broadcast('deployment', 'completed', 'Container deployment sequence finalized.', 95);

            $broadcast('monitor', 'processing', 'Activating health monitoring probe...', 98);
            $uptimeKuma->addMonitor($appName, "https://" . $publicUrl);
            
            $instance->update(['status' => 'active']);
            $this->order->update(['status' => 'fulfilled', 'expires_at' => now()->addDays(30)]);

            $broadcast('final', 'completed', 'Setup complete. Node is live.', 100);

            // Broadcast real-time status update for UI
            safe_event(new NodeStatusUpdated($instance, 'running'));
            safe_event(new SystemSignalBroadcast($user, "Provisioning protocol finalized. Node '{$appName}' is now active.", 'success'));

            \Illuminate\Support\Facades\Mail::to($user->email)->send(new \App\Mail\InstanceProvisioned($instance));
            $user->notify(new \App\Notifications\DeploymentSuccess($instance));

        } catch (\Exception $e) {
            Log::error("Provisioning failed for Order #{$this->order->id}: " . $e->getMessage());
            $broadcast('error', 'failed', 'System Alert: Provisioning sequence failed. Retrying...', 0);
            if ($instance) $instance->update(['status' => 'failed']);
            throw $e;
        }
    }
}
