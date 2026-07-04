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

    public function test_admin_can_filter_fleet_by_search_query()
    {
        $admin = User::factory()->create(['role' => 'root']);
        $user1 = User::factory()->create(['role' => 'client', 'email' => 'client1@example.com']);
        $user2 = User::factory()->create(['role' => 'client', 'email' => 'other@example.com']);

        $order1 = Order::create([
            'user_id' => $user1->id,
            'plan_name' => 'Basic',
            'amount' => 100,
            'status' => 'fulfilled'
        ]);
        $order2 = Order::create([
            'user_id' => $user2->id,
            'plan_name' => 'Premium',
            'amount' => 300,
            'status' => 'fulfilled'
        ]);

        $instance1 = Instance::create([
            'user_id' => $user1->id,
            'order_id' => $order1->id,
            'name' => 'Alpha App',
            'dokploy_service_id' => 'svc_1',
            'status' => 'active',
            'public_url' => 'alpha.aserotech.com'
        ]);

        $instance2 = Instance::create([
            'user_id' => $user2->id,
            'order_id' => $order2->id,
            'name' => 'Beta App',
            'dokploy_service_id' => 'svc_2',
            'status' => 'active',
            'public_url' => 'beta.aserotech.com'
        ]);

        $this->mock(DokployService::class, function ($mock) {
            $mock->shouldReceive('getAllApplications')->andReturn([
                ['id' => 'svc_1', 'status' => 'running'],
                ['id' => 'svc_2', 'status' => 'running']
            ]);
        });

        // Filter by name 'Alpha'
        $response = $this->actingAs($admin)->get(route('admin.fleet.index', ['search' => 'Alpha']));
        $response->assertStatus(200);
        
        $pageData = $response->original->getData()['page'];
        $instances = $pageData['props']['instances']['data'];
        $this->assertCount(1, $instances);
        $this->assertEquals('Alpha App', $instances[0]['name']);

        // Filter by user email 'client1'
        $response = $this->actingAs($admin)->get(route('admin.fleet.index', ['search' => 'client1']));
        $response->assertStatus(200);
        
        $pageData = $response->original->getData()['page'];
        $instances = $pageData['props']['instances']['data'];
        $this->assertCount(1, $instances);
        $this->assertEquals('Alpha App', $instances[0]['name']);
    }
}

