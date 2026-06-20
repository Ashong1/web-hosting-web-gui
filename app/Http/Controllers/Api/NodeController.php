<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Instance;
use App\Services\DokployService;
use Illuminate\Http\Request;

class NodeController extends Controller
{
    public function index(DokployService $dokploy)
    {
        $instances = auth()->user()->instances()->with(['order', 'node'])->get();
        $nodes = \App\Models\Node::where('is_active', true)->get();
        
        $allLiveApps = [];
        foreach ($nodes as $node) {
            $nodeApps = \Illuminate\Support\Facades\Cache::remember("node.{$node->id}.apps", 30, function () use ($dokploy, $node) {
                return $dokploy->setNode($node)->getAllApplications();
            });
            $allLiveApps = array_merge($allLiveApps, $nodeApps);
        }
        
        $liveApplications = collect($allLiveApps);

        $data = $instances->map(function ($instance) use ($liveApplications) {
            $live = $liveApplications->firstWhere('id', $instance->dokploy_service_id);
            return [
                'id' => $instance->id,
                'name' => $instance->name,
                'status' => $live['status'] ?? 'unknown',
                'endpoint' => "https://{$instance->public_url}",
                'plan' => $instance->order->plan_name,
                'provisioned_at' => $instance->created_at->toIso8601String(),
            ];
        });

        return response()->json([
            'object' => 'list',
            'data' => $data,
            'meta' => [
                'total_nodes' => $data->count(),
                'agent' => auth()->user()->email,
            ]
        ]);
    }

    public function show(Instance $instance, DokployService $dokploy)
    {
        if ($instance->user_id !== auth()->id()) {
            return response()->json(['error' => 'Node not found or access denied.'], 404);
        }

        if ($instance->node) {
            $dokploy->setNode($instance->node);
        }
        $liveApplications = collect($dokploy->getAllApplications());
        $live = $liveApplications->firstWhere('id', $instance->dokploy_service_id);

        return response()->json([
            'id' => $instance->id,
            'name' => $instance->name,
            'status' => $live['status'] ?? 'unknown',
            'credentials' => $instance->credentials,
            'public_url' => $instance->public_url,
            'configuration' => [
                'cpu' => $instance->order->plan->resource_limits['cpu'] ?? '1',
                'memory' => $instance->order->plan->resource_limits['memory'] ?? '1024',
            ]
        ]);
    }

    public function deploy(Instance $instance, DokployService $dokploy)
    {
        if ($instance->user_id !== auth()->id()) {
            return response()->json(['error' => 'Node not found or access denied.'], 404);
        }

        if ($instance->node) {
            $dokploy->setNode($instance->node);
        }
        $success = $dokploy->deploy($instance->dokploy_service_id);

        if ($success) {
            \App\Models\AuditLog::log('api.instance.deploy', $instance);
            return response()->json(['message' => 'Node deployment triggered successfully.']);
        }

        return response()->json(['error' => 'Failed to trigger deployment.'], 500);
    }

    public function action(Request $request, Instance $instance, string $action, DokployService $dokploy)
    {
        if ($instance->user_id !== auth()->id()) {
            return response()->json(['error' => 'Node not found or access denied.'], 404);
        }

        if (!in_array($action, ['start', 'stop', 'restart'])) {
            return response()->json(['error' => 'Invalid action.'], 400);
        }

        if ($instance->node) {
            $dokploy->setNode($instance->node);
        }
        $success = $dokploy->controlInstance($instance->dokploy_service_id, $action);

        if ($success) {
            \App\Models\AuditLog::log("api.instance.{$action}", $instance);
            return response()->json(['message' => "Node {$action}ed successfully."]);
        }

        return response()->json(['error' => "Failed to {$action} node."], 500);
    }
}
