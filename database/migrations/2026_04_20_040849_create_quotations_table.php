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
        Schema::create('quotations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null'); // The seller
            $table->string('code')->unique(); // e.g. COT-2026-0001
            $table->string('project_name');
            $table->string('status')->default('Borrador'); // Borrador, Enviada, Aprobada, Rechazada, Vencida

            // System specs
            $table->string('system_type')->nullable(); // On-grid, Off-grid, Hibrido
            $table->string('network_type')->nullable(); // Monofasico, Bifasico, Trifasico
            $table->decimal('power_kwp', 10, 2);
            $table->integer('panel_count')->default(0);
            $table->boolean('requires_financing')->default(false);

            // Percentages
            $table->decimal('profit_percentage', 5, 4)->default(0.0800); // 8%
            $table->decimal('iva_profit_percentage', 5, 4)->default(0.1900); // 19%
            $table->decimal('commercial_management_percentage', 5, 4)->default(0.0200); // 2%
            $table->decimal('administration_percentage', 5, 4)->default(0.0800); // 8%
            $table->decimal('contingency_percentage', 5, 4)->default(0.0300); // 3%
            $table->decimal('withholding_percentage', 5, 4)->default(0.0250); // 2.5%

            // Calculated Totals
            $table->decimal('subtotal', 15, 2)->default(0);
            $table->decimal('commercial_management', 15, 2)->default(0);
            $table->decimal('subtotal2', 15, 2)->default(0);
            $table->decimal('administration', 15, 2)->default(0);
            $table->decimal('contingency', 15, 2)->default(0);
            $table->decimal('profit', 15, 2)->default(0);
            $table->decimal('profit_iva', 15, 2)->default(0);
            $table->decimal('subtotal3', 15, 2)->default(0);
            $table->decimal('withholdings', 15, 2)->default(0);
            $table->decimal('total_value', 15, 2)->default(0);

            // Dates
            $table->date('issue_date')->nullable();
            $table->date('expiration_date')->nullable();

            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('quotations');
    }
};
