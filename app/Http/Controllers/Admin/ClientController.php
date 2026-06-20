<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\User;
use App\Services\DokployService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;

class ClientController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Clients/Index', [
            'clients' => User::where('role', 'client')
                ->withCount('instances')
                ->latest()
                ->paginate(15)
        ]);
    }

    public function suspend(User $user, DokployService $dokploy)
    {
        if ($user->hasAdminRole()) {
            abort(403);
        }

        $user->update([
            'is_suspended' => !$user->is_suspended
        ]);

        $action = $user->is_suspended ? 'stop' : 'start';
        $status = $user->is_suspended ? 'suspended' : 'reactivated';

        // Stop/Start all instances
        foreach ($user->instances as $instance) {
            try {
                $dokploy->controlInstance($instance->dokploy_service_id, $action);
            } catch (\Exception $e) {
                Log::error("Failed to {$action} instance {$instance->id} during user suspension: " . $e->getMessage());
            }
        }
        
        AuditLog::log("admin.client_{$status}", $user);

        return back()->with('success', "Client {$status} and all their instances {$action}ped successfully.");
    }
}
