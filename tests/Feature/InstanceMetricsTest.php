<?php

namespace Tests\Feature;

use App\Models\Instance;
use App\Models\Order;
use App\Models\User;
use App\Services\DokployService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InstanceMetricsTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_view_metrics_for_their_own_instance()
    {
        $user = User::factory()->create();
        
        $order = Order::create([
            'user_id' => $user->id,
            'plan_name' => 'Basic',
            'amount' => 100,
            'status' => 'fulfilled'
        ]);

        $instance = Instance::create([
            'user_id' => $user->id,
            'order_id' => $order->id,
            'name' => 'User App',
            'dokploy_service_id' => 'svc_123',
            'status' => 'active',
            'public_url' => 'user.aserotech.com'
        ]);

        $mockMetrics = [
            'cpu' => '12.5%',
            'memory' => '256MB',
            'memory_limit' => '1024MB',
            'status' => 'running'
        ];

        $this->mock(DokployService::class, function ($mock) use ($mockMetrics) {
            $mock->shouldReceive('setNode')->andReturnSelf();
            $mock->shouldReceive('getDetailedMetrics')
                 ->once()
                 ->with('svc_123')
                 ->andReturn($mockMetrics);
        });

        $response = $this->actingAs($user)->get("/instances/{$instance->id}/metrics");

        $response->assertStatus(200)
            ->assertJson([
                'metrics' => $mockMetrics
            ]);
    }

    public function test_user_cannot_view_metrics_for_others_instance()
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        
        $order = Order::create([
            'user_id' => $otherUser->id,
            'plan_name' => 'Basic',
            'amount' => 100,
            'status' => 'fulfilled'
        ]);

        $instance = Instance::create([
            'user_id' => $otherUser->id,
            'order_id' => $order->id,
            'name' => 'Other App',
            'dokploy_service_id' => 'svc_456',
            'status' => 'active',
            'public_url' => 'other.aserotech.com'
        ]);

        $response = $this->actingAs($user)->get("/instances/{$instance->id}/metrics");

        $response->assertStatus(403);
    }
}
