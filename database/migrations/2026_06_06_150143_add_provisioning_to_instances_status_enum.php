<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // PostgreSQL specific: We need to drop the existing check constraint and add the new values
        // Laravel's enum on PG usually creates a check constraint named "table_column_check"
        if (DB::getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE instances DROP CONSTRAINT IF EXISTS instances_status_check');
            DB::statement("ALTER TABLE instances ADD CONSTRAINT instances_status_check CHECK (status IN ('active', 'suspended', 'deleted', 'provisioning', 'failed'))");
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (DB::getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE instances DROP CONSTRAINT IF EXISTS instances_status_check');
            DB::statement("ALTER TABLE instances ADD CONSTRAINT instances_status_check CHECK (status IN ('active', 'suspended', 'deleted'))");
        }
    }
};
