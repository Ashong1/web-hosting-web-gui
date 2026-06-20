<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        // CRITICAL SAFETY SHIELD: Prevent wiping production database
        if (config('database.default') !== 'sqlite' && app()->environment('production')) {
            throw new \Exception("CRITICAL SAFETY BREACH: Test suite is attempting to run against a NON-SQLITE database in a PRODUCTION environment. Aborting to prevent data loss.");
        }
    }
}
