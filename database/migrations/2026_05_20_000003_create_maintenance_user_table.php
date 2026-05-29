<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('maintenance_user', function (Blueprint $table) {
            $table->id();
            $table->foreignId('maintenance_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->enum('role', ['lider', 'apoyo'])->default('apoyo');
            $table->timestamps();

            $table->unique(['maintenance_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('maintenance_user');
    }
};
