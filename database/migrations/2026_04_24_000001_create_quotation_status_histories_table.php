<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('quotation_status_histories', function (Blueprint $table) {
            $table->id();

            $table->foreignId('quotation_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignId('user_id')
                ->constrained()
                ->restrictOnDelete();

            // null means "initial creation"
            $table->string('from_status')->nullable();
            $table->string('to_status');

            $table->text('notes')->nullable();

            $table->timestamps();

            $table->index(['quotation_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('quotation_status_histories');
    }
};
