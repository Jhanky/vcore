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
        Schema::create('project_state_fields', function (Blueprint $table) {
            $table->id();
            $table->foreignId('state_id')->constrained('project_states')->onDelete('cascade');
            $table->enum('field_type', ['text', 'file']);
            $table->string('field_name');
            $table->string('label');
            $table->boolean('is_required')->default(false);
            $table->integer('display_order')->default(0);
            $table->string('accepted_types')->nullable();
            $table->integer('max_size_kb')->nullable();
            $table->timestamps();

            $table->unique(['state_id', 'field_name']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('project_state_fields');
    }
};
