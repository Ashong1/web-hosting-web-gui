<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Gate;
use App\Models\User;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        if (str_starts_with(config('app.url'), 'https://')) {
            \Illuminate\Support\Facades\URL::forceScheme('https');
        }

        if (app()->isProduction()) {
            \Illuminate\Support\Facades\DB::prohibitDestructiveCommands();
        }

        Gate::define('admin', function (User $user) {
            return $user->hasAdminRole();
        });

        Gate::define('root', function (User $user) {
            return $user->isRoot();
        });
    }
}
