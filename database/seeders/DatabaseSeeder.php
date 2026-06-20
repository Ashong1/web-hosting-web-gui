<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Plan;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        Plan::whereNotIn('slug', ['student-dev', 'freelancer-startup', 'manila-edge'])->delete();

        User::updateOrCreate(
            ['email' => 'asherlimbo@gmail.com'],
            [
                'name' => 'Admin User',
                'password' => Hash::make('AseroAdmin2026!'),
                'role' => 'root',
            ]
        );

        if (app()->environment('local', 'testing')) {
            User::updateOrCreate(
                ['email' => '0323-3659@lspu.edu.ph'],
                [
                    'name' => 'Test Client',
                    'password' => Hash::make('password'),
                    'role' => 'client',
                ]
            );
        }

        Plan::updateOrCreate(
            ['slug' => 'student-dev'],
            [
                'name' => 'Student & Developer',
                'description' => 'Undeniably the cheapest server instance. Ideal for IT students, school projects, and simple sites.',
                'price' => 79,
                'image' => 'wordpress:latest',
                'features' => ['1 CPU Core', '512 MB Memory', '5 GB Storage', 'Free Subdomain', 'Private Server Space'],
                'resource_limits' => ['memory' => 512, 'cpu' => 1, 'storage' => 5],
            ]
        );

        Plan::updateOrCreate(
            ['slug' => 'freelancer-startup'],
            [
                'name' => 'Freelancer & Startup',
                'description' => 'Guaranteed resources for business apps, WordPress, or online shops.',
                'price' => 149,
                'image' => 'wordpress:latest',
                'features' => ['1 CPU Core', '1 GB Memory', '15 GB Storage', '1 Database Included', 'Add Custom Domain'],
                'resource_limits' => ['memory' => 1024, 'cpu' => 1, 'storage' => 15],
            ]
        );

        Plan::updateOrCreate(
            ['slug' => 'manila-edge'],
            [
                'name' => 'Manila Edge',
                'description' => 'High-performance server with the fastest speeds. Perfect for active production sites.',
                'price' => 349,
                'image' => 'wordpress:latest',
                'features' => ['2 CPU Cores', '2 GB Memory', '30 GB Storage', 'Unlimited Databases', 'Top Speed Priority'],
                'resource_limits' => ['memory' => 2048, 'cpu' => 2, 'storage' => 30],
            ]
        );
    }
}
