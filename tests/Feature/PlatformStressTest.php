<?php

namespace Tests\Feature;

use App\Models\Instance;
use App\Models\Node;
use App\Models\Order;
use App\Models\Plan;
use App\Models\User;
use App\Jobs\DeployAppJob;
use App\Services\DokployService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

class PlatformStressTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutMiddleware([\Illuminate\Foundation\Http\Middleware\ValidateCsrfToken::class]);
        \Illuminate\Support\Facades\Event::fake([\App\Events\NodeStatusUpdated::class, \App\Events\SystemSignalBroadcast::class]);
    }

    /**
     * Test Case: Orchestration Idempotency Stress
     */
    public function test_orchestration_idempotency_under_concurrency()
    {
        $user = User::factory()->create(['credits' => 1000]);
        $node = Node::create([
            'name' => 'Test Node',
            'ip_address' => '1.2.3.4',
            'api_url' => 'http://test.com',
            'api_key' => 'key',
            'status' => 'online'
        ]);

        $order = Order::create([
            'user_id' => $user->id,
            'plan_name' => 'Stress Plan',
            'amount' => 100,
            'status' => 'approved'
        ]);

        $instance = Instance::create([
            'user_id' => $user->id,
            'node_id' => $node->id,
            'order_id' => $order->id,
            'name' => 'stress-test-app',
            'public_url' => 'stress.aserotech.com',
            'deployment_status' => 'pending',
            'provisioning_progress' => []
        ]);

        $dokployMock = $this->mock(DokployService::class);
        $dokployMock->shouldReceive('setNode')->andReturnSelf();
        
        $dokployMock->shouldReceive('createApplication')
            ->once()
            ->andReturn(['id' => 'svc_999']);

        // Mock subsequent steps to prevent expectation errors
        $dokployMock->shouldReceive('updateResources')->andReturn(true);
        $dokployMock->shouldReceive('updateEnvVars')->andReturn(true);
        $dokployMock->shouldReceive('addDomain')->andReturn(true);
        $dokployMock->shouldReceive('deploy')->andReturn(true);

        // Mock Cloudflare to prevent cURL errors
        $cfMock = $this->mock(\App\Services\CloudflareService::class);
        $cfMock->shouldReceive('createDnsRecord')->andReturn(true);

        // Run the job multiple times sequentially
        $job = new DeployAppJob($instance);
        
        $job->handle($dokployMock, $cfMock);
        $this->assertEquals('svc_999', $instance->fresh()->dokploy_service_id);
        $this->assertArrayHasKey('resource_registered', $instance->fresh()->provisioning_progress);

        // 2nd run: Should SKIP createApplication (already mocked as ->once())
        $job->handle($dokployMock, $cfMock);
    }

    /**
     * Test Case: Node Capacity & Selection Stress
     */
    public function test_dynamic_node_assignment_capacity()
    {
        $this->mock(DokployService::class, function ($mock) {
            $mock->shouldReceive('setNode')->andReturnSelf();
            $mock->shouldReceive('createApplication')->andReturn(['id' => 'svc_123']);
            $mock->shouldReceive('updateResources')->andReturn(true);
            $mock->shouldReceive('updateEnvVars')->andReturn(true);
            $mock->shouldReceive('createMount')->andReturn(true);
            $mock->shouldReceive('addDomain')->andReturn(true);
            $mock->shouldReceive('deploy')->andReturn(true);
        });

        $this->mock(\App\Services\CloudflareService::class, function ($mock) {
            $mock->shouldReceive('createDnsRecord')->andReturn(true);
        });

        $user = User::factory()->create(['credits' => 10000]);
        $plan = Plan::create([
            'name' => 'Stress Plan', 
            'slug' => 'stress-plan',
            'price' => 100, 
            'resource_limits' => ['cpu' => 1, 'memory' => 1024, 'replicas' => 1]
        ]);

        $node1 = Node::create(['name' => 'Node 1', 'ip_address' => '1.1.1.1', 'api_url' => 'h1', 'api_key' => 'k1', 'is_active' => true]);
        $node2 = Node::create(['name' => 'Node 2', 'ip_address' => '2.2.2.2', 'api_url' => 'h2', 'api_key' => 'k2', 'is_active' => false]);

        $action = app(\App\Actions\ProvisionInstanceAction::class);

        for($i=0; $i<5; $i++) {
            $action->execute($user, $plan, [
                'project_type' => 'application',
                'build_strategy' => 'nixpacks',
                'app_name' => "stress-app-{$i}",
                'subdomain' => "stress-{$i}",
                'repository_url' => 'https://github.com/test/test'
            ]);
        }

        $this->assertEquals(5, Instance::where('node_id', $node1->id)->count());
        $this->assertEquals(0, Instance::where('node_id', $node2->id)->count());
    }

    /**
     * Test Case: Database Integrity
     */
    public function test_database_relational_integrity()
    {
        User::factory()->count(5)->create()->each(function($u) {
            $node = Node::create(['name' => 'N', 'ip_address' => 'i', 'api_url' => 'a', 'api_key' => 'k']);
            $order = Order::create(['user_id' => $u->id, 'plan_name' => 'P', 'amount' => 10, 'status' => 'approved']);
            Instance::create([
                'user_id' => $u->id,
                'node_id' => $node->id,
                'order_id' => $order->id,
                'name' => 'App',
                'status' => 'active'
            ]);
        });

        $this->assertEquals(5, Instance::count());
        $this->assertEquals(0, Instance::whereNull('node_id')->count());
    }
}
