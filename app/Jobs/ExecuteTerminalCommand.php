<?php

namespace App\Jobs;

use App\Events\TerminalOutput;
use App\Models\Instance;
use App\Services\DokployService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ExecuteTerminalCommand implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $instance;
    protected $command;

    /**
     * Create a new job instance.
     */
    public function __construct(Instance $instance, string $command)
    {
        $this->instance = $instance;
        $this->command = $command;
    }

    /**
     * Execute the job.
     */
    public function handle(DokployService $dokploy): void
    {
        try {
            if ($this->instance->node) {
                $dokploy->setNode($this->instance->node);
            }

            // Simulate partial start message for better UX
            broadcast(new TerminalOutput($this->instance->id, "\x1b[1;30m[System] Dispatching command to node cluster...\x1b[0m\r\n"));

            $result = $dokploy->executeCommand($this->instance->dokploy_service_id, $this->command);
            
            $output = $result['output'] ?? "\r\n\x1b[1;33m[Notice] Command executed with no visual return.\x1b[0m\r\n";
            
            broadcast(new TerminalOutput($this->instance->id, $output));
            
            // Final signal to restore prompt
            broadcast(new TerminalOutput($this->instance->id, "\r\n$ "));

        } catch (\Exception $e) {
            Log::error("Terminal Execution Failed: " . $e->getMessage());
            broadcast(new TerminalOutput($this->instance->id, "\r\n\x1b[1;31m[Error] Infrastructure multiplexer failed to execute command.\x1b[0m\r\n"));
        }
    }
}
