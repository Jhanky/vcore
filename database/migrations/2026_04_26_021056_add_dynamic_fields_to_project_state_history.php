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
        Schema::table('project_state_history', function (Blueprint $table) {
            $table->json('field_values')->nullable()->after('notes');
            $table->json('files_data')->nullable()->after('field_values');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('project_state_history', function (Blueprint $table) {
            $table->dropColumn(['field_values', 'files_data']);
        });
    }
};
