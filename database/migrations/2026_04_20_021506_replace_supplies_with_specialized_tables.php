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
        Schema::dropIfExists('supplies');

        Schema::create('panels', function (Blueprint $table) {
            $table->id();
            $table->string('brand');
            $table->string('model');
            $table->decimal('power', 6, 2);
            $table->decimal('price', 10, 2);
            $table->string('technical_sheet_url')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('inverters', function (Blueprint $table) {
            $table->id();
            $table->string('brand');
            $table->string('model');
            $table->decimal('power', 8, 2);
            $table->string('system_type');
            $table->string('grid_type');
            $table->decimal('price', 10, 2);
            $table->string('technical_sheet_url')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('batteries', function (Blueprint $table) {
            $table->id();
            $table->string('brand');
            $table->string('model');
            $table->decimal('capacity', 8, 2);
            $table->decimal('voltage', 5, 2);
            $table->string('type');
            $table->decimal('price', 10, 2);
            $table->string('technical_sheet_url')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('batteries');
        Schema::dropIfExists('inverters');
        Schema::dropIfExists('panels');

        // No recreamos 'supplies' por ahora ya que fue reemplazada.
    }
};
