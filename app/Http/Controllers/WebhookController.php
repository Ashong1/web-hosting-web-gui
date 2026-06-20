<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Order;
use App\Jobs\ProvisionInstanceJob;
use Illuminate\Support\Facades\Log;

class WebhookController extends Controller
{
    public function processPaymentCallback(Request $request)
    {
        $eventPayload = $request->all();

        // Verify the inbound event payload status
        if (isset($eventPayload['event_type']) && $eventPayload['event_type'] === 'payment_succeeded') {
            $paymentDetails = $eventPayload['content']['object'];
            
            // Extract the original tracking primary key ID
            $orderId = str_replace('asero_order_', '', $paymentDetails['order_id']);
            $order = Order::find($orderId);

            if ($order && $order->status === 'pending') {
                $metadata = json_decode($order->admin_notes, true);
                
                $status = \Illuminate\Support\Facades\DB::transaction(function () use ($order, $metadata, $paymentDetails, $orderId) {
                    // 1. Mark database status token as approved (payment cleared)
                    $order->update(['status' => 'approved']);

                    if (isset($metadata['type']) && $metadata['type'] === 'renewal') {
                        // Handle Renewal logic: extend expiry and link to new order
                        $instance = \App\Models\Instance::find($metadata['instance_id']);
                        if ($instance) {
                            $order->update([
                                'status' => 'fulfilled',
                                'expires_at' => now()->addDays(30),
                            ]);
                            $instance->update(['order_id' => $order->id]);

                            Log::info("Renewal completed for Instance ID: " . $instance->id);
                            return 'renewal_processed';
                        }
                    }

                    if (isset($metadata['type']) && $metadata['type'] === 'topup') {
                        $user = $order->user;
                        $amount = $metadata['amount'];

                        $user->increment('credits', $amount);
                        
                        $user->creditTransactions()->create([
                            'amount' => $amount,
                            'type' => 'deposit',
                            'description' => 'Credit top-up via GCash/Card',
                            'balance_after' => $user->credits,
                            'reference_id' => 'pay_' . $paymentDetails['id'],
                        ]);

                        $order->update(['status' => 'fulfilled']);

                        Log::info("Topup completed for User ID: " . $user->id);
                        return 'topup_processed';
                    }

                    // 2. Dispatch deployment job to the background queue immediately for new orders
                    ProvisionInstanceJob::dispatch($order);

                    Log::info("Payment verification cleared for Order ID: " . $orderId);
                    return 'provisioning_pipeline_engaged';
                });

                return response()->json(['status' => $status], 200);
            }
        }

        return response()->json(['status' => 'payload_ignored'], 200);
    }

    public function deployWebhook(Request $request, \App\Models\Instance $instance)
    {
        $signature = $request->header('X-Hub-Signature-256');
        $secret = $instance->webhook_secret;

        // 1. Signature Verification (GitHub Standard)
        if ($signature && $secret) {
            $payload = $request->getContent();
            $hash = 'sha256=' . hash_hmac('sha256', $payload, $secret);

            if (!hash_equals($hash, $signature)) {
                Log::warning("Git Webhook signature mismatch for Instance: {$instance->id}");
                return response()->json(['error' => 'Unauthorized signature'], 401);
            }
        }

        // 2. Branch Filtering
        $payload = $request->all();
        $ref = $payload['ref'] ?? null; // e.g., refs/heads/main
        $targetBranch = $instance->repository_branch ?? 'main';

        if ($ref && !str_ends_with($ref, '/' . $targetBranch)) {
            Log::info("Git Webhook ignored for branch: {$ref}. Target: {$targetBranch}");
            return response()->json(['status' => 'ignored_branch'], 200);
        }

        // 3. Trigger Deployment
        $dokploy = new \App\Services\DokployService($instance->node);
        $success = $dokploy->deploy($instance->dokploy_service_id);

        if ($success) {
            \App\Models\AuditLog::log('instance.git_webhook_deploy', $instance);
            return response()->json(['status' => 'deployment_synthesized'], 200);
        }

        return response()->json(['error' => 'Deployment trigger failed'], 500);
    }

    /**
     * Handle incoming status callbacks from Dokploy worker nodes
     */
    public function handleDokployCallback(Request $request)
    {
        $expectedSecret = config('services.dokploy.webhook_secret');
        if ($expectedSecret) {
            $providedSecret = $request->header('X-Dokploy-Signature') ?? $request->bearerToken();
            if ($providedSecret === null || !hash_equals((string) $expectedSecret, (string) $providedSecret)) {
                Log::warning("Dokploy callback failed signature validation.");
                return response()->json(['error' => 'Unauthorized signature'], 401);
            }
        }

        $payload = $request->all();
        $applicationId = $payload['applicationId'] ?? $payload['id'] ?? null;
        $status = $payload['status'] ?? null; // e.g., 'running', 'stopped', 'failed'

        if (!$applicationId) {
            return response()->json(['error' => 'Missing Application Identifier'], 400);
        }

        $instance = \App\Models\Instance::where('dokploy_service_id', $applicationId)->first();

        if (!$instance) {
            Log::warning("Dokploy callback received for unrecognized Application ID: " . $applicationId);
            return response()->json(['error' => 'Instance not found'], 404);
        }

        // Map Dokploy status to Asero status
        $deploymentStatus = 'live';
        if ($status === 'failed' || $status === 'error') $deploymentStatus = 'failed';
        if ($status === 'deploying') $deploymentStatus = 'deploying';

        // Cache the live container status to avoid constraint violations and synchronous DB operations
        \Illuminate\Support\Facades\Cache::put("instance.{$instance->id}.live_status", $status, now()->addDays(7));

        $dbUpdates = ['deployment_status' => $deploymentStatus];
        if ($status === 'failed' || $status === 'error') {
            $dbUpdates['status'] = 'failed';
        }
        $instance->update($dbUpdates);

        // Trigger Real-time UI updates
        event(new \App\Events\NodeStatusUpdated($instance, $status));
        
        $message = $deploymentStatus === 'live' 
            ? "Network Broadcast: {$instance->name} is now operational."
            : "Infrastructure Alert: {$instance->name} deployment sequence encountered an error.";

        broadcast(new \App\Events\SystemSignalBroadcast($instance->user, $message));
        
        \App\Models\AuditLog::log("instance.dokploy_callback", $instance, ['status' => $status]);

        return response()->json(['status' => 'synchronization_complete'], 200);
    }
}
