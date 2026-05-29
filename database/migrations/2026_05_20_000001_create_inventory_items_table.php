<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inventory_items', function (Blueprint $table) {
            $table->id();
            $table->enum('type', ['material', 'tool']);
            $table->string('code')->nullable();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('unit')->default('unidad');
            $table->decimal('quantity', 10, 2)->default(0);
            $table->decimal('min_stock', 10, 2)->nullable();
            $table->enum('status', ['disponible', 'en_proyecto', 'en_mantenimiento', 'dado_de_baja'])->nullable();
            $table->date('last_maintenance')->nullable();
            $table->enum('location_type', ['warehouse', 'project'])->default('warehouse');
            $table->foreignId('project_id')->nullable()->constrained()->nullOnDelete();
            $table->string('warehouse_location')->nullable();
            $table->text('notes')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inventory_items');
    }
};
