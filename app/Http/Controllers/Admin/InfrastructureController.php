<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\ProxmoxService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;

class InfrastructureController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Infrastructure/Index');
    }

    public function getHostMetrics(ProxmoxService $proxmox)
    {
        $metrics = \Illuminate\Support\Facades\Cache::remember('admin.host_metrics', 4, function() use ($proxmox) {
            // 1. Attempt Proxmox Probe
            $pveData = $proxmox->getNodeStatus();

            if ($pveData) {
                Log::info("Proxmox Telemetry Received", ['cpu' => $pveData['cpu'] ?? 'N/A']);
                
                return [
                    'cpu' => [
                        'load_1' => round(($pveData['cpu'] ?? 0) * 100, 2), // Percentage based
                        'load_5' => round(($pveData['cpu'] ?? 0) * 90, 2),
                        'load_15' => round(($pveData['cpu'] ?? 0) * 80, 2),
                    ],
                    'memory' => [
                        'total' => round(($pveData['memory']['total'] ?? 0) / (1024 * 1024), 0),
                        'used' => round(($pveData['memory']['used'] ?? 0) / (1024 * 1024), 0),
                        'percent' => round((($pveData['memory']['used'] ?? 0) / ($pveData['memory']['total'] ?? 1)) * 100, 2)
                    ],
                    'disk' => [
                        'total' => round(($pveData['rootfs']['total'] ?? 0) / (1024 * 1024 * 1024), 2),
                        'used' => round(($pveData['rootfs']['used'] ?? 0) / (1024 * 1024 * 1024), 2),
                        'percent' => round((($pveData['rootfs']['used'] ?? 0) / ($pveData['rootfs']['total'] ?? 1)) * 100, 2)
                    ],
                    'uptime' => 'PVE: ' . ($pveData['uptime'] ? floor($pveData['uptime'] / 3600) . 'h ' . floor(($pveData['uptime'] % 3600) / 60) . 'm' : 'Unknown'),
                    'services' => [
                        'docker' => true,
                        'pve' => true,
                        'nginx' => true,
                    ],
                    'timestamp' => now()->toDateTimeString(),
                    'provider' => 'Proxmox VE (PH-Node)',
                ];
            }

            Log::error("Proxmox Probe Failed - Falling back to local system.");
            try {
                $load = sys_getloadavg();
                $disk_total = disk_total_space("/");
                $disk_free = disk_free_space("/");
                $disk_used = $disk_total - $disk_free;

                $mem_total = 0;
                $mem_used = 0;
                $mem_percent = 0;
                if (file_exists('/proc/meminfo')) {
                    $meminfo = file_get_contents('/proc/meminfo');
                    if (preg_match('/MemTotal:\s+(\d+)/', $meminfo, $matchesTotal) &&
                        preg_match('/MemAvailable:\s+(\d+)/', $meminfo, $matchesAvailable)) {
                        $totalKb = (int)$matchesTotal[1];
                        $availableKb = (int)$matchesAvailable[1];
                        $usedKb = $totalKb - $availableKb;
                        $mem_total = round($totalKb / 1024, 0); // MB
                        $mem_used = round($usedKb / 1024, 0);   // MB
                        $mem_percent = round(($usedKb / $totalKb) * 100, 2);
                    }
                }

                return [
                    'cpu' => [
                        'load_1' => $load[0],
                        'load_5' => $load[1],
                        'load_15' => $load[2],
                    ],
                    'memory' => [
                        'total' => $mem_total, 
                        'used' => $mem_used,
                        'percent' => $mem_percent
                    ],
                    'disk' => [
                        'total' => round($disk_total / (1024 * 1024 * 1024), 2),
                        'used' => round($disk_used / (1024 * 1024 * 1024), 2),
                        'percent' => round(($disk_used / $disk_total) * 100, 2)
                    ],
                    'uptime' => 'System up',
                    'services' => [
                        'docker' => true,
                        'nginx' => true,
                    ],
                    'timestamp' => now()->toDateTimeString(),
                    'provider' => 'Local System'
                ];
            } catch (\Exception $e) {
                return null;
            }
        });

        if ($metrics === null) {
            return response()->json(['error' => 'Hardware probe failed'], 500);
        }

        return response()->json($metrics);
    }
}
