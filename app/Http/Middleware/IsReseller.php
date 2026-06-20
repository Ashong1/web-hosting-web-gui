<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class IsReseller
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (!$request->user() || !$request->user()->is_reseller) {
            if ($request->expectsJson()) {
                return response()->json(['message' => 'Unauthorized. Reseller access required.'], 403);
            }
            return redirect()->route('dashboard')->with('error', 'Access denied. You must be an authorized reseller.');
        }

        return $next($request);
    }
}
