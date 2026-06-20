<?php

namespace App\Console\Commands;

use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use App\Models\InstanceMetricsHistory;

#[Signature('asero:prune-metrics {--days=30 : The number of days of history to keep}')]
#[Description('Clean up old node metrics history to prevent database bloat.')]
class PruneMetrics extends Command
{
    /**
     * Execute the console command.
     */
    public function handle()
    {
        $days = (int) $this->option('days');
        $cutoff = now()->subDays($days);

        $this->info("Pruning infrastructure metrics history older than {$days} days ({$cutoff->toDateString()})...");

        $count = InstanceMetricsHistory::where('recorded_at', '<', $cutoff)->delete();

        $this->info("Pruning complete. Removed {$count} stale metric entries.");
    }
}
