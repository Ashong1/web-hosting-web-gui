<?php

namespace App\Events;

use App\Models\Instance;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NodeStatusUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $instance;
    public $status;

    public function __construct(Instance $instance, string $status)
    {
        $this->instance = $instance;
        $this->status = $status;
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel("App.Models.User.{$this->instance->user_id}"),
        ];
    }

    public function broadcastWith(): array
    {
        return [
            'id' => $this->instance->id,
            'status' => $this->status,
            'message' => "Node '{$this->instance->name}' is now {$this->status}.",
        ];
    }
}
