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
        Schema::create('reseller_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->onDelete('cascade');
            $table->string('brand_name')->nullable();
            $table->string('logo_path')->nullable();
            $table->string('custom_domain')->nullable()->unique();
            $table->string('support_email')->nullable();
            $table->string('nameserver_1')->nullable();
            $table->string('nameserver_2')->nullable();
            $table->json('colors')->nullable(); // primary, secondary
            $table->boolean('is_active')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reseller_settings');
    }
};
