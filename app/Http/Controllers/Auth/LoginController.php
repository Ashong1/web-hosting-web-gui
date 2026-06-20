<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use Inertia\Inertia;

class LoginController extends Controller
{
    public function create()
    {
        return Inertia::render('Auth/Login');
    }

    public function store(Request $request)
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        $throttleKey = Str::lower($request->input('email')) . '|' . $request->ip();
        $lockoutKey = 'login_lockout:' . $throttleKey;
        $attemptsKey = 'login_attempts:' . $throttleKey;
        $tierKey = 'login_tier:' . $throttleKey;

        // 1. Check if currently locked out
        if (Cache::has($lockoutKey)) {
            $expiresAt = Cache::get($lockoutKey);
            if (now()->timestamp < $expiresAt) {
                $seconds = $expiresAt - now()->timestamp;
                return back()->withErrors([
                    'email' => "Security protocol engaged. Too many failed attempts. Please try again in {$seconds} seconds.",
                ])->onlyInput('email');
            } else {
                // Lockout expired, clear it and reset attempts for a fresh batch of 4
                Cache::forget($lockoutKey);
                Cache::forget($attemptsKey);
            }
        }

        // 2. Attempt Authentication
        if (Auth::attempt($credentials, $request->boolean('remember'))) {
            // Success: clear all throttle keys
            Cache::forget($lockoutKey);
            Cache::forget($attemptsKey);
            Cache::forget($tierKey);
            
            $request->session()->regenerate();

            if ($request->user()->hasAdminRole()) {
                return redirect()->intended('/admin/dashboard');
            }

            return redirect()->intended('/dashboard');
        }

        // 3. Handle Failed Attempt
        $attempts = Cache::get($attemptsKey, 0) + 1;
        Cache::put($attemptsKey, $attempts, 3600); // Accumulate attempts for up to 1 hour

        if ($attempts >= 4) {
            // Trigger Lockout
            $tier = Cache::get($tierKey, 0) + 1;
            Cache::put($tierKey, $tier, 86400); // Remember lockout tier for 24 hours
            
            // Calculate penalty: 30s, 60s, 120s, 240s...
            $decaySeconds = 30 * pow(2, $tier - 1);
            Cache::put($lockoutKey, now()->timestamp + $decaySeconds, $decaySeconds + 10);
            
            return back()->withErrors([
                'email' => "Authentication failed 4 times. System locked for {$decaySeconds} seconds.",
            ])->onlyInput('email');
        }

        // Normal failure
        $remaining = 4 - $attempts;
        return back()->withErrors([
            'email' => "The provided credentials do not match our records. Attempts remaining: {$remaining}",
        ])->onlyInput('email');
    }

    public function destroy(Request $request)
    {
        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}

