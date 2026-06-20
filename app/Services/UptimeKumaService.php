<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class UptimeKumaService
{
    protected string $url;
    protected string $apiKey;

    public function __construct()
    {
        $this->url = rtrim(config('services.uptime_kuma.url'), '/');
        $this->apiKey = config('services.uptime_kuma.key');
    }

    protected function client()
    {
        return Http::withHeaders([
            'Authorization' => 'Bearer ' . $this->apiKey,
        ])->baseUrl($this->url);
    }

    public function addMonitor(string $friendlyName, string $url)
    {
        try {
            $response = $this->client()->post('/api/monitors', [
                'name' => $friendlyName,
                'url' => $url,
                'type' => 'http',
                'interval' => 60,
                'retryInterval' => 60,
                'resendInterval' => 0,
                'maxRetries' => 1,
                'upsideDown' => false,
                'packetSize' => 56,
                'expiryNotification' => false,
                'ignoreTls' => false,
                'method' => 'GET',
            ]);
            return $response->json();
        } catch (\Exception $e) {
            Log::error("Uptime Kuma Error: " . $e->getMessage());
            return null;
        }
    }

    public function deleteMonitor(string $url)
    {
        try {
            $response = $this->client()->get('/api/monitors');
            if ($response->failed()) return false;
            $monitors = $response->json();
            $monitor = collect($monitors)->firstWhere('url', $url);
            if (!$monitor) return false;
            return $this->client()->delete("/api/monitors/{$monitor['id']}")->successful();
        } catch (\Exception $e) {
            return false;
        }
    }

    public function getMonitorStatus(string $url)
    {
        try {
            $response = $this->client()->get('/api/monitors');

            if ($response->failed()) {
                \Illuminate\Support\Facades\Log::error('UptimeKuma API failed to fetch monitor status for URL: ' . $url);
                return [
                    'status' => 'unknown',
                    'uptime_24h' => '0.00',
                    'latency' => 0,
                    'history' => []
                ];
            }

            $monitors = $response->json();
            $monitor = collect($monitors)->firstWhere('url', $url);

            if (!$monitor) {
                return [
                    'status' => 'unknown',
                    'uptime_24h' => '0.00',
                    'latency' => 0,
                    'history' => []
                ];
            }

            return [
                'status' => $monitor['active'] ? 'up' : 'down',
                'uptime_24h' => $monitor['uptime'] ?? '0.00',
                'latency' => $monitor['latency'] ?? 0,
                'history' => $monitor['history'] ?? []
            ];
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('UptimeKuma Connection Error: ' . $e->getMessage());
            return null;
        }
    }

    public function getAllMonitors()
    {
        try {
            $response = $this->client()->get('/api/monitors');

            if ($response->failed()) {
                // Policy: Transparency. Return empty instead of mock data if the API fails.
                \Illuminate\Support\Facades\Log::error('UptimeKuma API failed to fetch monitors. Status: ' . $response->status());
                return [];
            }

            $monitors = $response->json();
            return collect($monitors)->map(function($m) {
                return [
                    'id' => $m['id'],
                    'name' => $m['name'],
                    'status' => $m['active'] ? 'up' : 'down',
                    'url' => $m['url'] ?? null,
                    'type' => $m['type'],
                    'uptime' => $m['uptime'] ?? '0.00', // Assuming the API returns actual uptime
                    'latency' => $m['latency'] ?? 0       // Assuming the API returns actual latency
                ];
            })->toArray();
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('UptimeKuma Connection Error: ' . $e->getMessage());
            return [];
        }
    }
}
