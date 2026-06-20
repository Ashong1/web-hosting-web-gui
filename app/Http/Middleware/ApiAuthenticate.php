<?php

namespace App\Http\Middleware;

use App\Models\ApiKey;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ApiAuthenticate
{
    public function handle(Request $request, Closure $next): Response
    {
        $key = $request->header('X-Asero-Key');

        if (!$key) {
            // Fallback for internal dashboard calls (Session Auth)
            if (auth('web')->check()) {
                return $next($request);
            }
            return response()->json(['error' => 'No API key provided. Protocol rejected.'], 401);
        }

        $apiKey = ApiKey::where('key', hash('sha256', $key))->first();

        if (!$apiKey) {
            return response()->json(['error' => 'Invalid or expired API key. Authentication failure.'], 401);
        }

        $apiKey->update(['last_used_at' => now()]);

        // Authenticate the user for the request duration
        auth()->login($apiKey->user);

        return $next($request);
    }
}
