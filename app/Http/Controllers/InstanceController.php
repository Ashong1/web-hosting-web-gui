<?php

namespace App\Http\Controllers;

use App\Events\NodeStatusUpdated;
use App\Models\AuditLog;
use App\Models\Instance;
use App\Models\Order;
use App\Services\DokployService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class InstanceController extends Controller
{
    public function index(DokployService $dokploy)
    {
        return Inertia::render('Dashboard', [
            'instances' => Inertia::defer(function () {
                $instances = auth()->user()->instances()->with(['order', 'node'])->get();

                return $instances->map(function ($instance) {
                    // Fetch live container status from cache to optimize performance and prevent API locks
                    $instance->live_status = \Illuminate\Support\Facades\Cache::get(
                        "instance.{$instance->id}.live_status",
                        $instance->status === 'active' ? 'running' : 'stopped'
                    );
                    
                    // Calculate mock Health Score
                    $score = 100;
                    if ($instance->live_status !== 'running') $score -= 50;
                    if ($instance->status === 'failed') $score -= 100;
                    if ($instance->is_suspended) $score -= 100;
                    
                    $instance->health_score = max(0, $score);
                    return $instance;
                });
            }),
            'recentActivity' => auth()->user()->auditLogs()->with('instance')->latest()->take(10)->get()
        ]);
    }

    public function show(Instance $instance)
    {
        Gate::authorize('view', $instance);

        if (!$instance->webhook_secret) {
            $instance->update(['webhook_secret' => \Illuminate\Support\Str::random(32)]);
        }

        $instance->live_status = \Illuminate\Support\Facades\Cache::get(
            "instance.{$instance->id}.live_status",
            $instance->status === 'active' ? 'running' : 'stopped'
        );

        return Inertia::render('Instances/Show', [
            'instance' => $instance->load(['order', 'node']),
        ]);
    }

    public function action(Request $request, Instance $instance, string $action, DokployService $dokploy)
    {
        // action: start, stop, restart, deploy
        Gate::authorize('update', $instance);

        if (!in_array($action, ['start', 'stop', 'restart', 'deploy'])) {
            abort(400);
        }

        if ($instance->node) {
            $dokploy->setNode($instance->node);
        }
        
        if ($action === 'deploy') {
            $success = $dokploy->deploy($instance->dokploy_service_id);
        } else {
            $success = $dokploy->controlInstance($instance->dokploy_service_id, $action);
        }

        if ($success) {
            AuditLog::log("instance.{$action}", $instance);

            // Broadcast real-time status update
            if ($action !== 'deploy') {
                $newStatus = ($action === 'stop') ? 'stopped' : 'running';
                \Illuminate\Support\Facades\Cache::put("instance.{$instance->id}.live_status", $newStatus, now()->addDays(7));
                event(new NodeStatusUpdated($instance, $newStatus));
            }

            return back()->with('success', "Instance {$action}ed successfully.");
        }

        return back()->with('error', "Failed to {$action} instance.");
    }

    public function logs(Instance $instance, DokployService $dokploy)
    {
        Gate::authorize('view', $instance);
        $dokploy->setNode($instance->node);

        $logs = $dokploy->getLogs($instance->dokploy_service_id);

        return response()->json([
            'logs' => $logs
        ]);
    }

    public function metrics(Instance $instance, DokployService $dokploy)
    {
        Gate::authorize('view', $instance);
        $dokploy->setNode($instance->node);

        $metrics = $dokploy->getDetailedMetrics($instance->dokploy_service_id);

        return response()->json([
            'metrics' => $metrics
        ]);
    }

    public function metricsHistory(Instance $instance)
    {
        Gate::authorize('view', $instance);

        // Fetch last 24 hours of metrics
        // We take one point every 5-10 minutes if we wanted to aggregate, 
        // but for now let's just take the last 100 points to keep it simple and responsive.
        $history = \App\Models\InstanceMetricsHistory::where('instance_id', $instance->id)
            ->where('recorded_at', '>=', now()->subHours(24))
            ->orderBy('recorded_at', 'asc')
            ->get();

        return response()->json([
            'history' => $history->map(function($point) {
                return [
                    'time' => $point->recorded_at->toIso8601String(),
                    'cpu' => $point->cpu_usage,
                    'memory' => $point->memory_usage,
                ];
            })
        ]);
    }

    public function envVars(Instance $instance, DokployService $dokploy)
    {
        Gate::authorize('view', $instance);
        $dokploy->setNode($instance->node);

        $envVars = $dokploy->getEnvVars($instance->dokploy_service_id);

        return response()->json([
            'env_vars' => $envVars
        ]);
    }

    public function backups(Instance $instance)
    {
        Gate::authorize('view', $instance);

        return response()->json([
            'backups' => $instance->backups()->latest()->get()
        ]);
    }

    public function createBackup(Request $request, Instance $instance, DokployService $dokploy)
    {
        Gate::authorize('update', $instance);
        $dokploy->setNode($instance->node);

        $plan = $instance->order->plan;
        
        if (!$plan->is_backups_enabled) {
            return back()->with('error', 'Snapshot services are not included in your current protocol tier.');
        }

        if ($instance->backups()->count() >= $plan->max_backups) {
            return back()->with('error', "Maximum snapshot limit ({$plan->max_backups}) reached for this node.");
        }

        $request->validate(['name' => 'required|string|max:255']);

        $backupData = $dokploy->createBackup($instance->dokploy_service_id, $request->name);

        if ($backupData) {
            $backup = $instance->backups()->create([
                'name' => $request->name,
                'backup_id' => $backupData['id'],
                'status' => $backupData['status'] ?? 'completed',
                'size_bytes' => $backupData['size'] ?? 0,
            ]);

            AuditLog::log('instance.backup.create', $instance, ['backup_id' => $backup->id]);
            return back()->with('success', 'Backup successfully initialized.');
        }

        return back()->with('error', 'Failed to create backup.');
    }

    public function restoreBackup(Instance $instance, \App\Models\InstanceBackup $backup, DokployService $dokploy)
    {
        Gate::authorize('update', $instance);
        $dokploy->setNode($instance->node);

        if ($backup->instance_id !== $instance->id) {
            abort(403);
        }

        $success = $dokploy->restoreBackup($instance->dokploy_service_id, $backup->backup_id);

        if ($success) {
            AuditLog::log('instance.backup.restore', $instance, ['backup_id' => $backup->id]);
            return back()->with('success', 'Restoration protocol initiated. Your node is reverting.');
        }

        return back()->with('error', 'Backup restoration failed.');
    }

    public function destroyBackup(Instance $instance, \App\Models\InstanceBackup $backup, DokployService $dokploy)
    {
        Gate::authorize('update', $instance);
        $dokploy->setNode($instance->node);

        if ($backup->instance_id !== $instance->id) {
            abort(403);
        }

        $success = $dokploy->deleteBackup($instance->dokploy_service_id, $backup->backup_id);

        if ($success) {
            AuditLog::log('instance.backup.delete', $instance, ['backup_id' => $backup->id]);
            $backup->delete();
            return back()->with('success', 'Snapshot purged successfully.');
        }

        return back()->with('error', 'Failed to delete snapshot from node.');
    }

    public function toggleAutoBackups(Instance $instance)
    {
        Gate::authorize('update', $instance);

        $instance->update([
            'auto_backups_enabled' => !$instance->auto_backups_enabled
        ]);

        AuditLog::log('instance.settings.auto_backup', $instance, ['enabled' => $instance->auto_backups_enabled]);

        return back()->with('success', $instance->auto_backups_enabled 
            ? 'Automated maintenance window engaged.' 
            : 'Scheduled snapshots deactivated.');
    }

    public function updateEnvVars(Request $request, Instance $instance, DokployService $dokploy)
    {
        Gate::authorize('update', $instance);
        $dokploy->setNode($instance->node);

        $request->validate([
            'env_vars' => 'required|array',
            'env_vars.*.key' => 'required|string',
            'env_vars.*.value' => 'required|string',
        ]);

        $success = $dokploy->updateEnvVars($instance->dokploy_service_id, $request->env_vars);

        if ($success) {
            AuditLog::log("instance.env_update", $instance, ['vars_count' => count($request->env_vars)]);
            return back()->with('success', 'Environment variables updated and application redeployed.');
        }

        return back()->with('error', 'Failed to update environment variables.');
    }

    public function updateResources(Request $request, Instance $instance, DokployService $dokploy)
    {
        Gate::authorize('update', $instance);
        $dokploy->setNode($instance->node);

        $request->validate([
            'cpu' => 'required|numeric|min:0.1',
            'memory' => 'required|numeric|min:128',
            'replicas' => 'required|integer|min:1|max:10',
        ]);

        $order = $instance->order;
        $plan = $order->plan;
        
        $planCpu = (float)($plan->resource_limits['cpu'] ?? 1);
        $planMem = (float)($plan->resource_limits['memory'] ?? 1024);
        $planReplicas = (int)($plan->resource_limits['replicas'] ?? 1);

        $requestedCpu = (float)$request->cpu;
        $requestedMem = (float)$request->memory;
        $requestedReplicas = (int)$request->replicas;

        // Calculate Elastic Surcharge if scaling beyond plan
        $extraCpu = max(0, $requestedCpu - $planCpu);
        $extraMemGb = max(0, ($requestedMem - $planMem) / 1024);
        $extraReplicas = max(0, $requestedReplicas - $planReplicas);

        $unitCosts = [
            'cpu' => 100, // ₱100 per extra core
            'mem' => 50,  // ₱50 per extra GB
            'replica' => 200 // ₱200 per extra node
        ];

        $monthlyExtraCost = ($extraCpu * $unitCosts['cpu']) + ($extraMemGb * $unitCosts['mem']) + ($extraReplicas * $unitCosts['replica']);
        
        $totalSurcharge = 0;

        if ($monthlyExtraCost > 0) {
            // Pro-rate based on remaining days
            $daysRemaining = max(1, now()->diffInDays($order->expires_at, false));
            $totalSurcharge = round(($monthlyExtraCost / 30) * $daysRemaining, 2);

            if (auth()->user()->credits < $totalSurcharge) {
                return back()->with('error', "Insufficient credits for elastic scaling (Required: ₱{$totalSurcharge}).");
            }
        }

        $success = $dokploy->updateResources(
            $instance->dokploy_service_id, 
            $requestedCpu, 
            $requestedMem, 
            $requestedReplicas
        );

        if ($success) {
            if ($totalSurcharge > 0) {
                \Illuminate\Support\Facades\DB::transaction(function () use ($totalSurcharge, $instance) {
                    $user = auth()->user();
                    // Refetch user to get the latest credits in the transaction context
                    $freshUser = \App\Models\User::lockForUpdate()->find($user->id);
                    $freshUser->decrement('credits', $totalSurcharge);
                    $freshUser->creditTransactions()->create([
                        'amount' => -$totalSurcharge,
                        'type' => 'deduction',
                        'description' => "Elastic Scaling Surcharge: {$instance->name}",
                        'balance_after' => $freshUser->credits,
                        'reference_id' => 'scaling_' . $instance->id,
                    ]);
                });
            }

            $instance->update(['replicas' => $requestedReplicas]);
            
            AuditLog::log("instance.resource_scaling", $instance, [
                'cpu' => $requestedCpu,
                'memory' => $requestedMem,
                'replicas' => $requestedReplicas,
                'surcharge' => $totalSurcharge
            ]);

            return back()->with('success', $totalSurcharge > 0 
                ? "Elastic scaling active. ₱{$totalSurcharge} pro-rated surcharge applied." 
                : "Resource allocation updated.");
        }

        return back()->with('error', 'Resource scaling failed.');
    }

    public function terminalInput(Request $request, Instance $instance, DokployService $dokploy)
    {
        Gate::authorize('update', $instance);

        $request->validate([
            'command' => 'required|string',
        ]);

        // Dispatch background job for non-blocking execution
        \App\Jobs\ExecuteTerminalCommand::dispatch($instance, $request->command);

        return response()->json(['success' => true], 202);
    }

    public function deployments(Instance $instance, DokployService $dokploy)
    {
        Gate::authorize('view', $instance);
        $dokploy->setNode($instance->node);

        $deployments = $dokploy->getDeployments($instance->dokploy_service_id);

        return response()->json([
            'deployments' => $deployments
        ]);
    }

    public function buildLogs(Instance $instance, DokployService $dokploy)
    {
        Gate::authorize('view', $instance);
        $dokploy->setNode($instance->node);

        $logs = $dokploy->getBuildLogs($instance->dokploy_service_id);

        return response()->json([
            'logs' => $logs
        ]);
    }

    public function rollback(Request $request, Instance $instance, string $deploymentId, DokployService $dokploy)
    {
        Gate::authorize('update', $instance);
        $dokploy->setNode($instance->node);

        $success = $dokploy->rollback($instance->dokploy_service_id, $deploymentId);

        if ($success) {
            AuditLog::log("instance.rollback", $instance, ['deployment_id' => $deploymentId]);
            return back()->with('success', 'Rollback protocol initiated. Node is reverting to stable state.');
        }

        return back()->with('error', 'Failed to initiate rollback.');
    }
}
