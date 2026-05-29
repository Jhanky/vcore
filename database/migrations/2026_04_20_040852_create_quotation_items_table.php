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
        Schema::create('quotation_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('quotation_id')->constrained()->onDelete('cascade');

            $table->string('description');
            // 'material', 'mano_obra', 'servicio'
            $table->string('category')->default('material');

            $table->decimal('quantity', 10, 2)->default(1);
            $table->string('unit_measure')->default('und'); // 'und', 'kW', 'm', 'global'

            $table->decimal('unit_price_cop', 15, 2)->default(0);
            $table->decimal('profit_percentage', 5, 4)->default(0.1500); // e.g. 15%

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('quotation_items');
    }
};
