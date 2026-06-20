<?php

namespace App\Console\Commands;

use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use App\Models\User;
use App\Models\Instance;
use App\Notifications\LowBalanceAlert;
use App\Notifications\RenewalReminder;

#[Signature('asero:notify-at-risk')]
#[Description('Scan for accounts with low credits or instances nearing expiration and trigger alerts.')]
class NotifyAtRiskAccounts extends Command
{
    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info("Scanning Cloud Core for at-risk accounts...");

        // 1. Alert for Low Balances (Threshold: ₱100)
        $this->alertLowBalances();

        // 2. Alert for Upcoming Renewals (Within 7, 3, and 1 days)
        $this->alertUpcomingRenewals();

        $this->info("Alert sequence complete.");
    }

    private function alertLowBalances()
    {
        $threshold = 100;
        $atRiskUsers = User::where('credits', '<', $threshold)
            ->where('credits', '>', 0)
            ->whereHas('instances', function($query) {
                $query->where('status', 'active');
            })
            ->get();

        $this->comment("Found " . $atRiskUsers->count() . " users with low balances.");

        foreach ($atRiskUsers as $user) {
            // Avoid spamming: Only notify once every 48 hours
            $cacheKey = 'low_balance_notified_' . $user->id;
            if (!\Cache::has($cacheKey)) {
                $user->notify(new LowBalanceAlert($user->credits));
                \Cache::put($cacheKey, true, now()->addHours(48));
                $this->info(" - Notified user #{$user->id} of low balance (₱{$user->credits})");
            }
        }
    }

    private function alertUpcomingRenewals()
    {
        $this->comment("Scanning for expiring instances...");

        $targetDays = [7, 3, 1];
        
        foreach ($targetDays as $days) {
            $cutoffStart = now()->addDays($days)->startOfDay();
            $cutoffEnd = now()->addDays($days)->endOfDay();

            $expiringInstances = Instance::whereHas('order', function($query) use ($cutoffStart, $cutoffEnd) {
                $query->whereBetween('expires_at', [$cutoffStart, $cutoffEnd]);
            })->where('status', 'active')->get();

            $this->info(" - Found " . $expiringInstances->count() . " nodes expiring in exactly {$days} days.");

            foreach ($expiringInstances as $instance) {
                $instance->user->notify(new RenewalReminder($instance, $days));
                $this->info("   * Notified owner of '{$instance->name}' (Expiring in {$days}d)");
            }
        }
    }
}
