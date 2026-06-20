<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\Plan;
use App\Models\User;
use App\Jobs\ProvisionInstanceJob;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Queue;
use Illuminate\Foundation\Testing\WithoutMiddleware;
use Tests\TestCase;

class HyperswitchPaymentTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_create_payment_intent()
    {
        $this->withoutMiddleware();
        Queue::fake();
        Http::fake([
            'payments-api.aserotech.com/payments' => Http::response([
                'client_secret' => 'test_secret',
                'payment_id' => 'pay_123'
            ], 200),
        ]);

        $user = User::factory()->create();
        $plan = Plan::create([
            'name' => 'Test Plan',
            'slug' => 'test-plan',
            'price' => 100,
            'is_active' => true
        ]);

        $response = $this->actingAs($user)->postJson(route('payment.intent'), [
            'plan_id' => $plan->id,
            'app_name' => 'My_Test_App',
            'subdomain' => 'test-subdomain',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'client_secret' => 'test_secret',
                'payment_id' => 'pay_123'
            ]);

        $this->assertDatabaseHas('orders', [
            'user_id' => $user->id,
            'plan_id' => $plan->id,
            'status' => 'pending',
            'amount' => 100
        ]);
    }

    public function test_webhook_triggers_provisioning()
    {
        Queue::fake();

        $user = User::factory()->create();
        $plan = Plan::create([
            'name' => 'Test Plan',
            'slug' => 'test-plan',
            'price' => 100,
            'is_active' => true
        ]);

        $order = Order::create([
            'user_id' => $user->id,
            'plan_id' => $plan->id,
            'plan_name' => $plan->name,
            'amount' => $plan->price,
            'status' => 'pending',
            'admin_notes' => json_encode(['app_name' => 'Test_App', 'subdomain' => 'test'])
        ]);

        $payload = [
            'event_type' => 'payment_succeeded',
            'content' => [
                'object' => [
                    'order_id' => 'asero_order_' . $order->id,
                    'status' => 'succeeded'
                ]
            ]
        ];

        $jsonPayload = json_encode($payload);
        $secret = config('services.hyperswitch.webhook_secret');
        $signature = hash_hmac('sha512', $jsonPayload, $secret);

        $response = $this->postJson('/api/webhooks/hyperswitch-payments', $payload, [
            'x-webhook-signature-512' => $signature
        ]);

        $response->assertStatus(200)
            ->assertJson(['status' => 'provisioning_pipeline_engaged']);

        $this->assertDatabaseHas('orders', [
            'id' => $order->id,
            'status' => 'approved'
        ]);

        Queue::assertPushed(ProvisionInstanceJob::class);
    }

    public function test_webhook_fails_with_invalid_signature()
    {
        $payload = ['foo' => 'bar'];
        $response = $this->postJson('/api/webhooks/hyperswitch-payments', $payload, [
            'x-webhook-signature-512' => 'invalid-sig'
        ]);

        $response->assertStatus(401)
            ->assertJson(['error' => 'Invalid signature.']);
    }

    public function test_webhook_fails_without_signature()
    {
        $payload = ['foo' => 'bar'];
        $response = $this->postJson('/api/webhooks/hyperswitch-payments', $payload);

        $response->assertStatus(401)
            ->assertJson(['error' => 'Missing signature header.']);
    }
}
