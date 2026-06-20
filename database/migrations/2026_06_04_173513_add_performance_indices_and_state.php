<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('instances', function (Blueprint $table) {
            $table->json('provisioning_progress')->nullable()->after('credentials');
            
            // Performance Indices
            $table->index('dokploy_service_id');
            $table->index('dokploy_project_id');
            $table->index('webhook_secret');
        });

        Schema::table('audit_logs', function (Blueprint $table) {
            $table->index('event');
            $table->index('user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('instances', function (Blueprint $table) {
            $table->dropColumn('provisioning_progress');
            $table->dropIndex(['dokploy_service_id']);
            $table->dropIndex(['dokploy_project_id']);
            $table->dropIndex(['webhook_secret']);
        });

        Schema::table('audit_logs', function (Blueprint $table) {
            $table->dropIndex(['event']);
            $table->dropIndex(['user_id']);
        });
    }
};
