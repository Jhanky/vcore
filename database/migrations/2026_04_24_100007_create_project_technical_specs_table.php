<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('project_technical_specs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->onDelete('cascade');
            $table->string('panel_brand')->nullable();
            $table->string('panel_model')->nullable();
            $table->integer('panel_count')->nullable();
            $table->decimal('panel_power_w', 8, 2)->nullable();
            $table->string('inverter_brand')->nullable();
            $table->string('inverter_model')->nullable();
            $table->integer('inverter_count')->nullable();
            $table->decimal('inverter_power_kw', 8, 2)->nullable();
            $table->string('battery_brand')->nullable();
            $table->string('battery_model')->nullable();
            $table->integer('battery_count')->nullable();
            $table->decimal('battery_capacity_kwh', 8, 2)->nullable();
            $table->string('structure_type')->nullable();
            $table->string('installation_type')->nullable();
            $table->text('electrical_diagram')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index('project_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('project_technical_specs');
    }
};
