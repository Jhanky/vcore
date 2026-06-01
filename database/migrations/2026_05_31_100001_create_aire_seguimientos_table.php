<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('aire_seguimientos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->unique()->constrained()->cascadeOnDelete();
            $table->foreignId('client_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();

            $table->enum('current_stage', [
                'borrador',
                'consulta_disponibilidad',
                'radicacion',
                'revision_completitud',
                'verificacion_tecnica',
                'aprobacion_contrato',
                'visita_energizacion',
                'medidor_bidireccional',
                'completado',
                'negado',
            ])->default('borrador');

            $table->enum('status', ['activo', 'completado', 'negado'])->default('activo');

            // Proxy data (from ConnectionPoint)
            $table->string('nic', 50)->nullable();
            $table->unsignedBigInteger('codigo_transformador')->nullable();
            $table->text('direccion_predio')->nullable();
            $table->decimal('potencia_nominal', 10, 2)->nullable();
            $table->decimal('capacidad_disponible', 10, 2)->nullable();
            $table->decimal('tension_primaria', 8, 2)->nullable();
            $table->string('tension_secundaria', 20)->nullable();
            $table->enum('nivel_tension', ['NT1', 'NT2', 'NT3'])->nullable();
            $table->decimal('latitud', 10, 7)->nullable();
            $table->decimal('longitud', 10, 7)->nullable();
            $table->string('circuito', 100)->nullable();
            $table->string('subestacion', 100)->nullable();
            $table->boolean('amarado')->nullable();
            $table->boolean('pdisponible')->nullable();
            $table->string('propiedad_transformador', 100)->nullable();

            // Project classification
            $table->decimal('potencia_proyecto_kw', 10, 2)->nullable();
            $table->decimal('porcentaje_ocupacion', 5, 2)->nullable();
            $table->enum('color_resultado_preliminar', ['verde', 'amarillo', 'naranja', 'rojo'])->nullable();
            $table->enum('clasificacion', [
                'AGPE_pequeno', 'AGPE_mediano', 'AGGE', 'GD_pequeno', 'GD_mediano',
            ])->nullable();

            // Stage 0: Consulta de Disponibilidad
            $table->date('fecha_consulta_disponibilidad')->nullable();
            $table->enum('color_resultado_oficial', ['verde', 'amarillo', 'naranja', 'rojo'])->nullable();
            $table->decimal('porcentaje_resultado_oficial', 5, 2)->nullable();
            $table->boolean('requiere_estudio_conexion')->nullable();

            // Stage 1: Radicación
            $table->date('fecha_radicacion')->nullable();
            $table->string('numero_radicado', 100)->nullable();
            $table->text('observaciones_radicacion')->nullable();

            // Stage 2: Revisión de Completitud
            $table->date('fecha_inicio_revision_completitud')->nullable();
            $table->date('fecha_limite_completitud_or')->nullable();
            $table->enum('estado_completitud', ['en_revision', 'subsanacion_requerida', 'aprobada', 'negada'])->nullable();
            $table->date('fecha_notificacion_subsanacion')->nullable();
            $table->date('fecha_limite_subsanacion_solicitante')->nullable();
            $table->text('observaciones_completitud')->nullable();
            $table->date('fecha_entrega_subsanacion')->nullable();

            // Stage 3: Verificación Técnica
            $table->date('fecha_inicio_verificacion_tecnica')->nullable();
            $table->date('fecha_limite_verificacion_or')->nullable();
            $table->enum('estado_verificacion', ['en_revision', 'subsanacion_requerida', 'aprobada', 'negada'])->nullable();
            $table->text('motivo_negacion')->nullable();
            $table->date('fecha_notificacion_or_tecnica')->nullable();
            $table->text('observaciones_tecnicas')->nullable();
            $table->date('fecha_entrega_subsanacion_tecnica')->nullable();

            // Stage 4: Aprobación y Contrato
            $table->date('fecha_aprobacion')->nullable();
            $table->date('fecha_vencimiento_aprobacion')->nullable();
            $table->boolean('prorroga_solicitada')->nullable();
            $table->date('fecha_vencimiento_prorrogada')->nullable();
            $table->string('numero_contrato_conexion', 100)->nullable();
            $table->date('fecha_firma_contrato')->nullable();
            $table->date('fecha_limite_firma_contrato')->nullable();

            // Stage 5: Visita Técnica y Energización
            $table->date('fecha_solicitud_visita')->nullable();
            $table->date('fecha_limite_visita_or')->nullable();
            $table->date('fecha_visita_programada')->nullable();
            $table->enum('resultado_visita_1', ['aprobada', 'ajustes_requeridos', 'no_realizada'])->nullable();
            $table->text('observaciones_visita_1')->nullable();
            $table->date('fecha_visita_2')->nullable();
            $table->enum('resultado_visita_2', ['aprobada', 'ajustes_requeridos'])->nullable();
            $table->decimal('costo_visitas_adicionales', 15, 2)->nullable();
            $table->date('fecha_energizacion')->nullable();

            // Stage 6: Medidor Bidireccional
            $table->boolean('requiere_medidor_bidireccional')->nullable();
            $table->date('fecha_solicitud_cambio_medidor')->nullable();
            $table->date('fecha_instalacion_medidor')->nullable();
            $table->string('numero_medidor_nuevo', 100)->nullable();
            $table->string('tipo_medidor', 100)->nullable();
            $table->date('fecha_inicio_facturacion_neta')->nullable();
            $table->string('comercializador_excedentes', 200)->nullable();
            $table->string('numero_contrato_excedentes', 100)->nullable();

            $table->timestamps();

            $table->index('current_stage');
            $table->index('status');
            $table->index('nic');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('aire_seguimientos');
    }
};
