<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('connection_points', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_id')->unique()->constrained()->cascadeOnDelete();
            $table->enum('operador', ['aire', 'afinia']);
            $table->unsignedBigInteger('codigo')->nullable();
            $table->string('matricula', 50)->nullable();
            $table->text('localizacion')->nullable();
            $table->decimal('potencia_nominal', 10, 2)->nullable();
            $table->decimal('tens_pri', 8, 2)->nullable();
            $table->string('tens_sec', 20)->nullable();
            $table->string('propiedad', 100)->nullable();
            $table->decimal('capacidad_disp', 10, 2)->nullable();
            $table->decimal('latitud', 10, 7)->nullable();
            $table->decimal('longitud', 10, 7)->nullable();
            $table->json('datos_json')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('connection_points');
    }
};
