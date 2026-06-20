<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class CloudflareService
{
    protected ?string $apiToken;
    protected ?string $zoneId;

    public function __construct()
    {
        $this->apiToken = config('services.cloudflare.token');
        $this->zoneId = config('services.cloudflare.zone_id');
    }

    protected function client()
    {
        return Http::withHeaders([
            'Authorization' => 'Bearer ' . $this->apiToken,
            'Content-Type' => 'application/json',
        ])->baseUrl('https://api.cloudflare.com/client/v4');
    }

    public function createDnsRecord(string $name, string $content, string $type = 'CNAME', bool $proxied = true)
    {
        if (!$this->apiToken || !$this->zoneId) {
            Log::error("Cloudflare Service Configuration Missing.");
            return null;
        }

        try {
            $response = $this->client()->post("/zones/{$this->zoneId}/dns_records", [
                'type' => $type,
                'name' => $name,
                'content' => $content,
                'ttl' => 1, // Auto
                'proxied' => $proxied,
            ]);

            return $response->json();
        } catch (\Exception $e) {
            Log::error("Cloudflare Service Error (createDnsRecord): " . $e->getMessage());
            return null;
        }
    }

    public function deleteDnsRecord(string $name)
    {
        if (!$this->apiToken || !$this->zoneId) {
            Log::error("Cloudflare Service Configuration Missing.");
            return false;
        }

        try {
            // First, find the record ID
            $response = $this->client()->get("/zones/{$this->zoneId}/dns_records", [
                'name' => $name,
            ]);

            $records = $response->json('result');
            
            if (empty($records)) {
                return false; // Record not found
            }

            $recordId = $records[0]['id'];

            // Then, delete the record
            $deleteResponse = $this->client()->delete("/zones/{$this->zoneId}/dns_records/{$recordId}");

            return $deleteResponse->successful();
        } catch (\Exception $e) {
            Log::error("Cloudflare Service Error (deleteDnsRecord): " . $e->getMessage());
            return false;
        }
    }
}
