<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Instance;
use App\Services\DokployService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FleetController extends Controller
{
    public function index(DokployService $dokploy)
    {
        $instances = Instance::with(['user', 'order'])->latest()->paginate(15);
        $liveApplications = collect($dokploy->getAllApplications());

        $instances->getCollection()->transform(function ($instance) use ($liveApplications) {
            $live = $liveApplications->firstWhere('id', $instance->dokploy_service_id);
            $instance->live_status = $live['status'] ?? 'unknown';
            return $instance;
        });

        return Inertia::render('Admin/Fleet/Index', [
            'instances' => $instances
        ]);
    }

    public function action(
        Instance $instance, 
        string $action,
        DokployService $dokploy,
        \App\Services\CloudflareService $cloudflare,
        \App\Services\UptimeKumaService $uptimeKuma
    ) {
        if (!in_array($action, ['start', 'stop', 'restart', 'terminate'])) {
            abort(400);
        }

        $dokploy->setNode($instance->node);

        if ($action === 'terminate') {
            try {
                // 1. Terminate on Dokploy (App and DB)
                if ($instance->dokploy_service_id) {
                    $dokploy->deleteInstance($instance->dokploy_service_id);
                }
                if ($instance->dokploy_database_id) {
                    $dokploy->deleteDatabase($instance->dokploy_database_id);
                }

                // 2. Delete Cloudflare DNS
                if ($instance->public_url) {
                    $subdomain = explode('.', $instance->public_url)[0];
                    $cloudflare->deleteDnsRecord($subdomain);
                }

                // 3. Delete Uptime Kuma Monitor
                if ($instance->public_url) {
                    $monitorUrl = "https://" . $instance->public_url;
                    $uptimeKuma->deleteMonitor($monitorUrl);
                }

                // 4. Mark order as rejected/cancelled
                if ($instance->order) {
                    $instance->order->update([
                        'status' => 'rejected',
                        'admin_notes' => $instance->order->admin_notes . "\n[" . now()->toDateString() . "] Manual termination via Admin Control Plane."
                    ]);
                }

                // 5. Delete Instance record
                $instance->delete();

                \App\Models\AuditLog::log('instance.terminate_manual', $instance);

                return back()->with('success', 'Instance terminated and purged from cluster.');
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error("Manual termination failed for Instance ID {$instance->id}: " . $e->getMessage());
                return back()->with('error', 'Termination sequence failed: ' . $e->getMessage());
            }
        }

        $success = $dokploy->controlInstance($instance->dokploy_service_id, $action);

        if ($success) {
            \App\Models\AuditLog::log("instance.{$action}", $instance);
            return back()->with('success', "Node {$action}ed successfully.");
        }

        return back()->with('error', "Failed to {$action} node.");
    }
}
