<?php

namespace Tests\Feature\Admin;

use App\Models\Instance;
use App\Models\User;
use App\Models\Order;
use App\Models\SecurityScan;
use App\Services\DokployService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SecurityControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_trigger_malware_scan()
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
            $mock->shouldReceive('executeCommand')
                ->twice() // once for count, once for grep
                ->andReturn(['output' => "0\n"]);
        });

        $response = $this->actingAs($admin)->post(route('admin.security.scan.trigger', $instance->id), [
            'type' => 'malware'
        ]);

        $response->assertRedirect();
        
        $this->assertDatabaseHas('security_scans', [
            'instance_id' => $instance->id,
            'type' => 'malware',
            'status' => 'completed'
        ]);
    }

    public function test_admin_can_trigger_integrity_scan()
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
            $mock->shouldReceive('executeCommand')
                ->once()
                ->andReturn(['output' => ""]);
        });

        $response = $this->actingAs($admin)->post(route('admin.security.scan.trigger', $instance->id), [
            'type' => 'integrity'
        ]);

        $response->assertRedirect();

        $this->assertDatabaseHas('security_scans', [
            'instance_id' => $instance->id,
            'type' => 'integrity',
            'status' => 'completed'
        ]);
    }
}
