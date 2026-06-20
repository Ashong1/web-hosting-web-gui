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
        Schema::table('users', function (Blueprint $table) {
            $table->decimal('credits', 12, 2)->default(0.00)->after('is_suspended');
            $table->string('referral_code')->unique()->nullable()->after('credits');
            $table->foreignId('referred_by')->nullable()->constrained('users')->onDelete('set null')->after('referral_code');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['credits', 'referral_code', 'referred_by']);
        });
    }
};
