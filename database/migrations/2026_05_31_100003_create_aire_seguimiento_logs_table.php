<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('aire_seguimiento_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('seguimiento_id')->constrained('aire_seguimientos')->cascadeOnDelete();
            $table->string('from_stage', 50)->nullable();
            $table->string('to_stage', 50)->nullable();
            $table->string('action');
            $table->text('description')->nullable();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->timestamps();

            $table->index('seguimiento_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('aire_seguimiento_logs');
    }
};
