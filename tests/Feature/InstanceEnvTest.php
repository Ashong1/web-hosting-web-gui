<?php

namespace Tests\Feature;

use App\Models\Instance;
use App\Models\Order;
use App\Models\User;
use App\Services\DokployService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InstanceEnvTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutMiddleware([\Illuminate\Foundation\Http\Middleware\ValidateCsrfToken::class]);
    }

    public function test_user_can_view_env_vars_for_their_own_instance()
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

        $mockEnv = [
            ['key' => 'DB_NAME', 'value' => 'test_db'],
            ['key' => 'APP_DEBUG', 'value' => 'false']
        ];

        $this->mock(DokployService::class, function ($mock) use ($mockEnv) {
            $mock->shouldReceive('setNode')->andReturnSelf();
            $mock->shouldReceive('getEnvVars')
                ->once()
                ->with('svc_123')
                ->andReturn($mockEnv);
        });

        $response = $this->actingAs($user)->get("/instances/{$instance->id}/env-vars");

        $response->assertStatus(200)
            ->assertJson([
                'env_vars' => $mockEnv
            ]);
    }

    public function test_user_can_update_env_vars_for_their_own_instance()
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

        $newEnv = [
            ['key' => 'DB_NAME', 'value' => 'new_db'],
            ['key' => 'APP_DEBUG', 'value' => 'true']
        ];

        $this->mock(DokployService::class, function ($mock) use ($newEnv) {
            $mock->shouldReceive('setNode')->andReturnSelf();
            $mock->shouldReceive('updateEnvVars')
                ->once()
                ->with('svc_123', $newEnv)
                ->andReturn(true);
        });

        $response = $this->actingAs($user)->post("/instances/{$instance->id}/env", [
            'env_vars' => $newEnv
        ]);

        $response->assertStatus(302); // Redirect back
        $response->assertSessionHas('success');
    }

    public function test_user_cannot_view_env_vars_for_others_instance()
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

        $response = $this->actingAs($user)->get("/instances/{$instance->id}/env-vars");

        $response->assertStatus(403);
    }
}
