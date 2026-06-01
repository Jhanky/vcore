<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('project_equipment', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained('projects')->cascadeOnDelete();
            $table->foreignId('supplier_id')->nullable()->constrained('suppliers')->nullOnDelete();
            $table->string('product_type'); // 'panel', 'inverter', 'battery'
            $table->unsignedBigInteger('product_id')->nullable();
            $table->foreignId('quotation_product_id')->nullable()->constrained()->nullOnDelete();
            $table->string('brand')->nullable();
            $table->string('model')->nullable();
            $table->text('specs')->nullable();
            $table->integer('quantity')->default(1);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('project_equipment');
    }
};
