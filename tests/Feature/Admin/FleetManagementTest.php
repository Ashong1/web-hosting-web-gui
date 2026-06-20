<?php

namespace Tests\Feature\Admin;

use App\Models\Instance;
use App\Models\User;
use App\Models\Order;
use App\Services\DokployService;
use App\Services\CloudflareService;
use App\Services\UptimeKumaService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FleetManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_manually_control_instances()
    {
        $admin = User::factory()->create(['role' => 'root']);
        $user = User::factory()->create(['role' => 'client']);

        $order = Order::create([
            'user_id' => $user->id,
            'plan_name' => 'Basic',
            'amount' => 100,
            'status' => 'fulfilled'
        ]);

        $instance = Instance::create([
            'user_id' => $user->id,
            'order_id' => $order->id,
            'name' => 'Test App',
            'dokploy_service_id' => 'svc_123',
            'status' => 'active',
            'public_url' => 'testapp.aserotech.com'
        ]);

        $this->mock(DokployService::class, function ($mock) {
            $mock->shouldReceive('setNode')->andReturnSelf();
            $mock->shouldReceive('controlInstance')
                ->once()
                ->with('svc_123', 'stop')
                ->andReturn(true);
        });

        $response = $this->actingAs($admin)->post(route('admin.fleet.action', ['instance' => $instance->id, 'action' => 'stop']));

        $response->assertRedirect();
    }

    public function test_admin_can_manually_terminate_instances()
    {
        $admin = User::factory()->create(['role' => 'root']);
        $user = User::factory()->create(['role' => 'client']);

        $order = Order::create([
            'user_id' => $user->id,
            'plan_name' => 'Basic',
            'amount' => 100,
            'status' => 'fulfilled'
        ]);

        $instance = Instance::create([
            'user_id' => $user->id,
            'order_id' => $order->id,
            'name' => 'Test App',
            'dokploy_service_id' => 'svc_123',
            'dokploy_database_id' => 'db_123',
            'status' => 'active',
            'public_url' => 'testapp.aserotech.com'
        ]);

        $this->mock(DokployService::class, function ($mock) {
            $mock->shouldReceive('setNode')->andReturnSelf();
            $mock->shouldReceive('deleteInstance')->once()->with('svc_123')->andReturn(true);
            $mock->shouldReceive('deleteDatabase')->once()->with('db_123')->andReturn(true);
        });

        $this->mock(CloudflareService::class, function ($mock) {
            $mock->shouldReceive('deleteDnsRecord')->once()->with('testapp')->andReturn(true);
        });

        $this->mock(UptimeKumaService::class, function ($mock) {
            $mock->shouldReceive('deleteMonitor')->once()->with('https://testapp.aserotech.com')->andReturn(true);
        });

        $response = $this->actingAs($admin)->post(route('admin.fleet.action', ['instance' => $instance->id, 'action' => 'terminate']));

        $response->assertRedirect();
        $this->assertDatabaseMissing('instances', ['id' => $instance->id]);
        $this->assertEquals('rejected', $order->fresh()->status);
    }
}
