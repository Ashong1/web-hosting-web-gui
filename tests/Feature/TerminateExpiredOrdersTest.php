<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\Instance;
use App\Models\User;
use App\Models\Plan;
use App\Services\DokployService;
use App\Services\CloudflareService;
use App\Services\UptimeKumaService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TerminateExpiredOrdersTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_terminates_expired_orders()
    {
        $user = User::factory()->create();
        $plan = Plan::create([
            'name' => 'Test Plan',
            'slug' => 'test-plan',
            'price' => 100,
            'image' => 'test/image',
            'is_active' => true
        ]);

        // 1. Create an expired order (already suspended for more than 7 days)
        $expiredOrder = Order::create([
            'user_id' => $user->id,
            'plan_id' => $plan->id,
            'plan_name' => $plan->name,
            'amount' => $plan->price,
            'status' => 'suspended',
            'suspended_at' => now()->subDays(8),
            'expires_at' => now()->subDays(9), // Expired yesterday
            'admin_notes' => 'Some notes'
        ]);

        $expiredInstance = Instance::create([
            'user_id' => $user->id,
            'order_id' => $expiredOrder->id,
            'name' => 'Expired App',
            'dokploy_service_id' => 'svc_expired',
            'dokploy_database_id' => 'db_expired',
            'status' => 'active',
            'public_url' => 'expired.aserotech.com'
        ]);

        // 2. Create a non-expired order
        $validOrder = Order::create([
            'user_id' => $user->id,
            'plan_id' => $plan->id,
            'plan_name' => $plan->name,
            'amount' => $plan->price,
            'status' => 'fulfilled',
            'expires_at' => now()->addDays(29), // Valid
            'admin_notes' => 'Some notes'
        ]);

        $validInstance = Instance::create([
            'user_id' => $user->id,
            'order_id' => $validOrder->id,
            'name' => 'Valid App',
            'dokploy_service_id' => 'svc_valid',
            'dokploy_database_id' => 'db_valid',
            'status' => 'active',
            'public_url' => 'valid.aserotech.com'
        ]);

        // Mock Dokploy
        $this->mock(DokployService::class, function ($mock) {
            $mock->shouldReceive('setNode')->andReturnSelf();
            
            $mock->shouldReceive('deleteInstance')
                ->once()
                ->with('svc_expired')
                ->andReturn(true);
            
            $mock->shouldReceive('deleteDatabase')
                ->once()
                ->with('db_expired')
                ->andReturn(true);

            $mock->shouldNotReceive('deleteInstance')
                ->with('svc_valid');
        });

        // Mock Cloudflare
        $this->mock(CloudflareService::class, function ($mock) {
            $mock->shouldReceive('deleteDnsRecord')
                ->once()
                ->with('expired')
                ->andReturn(true);
        });

        // Mock UptimeKuma
        $this->mock(UptimeKumaService::class, function ($mock) {
            $mock->shouldReceive('deleteMonitor')
                ->once()
                ->with('https://expired.aserotech.com')
                ->andReturn(true);
        });

        // Run Command
        $this->artisan('orders:terminate-expired')
            ->expectsOutput("Nuclear Protocol: Grace period expired for Order #{$expiredOrder->id}. Commencing data erasure...")
            ->expectsOutput(" -> Deleting Dokploy service: {$expiredInstance->dokploy_service_id}")
            ->expectsOutput(" -> Deleting Dokploy database: {$expiredInstance->dokploy_database_id}")
            ->expectsOutput(" -> Withdrawing Cloudflare DNS: expired")
            ->expectsOutput(" -> Deactivating health probe: https://expired.aserotech.com")
            ->expectsOutput("Lifecycle management cycle complete.")
            ->assertExitCode(0);

        // Assertions
        $this->assertDatabaseMissing('instances', ['id' => $expiredInstance->id]);
        $this->assertDatabaseHas('instances', ['id' => $validInstance->id]);
        
        $this->assertEquals('rejected', $expiredOrder->fresh()->status);
        $this->assertEquals('fulfilled', $validOrder->fresh()->status);
    }
}
