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
        Schema::create('quotation_products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('quotation_id')->constrained()->onDelete('cascade');

            // e.g. 'panel', 'inverter', 'battery'
            $table->string('product_type');

            // We use integer instead of foreignId because it's polymorphic and the product might be deleted
            $table->unsignedBigInteger('product_id')->nullable();

            // Snapshots at the time of quotation
            $table->string('snapshot_brand')->nullable();
            $table->string('snapshot_model')->nullable();
            $table->json('snapshot_specs')->nullable();

            $table->integer('quantity')->default(1);
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
        Schema::dropIfExists('quotation_products');
    }
};
