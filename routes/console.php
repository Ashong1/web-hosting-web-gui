<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

\Illuminate\Support\Facades\Schedule::command('orders:terminate-expired')->hourly();
\Illuminate\Support\Facades\Schedule::command('asero:auto-renew')->hourly();
\Illuminate\Support\Facades\Schedule::command('asero:watcher')->everyMinute();
\Illuminate\Support\Facades\Schedule::command('asero:notify-at-risk')->dailyAt('09:00');
\Illuminate\Support\Facades\Schedule::command('asero:automate-backups')->dailyAt('02:00');
