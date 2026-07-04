<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Crypt;

return new class extends Migration
{
    public function up(): void
    {
        // Encrypt existing plain text api_keys in the nodes table
        $nodes = DB::table('nodes')->get();
        foreach ($nodes as $node) {
            if ($node->api_key && !str_starts_with($node->api_key, 'eyJpdiI6')) {
                // If it is not already encrypted (encrypted values in Laravel start with a base64 json format e.g. eyJpdiI6)
                DB::table('nodes')
                    ->where('id', $node->id)
                    ->update([
                        'api_key' => Crypt::encryptString($node->api_key)
                    ]);
            }
        }
    }

    public function down(): void
    {
        // Decrypt the api_keys back to plain text
        $nodes = DB::table('nodes')->get();
        foreach ($nodes as $node) {
            try {
                if ($node->api_key) {
                    DB::table('nodes')
                        ->where('id', $node->id)
                        ->update([
                            'api_key' => Crypt::decryptString($node->api_key)
                        ]);
                }
            } catch (\Exception $e) {
                // Ignore if it was not encrypted
            }
        }
    }
};
