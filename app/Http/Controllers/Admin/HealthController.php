<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\DokployService;
use App\Services\CloudflareService;
use App\Services\ProxmoxService;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;

class HealthController extends Controller
{
    public function index(DokployService $dokploy, CloudflareService $cloudflare, ProxmoxService $proxmox)
    {
        $health = Cache::remember('admin.system_health', 60, function() use ($dokploy, $cloudflare, $proxmox) {
            $nodes = \App\Models\Node::all();
            $nodeStatus = [];

            foreach ($nodes as $node) {
                $dokploy->setNode($node);
                $nodeStatus[$node->id] = [
                    'name' => $node->name,
                    'status' => $this->checkDokploy($dokploy),
                    'latency' => $this->measureLatency($node->api_url),
                    'location' => $node->location,
                ];
            }

            return [
                'services' => [
                    'cloudflare' => [
                        'name' => 'Cloudflare DNS API',
                        'status' => $this->checkCloudflare($cloudflare),
                        'latency' => $this->measureLatency('https://api.cloudflare.com/client/v4/user'),
                    ],
                    'proxmox' => [
                        'name' => 'Proxmox Hypervisor',
                        'status' => $proxmox->getNodeStatus() ? 'online' : 'offline',
                        'latency' => $this->measureLatency(config('services.proxmox.url')),
                    ],
                ],
                'nodes' => $nodeStatus,
                'queue' => [
                    'backlog' => \DB::table('jobs')->count(),
                    'failed' => \DB::table('failed_jobs')->count(),
                ],
                'cluster' => [
                    'total_instances' => \App\Models\Instance::count(),
                    'active_instances' => \App\Models\Instance::where('status', 'active')->count(),
                ]
            ];
        });

        return Inertia::render('Admin/Health/Index', [
            'health' => $health
        ]);
    }

    private function checkDokploy($dokploy)
    {
        try {
            // If we can get a response (even empty), the API is operational
            $apps = $dokploy->getAllApplications();
            return is_array($apps) ? 'online' : 'offline';
        } catch (\Exception $e) {
            return 'offline';
        }
    }

    private function checkCloudflare($cloudflare)
    {
        try {
            // Minimal call to check token validity
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . config('services.cloudflare.token'),
            ])->get('https://api.cloudflare.com/client/v4/user/tokens/verify');
            
            return $response->successful() ? 'online' : 'unauthorized';
        } catch (\Exception $e) {
            return 'offline';
        }
    }

    private function measureLatency($url)
    {
        if (!$url) return 0;
        $start = microtime(true);
        try {
            Http::timeout(2)->head($url);
        } catch (\Exception $e) {}
        return round((microtime(true) - $start) * 1000);
    }
}
