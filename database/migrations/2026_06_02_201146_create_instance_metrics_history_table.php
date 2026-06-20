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
        Schema::create('instance_metrics_history', function (Blueprint $table) {
            $table->id();
            $table->foreignId('instance_id')->constrained()->onDelete('cascade');
            $table->float('cpu_usage');
            $table->float('memory_usage');
            $table->unsignedBigInteger('memory_limit')->nullable();
            $table->timestamp('recorded_at');
            $table->index(['instance_id', 'recorded_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('instance_metrics_history');
    }
};
