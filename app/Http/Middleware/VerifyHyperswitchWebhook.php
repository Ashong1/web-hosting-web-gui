<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Log;

class VerifyHyperswitchWebhook
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $secret = config('services.hyperswitch.webhook_secret');
        
        if (!$secret) {
            Log::error('Hyperswitch Webhook Secret not configured.');
            return response()->json(['error' => 'Webhook security misconfigured.'], 500);
        }

        $signature = $request->header('x-webhook-signature-512');
        $algorithm = 'sha512';

        if (!$signature) {
            $signature = $request->header('x-webhook-signature-256');
            $algorithm = 'sha256';
        }

        if (!$signature) {
            Log::warning('Hyperswitch Webhook missing signature header.');
            return response()->json(['error' => 'Missing signature header.'], 401);
        }

        $payload = $request->getContent();
        $computedSignature = hash_hmac($algorithm, $payload, $secret);

        if (!hash_equals($computedSignature, $signature)) {
            Log::warning('Hyperswitch Webhook signature mismatch.', [
                'computed' => $computedSignature,
                'received' => $signature
            ]);
            return response()->json(['error' => 'Invalid signature.'], 401);
        }

        return $next($request);
    }
}
