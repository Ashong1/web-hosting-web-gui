<?php

namespace Tests\Feature;

use App\Models\Instance;
use App\Models\InstanceBackup;
use App\Models\Order;
use App\Models\User;
use App\Services\DokployService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InstanceBackupsTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_toggle_auto_backups()
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
            'name' => 'My App',
            'status' => 'active',
            'auto_backups_enabled' => true,
            'public_url' => 'myapp.aserotech.com'
        ]);

        $response = $this->actingAs($user)->post("/instances/{$instance->id}/backups/toggle-auto");

        $response->assertStatus(302);
        $instance->refresh();
        $this->assertFalse($instance->auto_backups_enabled);
    }

    public function test_user_can_delete_backup()
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
            'name' => 'My App',
            'dokploy_service_id' => 'svc_123',
            'status' => 'active',
            'public_url' => 'myapp.aserotech.com'
        ]);

        $backup = InstanceBackup::create([
            'instance_id' => $instance->id,
            'name' => 'Manual-Backup',
            'backup_id' => 'bk_123',
            'status' => 'completed',
            'size_bytes' => 1024
        ]);

        $this->mock(DokployService::class, function ($mock) {
            $mock->shouldReceive('setNode')->andReturnSelf();
            $mock->shouldReceive('deleteBackup')
                ->once()
                ->with('svc_123', 'bk_123')
                ->andReturn(true);
        });

        $response = $this->actingAs($user)->delete("/instances/{$instance->id}/backups/{$backup->id}");

        $response->assertStatus(302);
        $this->assertDatabaseMissing('instance_backups', [
            'id' => $backup->id
        ]);
    }
}
