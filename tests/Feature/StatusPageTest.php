<?php

namespace Tests\Feature;

use App\Models\AuditLog;
use App\Models\Node;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class StatusPageTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_status_page_renders_with_real_time_database_data()
    {
        // 1. Create a node to trigger dynamic check
        $node = Node::create([
            'name' => 'Quezon Core PH-01',
            'ip_address' => '1.1.1.1',
            'api_url' => 'http://1.1.1.1/api',
            'api_key' => 'secret_key',
            'is_active' => true,
            'location' => 'Quezon City',
        ]);

        // 2. Create a public incident log in AuditLog
        AuditLog::create([
            'user_id' => null,
            'event' => 'system.incident',
            'description' => 'Incident Test Description',
            'ip_address' => '127.0.0.1',
            'metadata' => json_encode([
                'title' => 'Core Router Interruption',
                'status' => 'resolved',
                'impact' => 'minor',
                'body' => 'Router reboot completed successfully.'
            ])
        ]);

        // Mock external API checks
        Http::fake([
            'https://api.cloudflare.com/*' => Http::response([], 200),
            'http://1.1.1.1/*' => Http::response([], 200),
        ]);

        $response = $this->get('/status');

        $response->assertStatus(200);

        // Verify Inertia props structure
        $response->assertInertia(fn ($page) => $page
            ->component('Status/Index')
            ->has('status.components')
            ->has('status.summary')
            ->has('status.incidents', 1)
            ->where('status.incidents.0.title', 'Core Router Interruption')
        );
    }
}
