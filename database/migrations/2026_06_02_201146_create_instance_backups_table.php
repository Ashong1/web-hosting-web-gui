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
        Schema::create('instance_backups', function (Blueprint $table) {
            $table->id();
            $table->foreignId('instance_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->string('backup_id')->unique(); // ID from Dokploy or storage
            $table->string('storage_disk')->default('s3');
            $table->string('status')->default('completed'); // pending, completed, failed
            $table->unsignedBigInteger('size_bytes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('instance_backups');
    }
};
