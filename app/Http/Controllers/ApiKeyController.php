<?php

namespace App\Http\Controllers;

use App\Models\ApiKey;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class ApiKeyController extends Controller
{
    public function index(Request $request)
    {
        return Inertia::render('Developer/Index', [
            'apiKeys' => $request->user()->apiKeys()->latest()->paginate(10)
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $key = 'asero_' . Str::random(40);

        $apiKey = $request->user()->apiKeys()->create([
            'name' => $request->name,
            'key' => hash('sha256', $key),
        ]);

        AuditLog::log('api_key.create', $apiKey);

        return back()->with('flash', [
            'new_key' => $key,
            'message' => 'API Key created successfully. Store it safely, as it won\'t be shown again.'
        ]);
    }

    public function destroy(ApiKey $apiKey)
    {
        if ($apiKey->user_id !== auth()->id()) {
            abort(403);
        }

        AuditLog::log('api_key.revoke', $apiKey);

        $apiKey->delete();

        return back()->with('message', 'API Key revoked.');
    }
}
