<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ProxmoxService
{
    protected ?string $url;
    protected ?string $token;
    protected string $node;

    public function __construct()
    {
        $this->url = config('services.proxmox.url') ? rtrim(config('services.proxmox.url'), '/') : null;
        $this->token = config('services.proxmox.token');
        $this->node = config('services.proxmox.node', 'pve2');
    }

    /**
     * Get host-level performance metrics
     */
    public function getNodeStatus()
    {
        if (!$this->url || !$this->token) {
            return null;
        }

        try {
            // Using raw curl or PHP native to avoid Guzzle version mismatches if any
            $response = Http::withHeaders([
                'Authorization' => 'PVEAPIToken=' . $this->token,
            ])
            ->withoutVerifying()
            ->get("{$this->url}/api2/json/nodes/{$this->node}/status");
            
            if ($response->failed()) {
                Log::error("Proxmox API Error: " . $response->status() . " - " . $response->body());
                return null;
            }

            return $response->json()['data'] ?? null;
        } catch (\Exception $e) {
            Log::error("Proxmox Connection Failed: " . $e->getMessage());
            return null;
        }
    }
}
