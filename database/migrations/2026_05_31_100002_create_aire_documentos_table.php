<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('aire_documentos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('seguimiento_id')->constrained('aire_seguimientos')->cascadeOnDelete();
            $table->enum('stage', [
                'consulta_disponibilidad',
                'radicacion',
                'subsanacion_completitud',
                'subsanacion_tecnica',
                'aprobacion_contrato',
                'visita_energizacion',
                'medidor_bidireccional',
            ]);
            $table->string('tipo_documento', 100);
            $table->string('file_path');
            $table->string('original_filename');
            $table->unsignedInteger('file_size')->nullable();
            $table->string('mime_type', 100)->nullable();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->timestamps();

            $table->index('seguimiento_id');
            $table->index('stage');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('aire_documentos');
    }
};
