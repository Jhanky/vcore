<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('inventory_items', function (Blueprint $table) {
            $table->string('brand')->nullable()->after('code');
            $table->string('model')->nullable()->after('brand');
            $table->string('serial_number')->nullable()->after('model');
            $table->integer('maintenance_interval_days')->nullable()->after('serial_number');
            $table->string('supplier')->nullable()->after('maintenance_interval_days');
            $table->string('category')->nullable()->after('supplier');
        });

        if (Schema::getConnection()->getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE inventory_items MODIFY COLUMN status ENUM('disponible', 'en_proyecto', 'en_mantenimiento', 'dado_de_baja', 'agotado', 'descontinuado') NULL");
        }
    }

    public function down(): void
    {
        Schema::table('inventory_items', function (Blueprint $table) {
            $table->dropColumn(['brand', 'model', 'serial_number', 'maintenance_interval_days', 'supplier', 'category']);
        });

        if (Schema::getConnection()->getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE inventory_items MODIFY COLUMN status ENUM('disponible', 'en_proyecto', 'en_mantenimiento', 'dado_de_baja') NULL");
        }
    }
};
