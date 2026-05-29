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
        Schema::create('transition_evidences', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained('projects')->onDelete('cascade');
            $table->foreignId('state_field_id')->constrained('project_state_fields')->onDelete('cascade');
            $table->string('file_path');
            $table->string('original_filename');
            $table->string('temporary_token');
            $table->timestamps();

            $table->index(['project_id', 'temporary_token']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transition_evidences');
    }
};
