<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('equipment_serials', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_equipment_id')->constrained('project_equipment')->cascadeOnDelete();
            $table->string('serial_number');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('equipment_serials');
    }
};
