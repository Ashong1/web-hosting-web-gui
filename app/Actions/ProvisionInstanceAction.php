<?php

namespace App\Actions;

use App\Models\Instance;
use App\Models\Order;
use App\Models\Plan;
use App\Models\User;
use App\Jobs\DeployAppJob;
use Illuminate\Support\Facades\DB;

class ProvisionInstanceAction
{
    /**
     * Deducts credits, creates records, and dispatches the deployment job.
     */
    public function execute(User $user, Plan $plan, array $data): Instance
    {
        return DB::transaction(function () use ($user, $plan, $data) {
            // Re-lock user for credits check to prevent race conditions
            $user = User::where('id', $user->id)->lockForUpdate()->first();

            if ($user->credits < $plan->price) {
                throw new \Exception("Insufficient credits for deployment.");
            }

            $user->decrement('credits', $plan->price);

            $cpu = $data['cpu'] ?? null;
            $memory = $data['memory'] ?? null;
            $storage = $data['storage'] ?? null;
            $replicas = $data['replicas'] ?? 1;

            if ($plan->id && !$cpu && !$memory) {
                $limits = $plan->resource_limits ?? [];
                $cpu = $limits['cpu'] ?? 1.0;
                $memory = $limits['memory'] ?? 1024;
                $storage = $limits['storage'] ?? 10;
                $replicas = $limits['replicas'] ?? 1;
            }
            
            $order = Order::create([
                'user_id' => $user->id,
                'plan_id' => $plan->id,
                'plan_name' => $plan->name,
                'amount' => $plan->price,
                'status' => 'approved',
                'admin_notes' => json_encode([
                    'cpu' => $cpu,
                    'ram' => $memory,
                    'storage' => $storage,
                    'replicas' => $replicas,
                ])
            ]);

            // Load Balancing: Select active node with the least number of instances
            $nodes = \App\Models\Node::where('is_active', true)
                ->withCount('instances')
                ->orderBy('instances_count', 'asc')
                ->get();

            $selectedNode = null;
            foreach ($nodes as $n) {
                // If running unit tests, skip the real network check
                if (app()->runningUnitTests()) {
                    $selectedNode = $n;
                    break;
                }

                try {
                    $response = \Illuminate\Support\Facades\Http::withHeaders([
                        'x-api-key' => $n->api_key,
                    ])->acceptJson()
                      ->timeout(2) // Fast timeout for responsiveness check
                      ->get("{$n->api_url}/api/project.all");

                    if ($response->successful()) {
                        $selectedNode = $n;
                        break;
                    }
                } catch (\Exception $e) {
                    \Illuminate\Support\Facades\Log::warning("Pre-flight health check failed for Node ID {$n->id}: " . $e->getMessage());
                }
            }

            if (!$selectedNode) {
                throw new \Exception("No active, responsive compute nodes available for synthesis.");
            }

            $node = $selectedNode;

            $instance = Instance::create([
                'user_id' => $user->id,
                'node_id' => $node->id,
                'order_id' => $order->id,
                'project_type' => $data['project_type'] ?? 'application',
                'name' => $data['subdomain'],
                'dokploy_project_id' => 'proj_default',
                'repository_url' => $data['repository_url'] ?? null,
                'repository_branch' => $data['repository_branch'] ?? 'main',
                'install_command' => $data['install_command'] ?? null,
                'build_command' => $data['build_command'] ?? null,
                'compose_file' => $data['compose_file'] ?? null,
                'env_vars' => $data['env_vars'] ?? null,
                'public_url' => "{$data['subdomain']}.aserotech.com",
                'deployment_status' => 'pending',
                'webhook_secret' => \Illuminate\Support\Str::random(32),
                'credentials' => [
                    'database_type' => $data['database_type'] ?? 'none',
                    'build_strategy' => $data['build_strategy'] ?? 'nixpacks',
                    'volumes' => $data['volumes'] ?? [],
                    'cpu' => $cpu,
                    'memory' => $memory,
                    'storage' => $storage,
                    'replicas' => $replicas,
                    'container_port' => (int) ($data['container_port'] ?? 80),
                ],
            ]);

            $user->creditTransactions()->create([
                'amount' => -$plan->price,
                'type' => 'deduction',
                'description' => "Zero-Config Provisioning: {$instance->name}",
                'balance_after' => $user->credits,
                'reference_id' => 'order_' . $order->id,
            ]);

            DeployAppJob::dispatch($instance);

            return $instance;
        });
    }
}