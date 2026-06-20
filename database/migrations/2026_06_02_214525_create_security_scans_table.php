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
        Schema::create('security_scans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('instance_id')->constrained()->onDelete('cascade');
            $table->string('type'); // malware, integrity, network
            $table->string('status')->default('pending'); // pending, scanning, completed, failed
            $table->json('result')->nullable();
            $table->timestamp('scanned_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('security_scans');
    }
};
