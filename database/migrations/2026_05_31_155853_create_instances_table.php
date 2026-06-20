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
        Schema::create('instances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('order_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->string('dokploy_project_id')->nullable();
            $table->string('dokploy_service_id')->nullable();
            $table->string('dokploy_database_id')->nullable();
            $table->string('public_url')->unique()->nullable();
            $table->enum('status', ['active', 'suspended', 'deleted'])->default('active');
            $table->json('credentials')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('instances');
    }
};
