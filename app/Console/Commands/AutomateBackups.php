<?php

namespace App\Console\Commands;

use App\Models\Instance;
use App\Services\DokployService;
use App\Models\AuditLog;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class AutomateBackups extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'asero:automate-backups';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Orchestration Core: Executes scheduled node snapshots based on tier policies.';

    /**
     * Execute the console command.
     */
    public function handle(DokployService $dokploy)
    {
        $this->info("Engaging Automated Snapshot Protocol...");

        $nodes = \App\Models\Node::where('is_active', true)->get();

        foreach ($nodes as $node) {
            $this->comment(" -> Scanning Node: {$node->name}");
            $dokploy->setNode($node);
            
            $instances = $node->instances()
                ->with('order.plan')
                ->where('status', 'active')
                ->where('auto_backups_enabled', true)
                ->get();

            foreach ($instances as $instance) {
                $plan = $instance->order->plan;
                
                // 1. Check if tier allows scheduled backups
                if (!$plan || !$plan->is_backups_enabled) {
                    continue;
                }

                $this->warn("   * Node #{$instance->id}: Snapshot cycle initiated.");
                
                $name = "Auto-" . now()->format('Ymd-Hi');
                $backupData = $dokploy->createBackup($instance->dokploy_service_id, $name);

                if ($backupData) {
                    $instance->backups()->create([
                        'name' => $name,
                        'backup_id' => $backupData['id'],
                        'status' => 'completed',
                        'size_bytes' => $backupData['size'] ?? 0,
                    ]);

                    AuditLog::log('instance.backup.automated', $instance, ['backup_id' => $backupData['id']]);
                    $this->info("     [SUCCESS] Snapshot synthesized.");
                }

                // 2. Retention Policy Enforcement
                $this->enforceRetention($dokploy, $instance, $plan->max_backups);
            }
        }

        $this->info("Snapshot cycle complete.");
    }

    private function enforceRetention($dokploy, $instance, $maxCount)
    {
        $automatedBackups = $instance->backups()
            ->where('name', 'like', 'Auto-%')
            ->orderBy('created_at', 'desc')
            ->get();

        if ($automatedBackups->count() > $maxCount) {
            $toDelete = $automatedBackups->slice($maxCount);
            foreach ($toDelete as $old) {
                $dokploy->deleteBackup($instance->dokploy_service_id, $old->backup_id);
                $old->delete();
                $this->comment("     [PRUNE] Removed stale snapshot: {$old->name}");
            }
        }
    }
}
