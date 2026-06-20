<?php

namespace Tests\Feature\Admin;

use App\Models\Instance;
use App\Models\User;
use App\Models\Order;
use App\Services\DokployService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithoutMiddleware;
use Tests\TestCase;

class ClientManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_suspending_user_stops_all_their_instances()
    {
        $this->withoutMiddleware([\Illuminate\Foundation\Http\Middleware\ValidateCsrfToken::class]);
        $admin = User::factory()->create(['role' => 'root']);
        $user = User::factory()->create(['role' => 'client', 'is_suspended' => false]);
        
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
            $mock->shouldReceive('controlInstance')
                ->once()
                ->with('svc_123', 'stop')
                ->andReturn(true);
        });

        $response = $this->actingAs($admin)->post(route('admin.clients.suspend', $user));

        $response->assertRedirect();
        $this->assertTrue($user->fresh()->is_suspended);
    }

    public function test_unsuspending_user_starts_all_their_instances()
    {
        $this->withoutMiddleware([\Illuminate\Foundation\Http\Middleware\ValidateCsrfToken::class]);
        $admin = User::factory()->create(['role' => 'root']);
        $user = User::factory()->create(['role' => 'client', 'is_suspended' => true]);
        
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
            $mock->shouldReceive('controlInstance')
                ->once()
                ->with('svc_123', 'start')
                ->andReturn(true);
        });

        $response = $this->actingAs($admin)->post(route('admin.clients.suspend', $user));

        $response->assertRedirect();
        $this->assertFalse($user->fresh()->is_suspended);
    }
}
