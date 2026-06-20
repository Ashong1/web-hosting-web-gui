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
        Schema::table('reseller_settings', function (Blueprint $blueprint) {
            $blueprint->string('gcash_qr_path')->nullable()->after('logo_path');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('reseller_settings', function (Blueprint $blueprint) {
            $blueprint->dropColumn('gcash_qr_path');
        });
    }
};
