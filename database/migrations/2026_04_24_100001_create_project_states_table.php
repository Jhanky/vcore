<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('project_states', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->nullable();
            $table->string('code')->unique();
            $table->string('color', 20)->default('#6B7280');
            $table->string('icon', 50)->default('Circle');
            $table->string('phase')->nullable();
            $table->integer('display_order')->default(0);
            $table->integer('estimated_duration')->nullable();
            $table->boolean('is_final')->default(false);
            $table->boolean('requires_approval')->default(false);
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('project_states');
    }
};
