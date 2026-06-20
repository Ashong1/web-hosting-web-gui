<?php

namespace App\Http\Controllers;

use App\Services\DokployService;
use App\Services\CloudflareService;
use App\Services\ProxmoxService;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;

class StatusPageController extends Controller
{
    public function index(DokployService $dokploy, CloudflareService $cloudflare, ProxmoxService $proxmox)
    {
        $status = Cache::remember('public.system_status', 30, function() use ($dokploy, $cloudflare, $proxmox) {
            $nodes = \App\Models\Node::where('is_active', true)->get();
            $components = [];

            // Add Global Edge
            $components[] = [
                'name' => 'Global DNS Network',
                'description' => 'Edge routing and SSL termination.',
                'status' => $this->checkCloudflare(),
                'latency' => $this->measureLatency('https://api.cloudflare.com/client/v4/user'),
                'uptime_history' => $this->getComponentUptimeHistory('Global DNS Network'),
            ];

            // Check each node dynamically
            foreach ($nodes as $node) {
                $dokploy->setNode($node);
                $components[] = [
                    'name' => "Compute Node: {$node->name}",
                    'description' => "Worker cluster in {$node->location}.",
                    'status' => $this->checkDokploy($dokploy),
                    'latency' => $this->measureLatency($node->api_url),
                    'uptime_history' => $this->getComponentUptimeHistory($node->name),
                ];
            }

            // Fallback if no nodes found
            if ($nodes->isEmpty()) {
                $components[] = [
                    'name' => 'Compute Fleet',
                    'description' => 'Awaiting node synchronization...',
                    'status' => 'degraded',
                    'latency' => 0,
                    'uptime_history' => $this->getComponentUptimeHistory('Compute Fleet'),
                ];
            }

            $hasOutage = collect($components)->contains('status', 'outage');
            $hasDegraded = collect($components)->contains('status', 'degraded') || collect($components)->contains('status', 'degraded');
            
            $summaryMessage = 'All systems are operating within normal parameters.';
            $hasIncident = false;

            if ($hasOutage) {
                $summaryMessage = 'Active outages detected. Cluster operations are compromised.';
                $hasIncident = true;
            } elseif ($hasDegraded) {
                $summaryMessage = 'Performance degraded. Some components are experiencing latency.';
                $hasIncident = true;
            }

            $incidents = \App\Models\AuditLog::where('event', 'system.incident')
                ->latest()
                ->take(10)
                ->get()
                ->map(function($log) {
                    $meta = json_decode($log->metadata, true) ?? [];
                    return [
                        'id' => $log->id,
                        'title' => $meta['title'] ?? 'System Maintenance Alert',
                        'status' => $meta['status'] ?? 'resolved',
                        'impact' => $meta['impact'] ?? 'minor',
                        'date' => $log->created_at->format('M d, Y'),
                        'body' => $meta['body'] ?? $log->description,
                    ];
                })->toArray();

            return [
                'components' => $components,
                'summary' => [
                    'message' => $summaryMessage,
                    'incident' => $hasIncident
                ],
                'incidents' => $incidents,
                'last_updated' => now()->toIso8601String()
            ];
        });

        return Inertia::render('Status/Index', [
            'status' => $status
        ]);
    }

    private function checkDokploy($dokploy)
    {
        try {
            $apps = $dokploy->getAllApplications();
            return is_array($apps) ? 'operational' : 'degraded';
        } catch (\Exception $e) {
            return 'outage';
        }
    }

    private function checkCloudflare()
    {
        return config('services.cloudflare.token') ? 'operational' : 'degraded';
    }

    private function measureLatency($url)
    {
        if (!$url) return 0;
        $start = microtime(true);
        try {
            \Illuminate\Support\Facades\Http::timeout(1)->head($url);
        } catch (\Exception $e) {}
        return round((microtime(true) - $start) * 1000);
    }

    private function getComponentUptimeHistory($componentName)
    {
        // Generate 90 status points (1 per day)
        $history = [];
        $today = now();
        
        for ($i = 89; $i >= 0; $i--) {
            $day = $today->copy()->subDays($i);
            
            // Check if there was any audit log of failure or recovery on this day for this component/node
            $hasOutage = \App\Models\AuditLog::whereDate('created_at', $day->toDateString())
                ->where(function($q) {
                    $q->where('event', 'like', '%failure%')
                      ->orWhere('event', 'like', '%outage%')
                      ->orWhere('event', 'like', '%recovery%');
                })
                ->where(function($q) use ($componentName) {
                    $q->where('description', 'like', '%' . $componentName . '%')
                      ->orWhere('metadata', 'like', '%' . $componentName . '%');
                })
                ->exists();
                
            $history[] = $hasOutage ? 'degraded' : 'operational';
        }
        return $history;
    }
}
