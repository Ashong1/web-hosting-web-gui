<?php

use App\Http\Controllers\WebhookController;
use App\Http\Controllers\Api\NodeController;
use Illuminate\Support\Facades\Route;

Route::post('/webhooks/hyperswitch-payments', [WebhookController::class, 'processPaymentCallback'])
    ->middleware(\App\Http\Middleware\VerifyHyperswitchWebhook::class);

Route::post('/webhooks/deploy/{instance}', [WebhookController::class, 'deployWebhook'])->name('webhooks.deploy');
Route::post('/webhooks/dokploy', [WebhookController::class, 'handleDokployCallback']);

// AseroTech Cloud Public API v1
Route::prefix('v1')->middleware(\App\Http\Middleware\ApiAuthenticate::class)->group(function () {
    Route::get('/nodes', [NodeController::class, 'index']);
    Route::get('/nodes/{instance}', [NodeController::class, 'show']);
    Route::post('/nodes/{instance}/deploy', [NodeController::class, 'deploy']);
    Route::post('/nodes/{instance}/action/{action}', [NodeController::class, 'action']);
});
