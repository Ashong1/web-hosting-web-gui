<?php

namespace App\Jobs;

use App\Models\Instance;
use App\Models\Order;
use App\Services\DokployService;
use App\Services\CloudflareService;
use App\Events\NodeStatusUpdated;
use App\Events\SystemSignalBroadcast;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class DeployAppJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $instance;

    /**
     * Create a new job instance.
     */
    public function __construct(Instance $instance)
    {
        $this->instance = $instance;
    }

    /**
     * Execute the job.
     */
    public function handle(DokployService $dokploy, CloudflareService $cloudflare)
    {
        $user = $this->instance->user;
        
        $broadcast = function($step, $status, $message, $progress) use ($user) {
            safe_event(new \App\Events\ProvisioningProgressUpdated($user->id, $this->instance->order_id ?? 0, $step, $status, $message, $progress));
        };

        // Dynamically point service to the specific assigned node
        if ($this->instance->node) {
            $dokploy->setNode($this->instance->node);
        }

        $progress = $this->instance->provisioning_progress ?? [];

        try {
            $this->instance->update(['deployment_status' => 'deploying']);
            
            // 1. Register Resource with Dokploy
            if (!isset($progress['resource_registered'])) {
                $broadcast('resource', 'processing', 'Registering node architecture...', 10);
                if ($this->instance->project_type === 'compose') {
                    $appData = $dokploy->createCompose(
                        $this->instance->dokploy_project_id,
                        $this->instance->name,
                        $this->instance->compose_file
                    );
                } else {
                    $appData = $dokploy->createApplication(
                        $this->instance->dokploy_project_id,
                        $this->instance->name,
                        [
                            'repositoryUrl' => $this->instance->repository_url,
                            'branch' => $this->instance->repository_branch,
                            'domain' => $this->instance->public_url,
                            'installCommand' => $this->instance->install_command,
                            'buildCommand' => $this->instance->build_command,
                            'buildStrategy' => $this->instance->credentials['build_strategy'] ?? 'nixpacks',
                        ]
                    );
                }

                if (!$appData) throw new \Exception("Failed to register resource with Dokploy.");

                $applicationId = $appData['id'];
                $progress['resource_registered'] = $applicationId;
                $this->instance->update([
                    'dokploy_service_id' => $applicationId,
                    'provisioning_progress' => $progress
                ]);

                // Apply dynamic resource limits (CPU/RAM/Replicas) to the container stack
                $cpu = $this->instance->credentials['cpu'] ?? null;
                $memory = $this->instance->credentials['memory'] ?? null;
                $replicas = $this->instance->credentials['replicas'] ?? 1;
                
                if ($cpu && $memory) {
                    $dokploy->updateResources($applicationId, (float)$cpu, (int)$memory, (int)$replicas);
                }

                $broadcast('resource', 'completed', 'Node architecture registered.', 20);
            }

            $applicationId = $this->instance->dokploy_service_id;

            // 2. Provision Database if requested
            if (!isset($progress['database_provisioned'])) {
                $broadcast('database', 'processing', 'Provisioning dedicated data cluster...', 30);
                $credentials = $this->instance->credentials ?? [];
                $dbType = $credentials['database_type'] ?? 'none';
                
                if ($dbType !== 'none') {
                    $dbName = 'db_' . str_replace('-', '_', $this->instance->name);
                    $dbUser = 'user_' . $this->instance->user_id;
                    $dbPass = \Illuminate\Support\Str::random(16);
                    $dbHost = $this->instance->name . '-db';
                    
                    $database = $dokploy->createDatabase($this->instance->dokploy_project_id, $dbHost, $dbType, $dbUser, $dbPass);

                    if ($database && isset($database['id'])) {
                        $progress['database_provisioned'] = $database['id'];
                        $this->instance->update([
                            'dokploy_database_id' => $database['id'],
                            'provisioning_progress' => $progress,
                            'credentials' => array_merge($credentials, [
                                'db_host' => $dbHost,
                                'db_user' => $dbUser,
                                'db_pass' => $dbPass,
                                'db_name' => $dbName,
                                'db_type' => $dbType,
                            ])
                        ]);
                    }
                    $broadcast('database', 'completed', 'Data cluster online.', 50);
                } else {
                    $progress['database_provisioned'] = 'skipped';
                    $this->instance->update(['provisioning_progress' => $progress]);
                    $broadcast('database', 'completed', 'Data cluster skipped (Node only).', 50);
                }
            }

            // 3. Inject Environment Variables
            if (!isset($progress['env_injected'])) {
                $broadcast('env', 'processing', 'Synchronizing security environment...', 60);
                $dbEnvVars = $this->getDbEnvVars();
                $finalEnvVars = array_merge($this->instance->env_vars ?? [], $dbEnvVars);

                if (!empty($finalEnvVars)) {
                    $dokploy->updateEnvVars($applicationId, $finalEnvVars);
                }
                
                $progress['env_injected'] = true;
                $this->instance->update(['provisioning_progress' => $progress]);
                $broadcast('env', 'completed', 'Security environment synchronized.', 70);
            }

            // 4. Attach Persistent Volumes
            if (!isset($progress['volumes_attached'])) {
                $broadcast('volumes', 'processing', 'Allocating persistent storage...', 80);
                $volumes = $this->instance->credentials['volumes'] ?? [];
                foreach ($volumes as $vol) {
                    $volName = "vol-" . str_replace('.', '-', $this->instance->public_url) . "-" . $vol['name'];
                    $dokploy->createMount($applicationId, $volName, $vol['path']);
                }
                $progress['volumes_attached'] = true;
                $this->instance->update(['provisioning_progress' => $progress]);
                $broadcast('volumes', 'completed', 'Persistent storage allocated.', 85);
            }

            // 5. Orchestrate DNS & Domain Linking
            if (!isset($progress['dns_configured'])) {
                $broadcast('dns', 'processing', 'Securing Cloudflare edge routing...', 90);
                $subdomain = str_replace('.aserotech.com', '', $this->instance->public_url);
                $tunnelTarget = ($this->instance->node && $this->instance->node->tunnel_target)
                    ? $this->instance->node->tunnel_target
                    : config('services.cloudflare.tunnel_target');
                
                $cloudflare->createDnsRecord($subdomain, $tunnelTarget, 'CNAME', true);
                
                $port = (int) ($this->instance->credentials['container_port'] ?? 80);
                $dokploy->addDomain($applicationId, $this->instance->public_url, $port, true);

                $progress['dns_configured'] = true;
                $this->instance->update(['provisioning_progress' => $progress]);
                $broadcast('dns', 'completed', 'Edge routing active.', 95);
            }

            // 6. Final Deployment Sequence
            $broadcast('final', 'processing', 'Finishing installation...', 98);
            $success = $dokploy->deploy($applicationId);

            if ($success) {
                $this->instance->update(['deployment_status' => 'live']);
                safe_event(new NodeStatusUpdated($this->instance, 'live'));
                $broadcast('final', 'completed', 'Node synthesis successful.', 100);
                
                // Notify User
                $this->instance->user->notify(new \App\Notifications\DeploymentSuccess($this->instance));
                safe_broadcast(new SystemSignalBroadcast($this->instance->user, "Deployment Successful: {$this->instance->name} is now live."));
            } else {
                throw new \Exception("Deployment trigger failed.");
            }

        } catch (\Exception $e) {
            Log::error("Orchestration Error for Instance {$this->instance->id}: " . $e->getMessage());
            $broadcast('error', 'failed', 'Orchestration Error: Process interrupted.', 0);
            
            // Notify User of Failure
            $this->instance->user->notify(new \App\Notifications\DeploymentFailed($this->instance, $e->getMessage()));

            // Increment retry count or handle terminal failure
            $this->instance->update(['deployment_status' => 'failed']);
            safe_broadcast(new SystemSignalBroadcast($this->instance->user, "Critical Alert: Deployment failed for {$this->instance->name}."));
            
            throw $e;
        }
    }

    private function getDbEnvVars()
    {
        $creds = $this->instance->credentials ?? [];
        if (($creds['database_type'] ?? 'none') === 'none') return [];

        $dbType = $creds['db_type'];
        $dbHost = $creds['db_host'];
        $dbPort = match($dbType) {
            'postgresql' => 5432,
            'redis' => 6379,
            'mongodb' => 27017,
            default => 3306
        };

        $vars = [
            ['key' => 'DB_CONNECTION', 'value' => $dbType],
            ['key' => 'DB_HOST', 'value' => $dbHost],
            ['key' => 'DB_PORT', 'value' => (string)$dbPort],
            ['key' => 'DB_DATABASE', 'value' => $creds['db_name']],
            ['key' => 'DB_USERNAME', 'value' => $creds['db_user']],
            ['key' => 'DB_PASSWORD', 'value' => $creds['db_pass']],
        ];

        if ($dbType === 'mongodb') {
            $vars[] = ['key' => 'MONGODB_URI', 'value' => "mongodb://{$creds['db_user']}:{$creds['db_pass']}@{$dbHost}:{$dbPort}/{$creds['db_name']}"];
        }

        return $vars;
    }
}
