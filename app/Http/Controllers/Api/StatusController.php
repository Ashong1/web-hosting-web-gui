<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Instance;
use App\Services\UptimeKumaService;
use Illuminate\Http\Request;

class StatusController extends Controller
{
    public function index(UptimeKumaService $uptimeKuma)
    {
        // Admin only check - Explicitly checking web guard for session fallback
        $user = auth('web')->user() ?? auth()->user();

        if (!$user || !$user->hasAdminRole()) {
            return response()->json(['error' => 'Unauthorized Access Protocol.'], 403);
        }

        $monitors = $uptimeKuma->getAllMonitors();

        return response()->json([
            'monitors' => $monitors
        ]);
    }

    public function show(Instance $instance, UptimeKumaService $uptimeKuma)
    {
        // Ensure user owns the instance
        if ($instance->user_id !== auth()->id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $status = $uptimeKuma->getMonitorStatus($instance->public_url);

        if (!$status) {
            // Default response if monitor hasn't propagated yet
            return response()->json([
                'status' => 'pending',
                'uptime_24h' => '100.00',
                'latency' => 0,
                'history' => array_fill(0, 48, 1)
            ]);
        }

        return response()->json($status);
    }
}
