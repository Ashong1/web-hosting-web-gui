<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\Plan;
use App\Models\User;
use App\Jobs\ProvisionInstanceJob;
use App\Services\DokployService;
use App\Services\CloudflareService;
use App\Services\UptimeKumaService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use App\Mail\InstanceProvisioned;
use Tests\TestCase;

class ProvisioningTest extends TestCase
{
    use RefreshDatabase;

    public function test_provisioning_job_executes_successfully()
    {
        Mail::fake();
        \Illuminate\Support\Facades\Event::fake();

        // Mock Services
        $this->mock(DokployService::class, function ($mock) {
            $mock->shouldReceive('createProject')->andReturn(['id' => 'proj_123']);
            $mock->shouldReceive('createDatabase')->andReturn(['id' => 'db_123']);
            $mock->shouldReceive('createApplication')->andReturn(['id' => 'app_123']);
            $mock->shouldReceive('updateResources')->andReturn(true);
            $mock->shouldReceive('updateEnvVars')->andReturn(true);
            $mock->shouldReceive('createMount')->andReturn(true);
            $mock->shouldReceive('addDomain')->andReturn(true);
            $mock->shouldReceive('deploy')->andReturn(true);
        });

        $this->mock(CloudflareService::class, function ($mock) {
            $mock->shouldReceive('createDnsRecord')->andReturn(true);
        });

        $this->mock(UptimeKumaService::class, function ($mock) {
            $mock->shouldReceive('addMonitor')->andReturn(true);
        });

        $user = User::factory()->create();
        $plan = Plan::create([
            'name' => 'Test Plan',
            'slug' => 'test-plan',
            'price' => 100,
            'image' => 'test/image',
            'is_active' => true
        ]);

        $order = Order::create([
            'user_id' => $user->id,
            'plan_id' => $plan->id,
            'plan_name' => $plan->name,
            'amount' => $plan->price,
            'status' => 'approved',
            'admin_notes' => json_encode(['app_name' => 'TestApp', 'subdomain' => 'testsub'])
        ]);

        // Execute Job
        $job = new ProvisionInstanceJob($order);
        app()->call([$job, 'handle']);

        // Assertions
        $this->assertDatabaseHas('orders', [
            'id' => $order->id,
            'status' => 'fulfilled'
        ]);

        $this->assertDatabaseHas('instances', [
            'user_id' => $user->id,
            'order_id' => $order->id,
            'name' => 'TestApp',
            'public_url' => 'testsub.aserotech.com'
        ]);

        Mail::assertSent(InstanceProvisioned::class, function ($mail) use ($user) {
            return $mail->hasTo($user->email);
        });
    }
}
