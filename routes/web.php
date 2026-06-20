<?php

use App\Http\Controllers\OrderController;
use App\Http\Controllers\InstanceController;
use App\Http\Controllers\BillingController;
use App\Http\Controllers\ApiKeyController;
use App\Http\Controllers\TicketController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\Admin\FleetController;
use App\Http\Controllers\Admin\ClientController;
use App\Http\Controllers\Admin\PlanController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\ResellerController;
use App\Http\Controllers\ReferralController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'plans' => \App\Models\Plan::where('is_active', true)->orderBy('price', 'asc')->get(),
    ]);
});

Route::get('/status', [\App\Http\Controllers\StatusPageController::class, 'index'])->name('public.status');

Route::get('/terms', function () {
    return Inertia::render('Legal/TermsOfService');
})->name('legal.terms');

Route::get('/privacy', function () {
    return Inertia::render('Legal/PrivacyPolicy');
})->name('legal.privacy');

Route::get('/acceptable-use', function () {
    return Inertia::render('Legal/AcceptableUsePolicy');
})->name('legal.aup');

Route::get('/refund-policy', function () {
    return Inertia::render('Legal/RefundPolicy');
})->name('legal.refund');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', [InstanceController::class, 'index'])->name('dashboard');
    Route::get('/instances/{instance}', [InstanceController::class, 'show'])->name('instances.show');
    Route::post('/instances/{instance}/action/{action}', [InstanceController::class, 'action'])->name('instances.action');

    // New Professional Deployment Flow
    Route::get('/deploy/new', [\App\Http\Controllers\DeploymentController::class, 'create'])->name('deploy.new');
    Route::post('/deploy/new', [\App\Http\Controllers\DeploymentController::class, 'store'])->name('deploy.store');

    Route::get('/orders', [OrderController::class, 'index'])->name('orders.index');
    Route::post('/orders', [OrderController::class, 'store'])->name('orders.store');

    Route::get('/billing', [BillingController::class, 'index'])->name('billing.index');
    Route::get('/billing/{order}/invoice', [BillingController::class, 'downloadInvoice'])->name('billing.invoice');
    Route::post('/payment/intent', [\App\Http\Controllers\PaymentController::class, 'createPaymentIntent'])->name('payment.intent');
    Route::post('/payment/topup-intent', [\App\Http\Controllers\PaymentController::class, 'createTopupIntent'])->name('payment.topup-intent');
    Route::post('/payment/manual-topup', [\App\Http\Controllers\PaymentController::class, 'storeManualTopup'])->name('payment.manual-topup');
    Route::get('/instances/{instance}/logs', [InstanceController::class, 'logs'])->name('instances.logs');
    Route::get('/instances/{instance}/metrics', [InstanceController::class, 'metrics'])->name('instances.metrics');
    Route::get('/instances/{instance}/metrics-history', [InstanceController::class, 'metricsHistory'])->name('instances.metrics_history');
    Route::get('/instances/{instance}/env-vars', [InstanceController::class, 'envVars'])->name('instances.env_vars');
    Route::post('/instances/{instance}/env', [InstanceController::class, 'updateEnvVars'])->name('instances.env_vars.update');
    Route::get('/instances/{instance}/backups', [InstanceController::class, 'backups'])->name('instances.backups');
    Route::post('/instances/{instance}/backups', [InstanceController::class, 'createBackup'])->name('instances.backups.create');
    Route::post('/instances/{instance}/backups/toggle-auto', [InstanceController::class, 'toggleAutoBackups'])->name('instances.backups.toggle_auto');
    Route::post('/instances/{instance}/backups/{backup}/restore', [InstanceController::class, 'restoreBackup'])->name('instances.backups.restore');
    Route::delete('/instances/{instance}/backups/{backup}', [InstanceController::class, 'destroyBackup'])->name('instances.backups.destroy');
    Route::post('/instances/{instance}/resources', [InstanceController::class, 'updateResources'])->name('instances.resources.update');
    Route::post('/instances/{instance}/terminal/input', [InstanceController::class, 'terminalInput'])->name('instances.terminal.input');
    Route::get('/instances/{instance}/deployments', [InstanceController::class, 'deployments'])->name('instances.deployments');
    Route::get('/instances/{instance}/build-logs', [InstanceController::class, 'buildLogs'])->name('instances.build_logs');
    Route::post('/instances/{instance}/rollback/{deployment}', [InstanceController::class, 'rollback'])->name('instances.rollback');

    Route::get('/profile', [\App\Http\Controllers\ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [\App\Http\Controllers\ProfileController::class, 'update'])->name('profile.update');
    Route::get('/profile/export', [\App\Http\Controllers\ProfileController::class, 'export'])->name('profile.export');
    Route::post('/profile/destroy', [\App\Http\Controllers\ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::put('/password', [\App\Http\Controllers\ProfileController::class, 'updatePassword'])->name('password.update');

    // Developer Center
    Route::get('/developer', [ApiKeyController::class, 'index'])->name('developer.index');
    Route::post('/developer/keys', [ApiKeyController::class, 'store'])->name('developer.keys.store');
    Route::delete('/developer/keys/{apiKey}', [ApiKeyController::class, 'destroy'])->name('developer.keys.destroy');

    Route::get('/referrals', [ReferralController::class, 'index'])->name('referrals.index');

    // White-Labeling (Reseller)
    Route::get('/branding', [\App\Http\Controllers\ResellerController::class, 'index'])->name('reseller.index');
    Route::post('/branding', [\App\Http\Controllers\ResellerController::class, 'update'])->name('reseller.update');

    Route::prefix('reseller')->name('reseller.')->group(function () {
        Route::get('/dashboard', [\App\Http\Controllers\Reseller\DashboardController::class, 'index'])->name('dashboard');
        Route::get('/clients', [\App\Http\Controllers\Reseller\ClientController::class, 'index'])->name('clients.index');
        Route::get('/plans', [\App\Http\Controllers\Reseller\PlanController::class, 'index'])->name('plans.index');
        Route::post('/plans', [\App\Http\Controllers\Reseller\PlanController::class, 'update'])->name('plans.update');
        Route::post('/orders/{order}/approve', [\App\Http\Controllers\Reseller\DashboardController::class, 'approveOrder'])->name('orders.approve');
        Route::post('/orders/{order}/reject', [\App\Http\Controllers\Reseller\DashboardController::class, 'rejectOrder'])->name('orders.reject');
    });

    Route::get('/security-activity', function () {
        return Inertia::render('Profile/Security/SecurityActivity', [
            'logs' => \App\Models\AuditLog::where('user_id', auth()->id())->latest()->paginate(15)
        ]);
    })->name('security.activity');

    // Support System
    Route::get('/support', [TicketController::class, 'index'])->name('support.index');
    Route::post('/support', [TicketController::class, 'store'])->name('support.store');
    Route::get('/support/{ticket}', [TicketController::class, 'show'])->name('support.show');
    Route::post('/support/{ticket}/reply', [TicketController::class, 'reply'])->name('support.reply');
    Route::post('/support/{ticket}/close', [TicketController::class, 'close'])->name('support.close');

    // Notifications
    Route::get('/api/notifications', [NotificationController::class, 'index']);
    Route::post('/api/notifications/mark-as-read', [NotificationController::class, 'markAsRead']);
    Route::delete('/api/notifications/{id}', [NotificationController::class, 'destroy']);

    // Status Hub (Internal access via Web Session)
    Route::get('/api/v1/status', [\App\Http\Controllers\Api\StatusController::class, 'index']);
    Route::get('/api/v1/nodes/{instance}/status', [\App\Http\Controllers\Api\StatusController::class, 'show']);
});

Route::middleware(['auth', 'can:admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/dashboard', [AdminDashboardController::class, 'index'])->name('dashboard');
    Route::get('/health', [\App\Http\Controllers\Admin\HealthController::class, 'index'])->name('health');
    Route::post('/orders/{order}/approve', [AdminDashboardController::class, 'approveOrder'])->name('orders.approve');
    Route::post('/orders/{order}/reject', [AdminDashboardController::class, 'rejectOrder'])->name('orders.reject');

    // Fleet Management
    Route::get('/fleet', [FleetController::class, 'index'])->name('fleet.index');
    Route::post('/fleet/{instance}/action/{action}', [FleetController::class, 'action'])->name('fleet.action');

    // Client Management
    Route::get('/clients', [ClientController::class, 'index'])->name('clients.index');
    Route::post('/clients/{user}/suspend', [ClientController::class, 'suspend'])->name('clients.suspend');

    // Plan Management
    Route::resource('plans', PlanController::class);

    // Finance Hub
    Route::get('/finance', [\App\Http\Controllers\Admin\FinanceController::class, 'index'])->name('finance.index');
    Route::post('/finance/grant/{user}', [\App\Http\Controllers\Admin\FinanceController::class, 'grantCredits'])->name('finance.grant');

    // Infrastructure Hub
    Route::get('/infrastructure', [\App\Http\Controllers\Admin\InfrastructureController::class, 'index'])->name('infrastructure.index');
    Route::get('/api/admin/host-metrics', [\App\Http\Controllers\Admin\InfrastructureController::class, 'getHostMetrics'])->name('infrastructure.metrics');

    // Security Control Center
    Route::get('/security', [\App\Http\Controllers\Admin\SecurityController::class, 'index'])->name('security.index');
    Route::post('/security/firewall', [\App\Http\Controllers\Admin\SecurityController::class, 'storeFirewallRule'])->name('security.firewall.store');
    Route::delete('/security/firewall/{rule}', [\App\Http\Controllers\Admin\SecurityController::class, 'destroyFirewallRule'])->name('security.firewall.destroy');
    Route::post('/security/scan/{instance}', [\App\Http\Controllers\Admin\SecurityController::class, 'triggerScan'])->name('security.scan.trigger');

    Route::get('/security-ledger', [\App\Http\Controllers\Admin\SecurityController::class, 'ledger'])->name('security.ledger');
});

require __DIR__.'/auth.php';
