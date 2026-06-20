<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Ticket;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SupportSystemTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutMiddleware([\Illuminate\Foundation\Http\Middleware\ValidateCsrfToken::class]);
    }

    public function test_user_can_access_support_index()
    {
        $user = User::factory()->create(['role' => 'client']);

        $response = $this->actingAs($user)->get(route('support.index'));

        $response->assertStatus(200);
    }

    public function test_user_can_create_ticket()
    {
        $this->withoutExceptionHandling();
        $user = User::factory()->create(['role' => 'client']);

        $response = $this->actingAs($user)->postJson(route('support.store'), [
            'subject' => 'Help needed',
            'priority' => 'high',
            'message' => 'I cannot access my instance.',
        ]);

        $this->assertDatabaseHas('tickets', [
            'user_id' => $user->id,
            'subject' => 'Help needed',
            'priority' => 'high',
            'status' => 'open',
        ]);

        $ticket = Ticket::first();
        $response->assertStatus(302);
        
        $this->assertDatabaseHas('ticket_messages', [
            'ticket_id' => $ticket->id,
            'user_id' => $user->id,
            'message' => 'I cannot access my instance.',
        ]);
    }

    public function test_user_can_reply_to_their_ticket()
    {
        $user = User::factory()->create(['role' => 'client']);
        $ticket = Ticket::factory()->create(['user_id' => $user->id]);

        $response = $this->actingAs($user)->postJson(route('support.reply', $ticket->id), [
            'message' => 'Any update?',
        ]);

        $response->assertStatus(302);
        $this->assertDatabaseHas('ticket_messages', [
            'ticket_id' => $ticket->id,
            'user_id' => $user->id,
            'message' => 'Any update?',
            'is_admin_reply' => false,
        ]);
    }

    public function test_user_cannot_view_others_ticket()
    {
        $user1 = User::factory()->create(['role' => 'client']);
        $user2 = User::factory()->create(['role' => 'client']);
        $ticket = Ticket::factory()->create(['user_id' => $user1->id]);

        $response = $this->actingAs($user2)->get(route('support.show', $ticket->id));

        $response->assertStatus(403);
    }

    public function test_admin_can_view_all_tickets()
    {
        $admin = User::factory()->create(['role' => 'root']);
        $user = User::factory()->create(['role' => 'client']);
        $ticket = Ticket::factory()->create(['user_id' => $user->id]);

        $response = $this->actingAs($admin)->get(route('support.index'));

        $response->assertStatus(200);
        $response->assertSee($ticket->subject);
    }

    public function test_admin_can_reply_to_ticket()
    {
        $admin = User::factory()->create(['role' => 'support']);
        $user = User::factory()->create(['role' => 'client']);
        $ticket = Ticket::factory()->create(['user_id' => $user->id]);

        $response = $this->actingAs($admin)->postJson(route('support.reply', $ticket->id), [
            'message' => 'We are looking into it.',
        ]);

        $response->assertStatus(302);
        $this->assertDatabaseHas('ticket_messages', [
            'ticket_id' => $ticket->id,
            'user_id' => $admin->id,
            'message' => 'We are looking into it.',
            'is_admin_reply' => true,
        ]);

        $this->assertEquals('in_progress', $ticket->fresh()->status);
    }
}
