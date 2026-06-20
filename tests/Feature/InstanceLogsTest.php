<?php

namespace Tests\Feature;

use App\Models\Instance;
use App\Models\Order;
use App\Models\User;
use App\Services\DokployService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class InstanceLogsTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_view_logs_for_their_own_instance()
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

        $this->mock(DokployService::class, function ($mock) {
            $mock->shouldReceive('setNode')->andReturnSelf();
            $mock->shouldReceive('getLogs')
                ->once()
                ->with('svc_123')
                ->andReturn("Line 1: App started\nLine 2: Ready");
        });

        $response = $this->actingAs($user)->get("/instances/{$instance->id}/logs");

        $response->assertStatus(200)
            ->assertJson([
                'logs' => "Line 1: App started\nLine 2: Ready"
            ]);
    }

    public function test_user_cannot_view_logs_for_others_instance()
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

        $response = $this->actingAs($user)->get("/instances/{$instance->id}/logs");

        $response->assertStatus(403);
    }
}
