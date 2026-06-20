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
            $table->string('repository_branch')->default('main')->after('repository_url');
            $table->string('build_command')->nullable()->after('repository_branch');
            $table->string('install_command')->nullable()->after('build_command');
            $table->text('env_vars')->nullable()->after('install_command'); // Encrypted storage
            $table->string('deployment_status')->default('pending')->after('env_vars'); // pending, deploying, live, failed
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('instances', function (Blueprint $table) {
            $table->dropColumn(['repository_branch', 'build_command', 'install_command', 'env_vars', 'deployment_status']);
        });
    }
};
