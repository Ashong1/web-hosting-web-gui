<?php

if (!function_exists('safe_broadcast')) {
    /**
     * Broadcast an event safely, catching any connection errors.
     *
     * @param mixed $event
     * @return void
     */
    function safe_broadcast($event)
    {
        try {
            broadcast($event);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::warning("Broadcasting failed: " . $e->getMessage());
        }
    }
}

if (!function_exists('safe_event')) {
    /**
     * Dispatch an event safely, catching any broadcasting connection errors.
     *
     * @param mixed $event
     * @return void
     */
    function safe_event($event)
    {
        try {
            event($event);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::warning("Event dispatch failed (Broadcasting error): " . $e->getMessage());
        }
    }
}
