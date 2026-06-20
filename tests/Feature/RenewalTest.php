<?php

namespace Tests\Feature;

use App\Models\Instance;
use App\Models\Order;
use App\Models\Plan;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class RenewalTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_create_renewal_payment_intent()
    {
        $this->withoutMiddleware();
        Http::fake([
            'payments-api.aserotech.com/payments' => Http::response([
                'client_secret' => 'renewal_secret',
                'payment_id' => 'pay_renewal'
            ], 200),
        ]);

        $user = User::factory()->create();
        $plan = Plan::create([
            'name' => 'Test Plan',
            'slug' => 'test-plan',
            'price' => 100,
            'is_active' => true
        ]);

        $initialOrder = Order::create([
            'user_id' => $user->id,
            'plan_id' => $plan->id,
            'plan_name' => $plan->name,
            'amount' => 100,
            'status' => 'fulfilled'
        ]);

        $instance = Instance::create([
            'user_id' => $user->id,
            'order_id' => $initialOrder->id,
            'name' => 'My App',
            'dokploy_service_id' => 'svc_123',
            'status' => 'active',
            'public_url' => 'myapp.com'
        ]);

        $response = $this->actingAs($user)->postJson(route('payment.intent'), [
            'plan_id' => $plan->id,
            'instance_id' => $instance->id,
        ]);

        $response->assertStatus(200)
            ->assertJson(['client_secret' => 'renewal_secret']);

        $this->assertDatabaseHas('orders', [
            'user_id' => $user->id,
            'plan_id' => $plan->id,
            'status' => 'pending'
        ]);

        $order = Order::orderBy('id', 'desc')->first();
        $this->assertNotNull($order, 'No order found after payment intent creation.');
        $this->assertNotNull($order->admin_notes, 'Order admin_notes is null.');
        $metadata = json_decode($order->admin_notes, true);
        $this->assertEquals('renewal', $metadata['type'] ?? null);
        $this->assertEquals($instance->id, $metadata['instance_id'] ?? null);
    }

    public function test_renewal_webhook_extends_expiry()
    {
        $user = User::factory()->create();
        $plan = Plan::create([
            'name' => 'Test Plan',
            'slug' => 'test-plan',
            'price' => 100,
            'is_active' => true
        ]);

        $oldOrder = Order::create([
            'user_id' => $user->id,
            'plan_id' => $plan->id,
            'plan_name' => $plan->name,
            'amount' => 100,
            'status' => 'fulfilled',
            'expires_at' => now()->addDays(2)
        ]);

        $instance = Instance::create([
            'user_id' => $user->id,
            'order_id' => $oldOrder->id,
            'name' => 'My App',
            'dokploy_service_id' => 'svc_123',
            'status' => 'active',
            'public_url' => 'myapp.com'
        ]);

        $renewalOrder = Order::create([
            'user_id' => $user->id,
            'plan_id' => $plan->id,
            'plan_name' => $plan->name,
            'amount' => 100,
            'status' => 'pending',
            'admin_notes' => json_encode([
                'type' => 'renewal',
                'instance_id' => $instance->id
            ])
        ]);

        $payload = [
            'event_type' => 'payment_succeeded',
            'content' => [
                'object' => [
                    'order_id' => 'asero_order_' . $renewalOrder->id,
                    'status' => 'succeeded'
                ]
            ]
        ];

        // Bypass security middleware for test
        $secret = config('services.hyperswitch.webhook_secret');
        $signature = hash_hmac('sha512', json_encode($payload), $secret);

        $response = $this->postJson('/api/webhooks/hyperswitch-payments', $payload, [
            'x-webhook-signature-512' => $signature
        ]);

        $response->assertStatus(200)
            ->assertJson(['status' => 'renewal_processed']);

        $this->assertEquals('fulfilled', $renewalOrder->fresh()->status);
        $this->assertNotNull($renewalOrder->fresh()->expires_at);
        $this->assertEquals($renewalOrder->id, $instance->fresh()->order_id);
    }
}
