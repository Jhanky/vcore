<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AireSeguimiento extends Model
{
    protected $table = 'aire_seguimientos';

    protected $fillable = [
        'project_id', 'client_id', 'user_id',
        'current_stage', 'status',
        'nic', 'codigo_transformador', 'direccion_predio',
        'potencia_nominal', 'capacidad_disponible',
        'tension_primaria', 'tension_secundaria', 'nivel_tension',
        'latitud', 'longitud', 'circuito', 'subestacion',
        'amarado', 'pdisponible', 'propiedad_transformador',
        'potencia_proyecto_kw', 'porcentaje_ocupacion',
        'color_resultado_preliminar', 'clasificacion',
        'fecha_consulta_disponibilidad', 'color_resultado_oficial',
        'porcentaje_resultado_oficial', 'requiere_estudio_conexion',
        'fecha_radicacion', 'numero_radicado', 'observaciones_radicacion',
        'fecha_inicio_revision_completitud', 'fecha_limite_completitud_or',
        'estado_completitud', 'fecha_notificacion_subsanacion',
        'fecha_limite_subsanacion_solicitante', 'observaciones_completitud',
        'fecha_entrega_subsanacion',
        'fecha_inicio_verificacion_tecnica', 'fecha_limite_verificacion_or',
        'estado_verificacion', 'motivo_negacion', 'fecha_notificacion_or_tecnica',
        'observaciones_tecnicas', 'fecha_entrega_subsanacion_tecnica',
        'fecha_aprobacion', 'fecha_vencimiento_aprobacion',
        'prorroga_solicitada', 'fecha_vencimiento_prorrogada',
        'numero_contrato_conexion', 'fecha_firma_contrato',
        'fecha_limite_firma_contrato',
        'fecha_solicitud_visita', 'fecha_limite_visita_or',
        'fecha_visita_programada', 'resultado_visita_1',
        'observaciones_visita_1', 'fecha_visita_2', 'resultado_visita_2',
        'costo_visitas_adicionales', 'fecha_energizacion',
        'requiere_medidor_bidireccional', 'fecha_solicitud_cambio_medidor',
        'fecha_instalacion_medidor', 'numero_medidor_nuevo', 'tipo_medidor',
        'fecha_inicio_facturacion_neta', 'comercializador_excedentes',
        'numero_contrato_excedentes',
    ];

    protected $casts = [
        'potencia_nominal' => 'decimal:2',
        'capacidad_disponible' => 'decimal:2',
        'tension_primaria' => 'decimal:2',
        'latitud' => 'decimal:7',
        'longitud' => 'decimal:7',
        'amarado' => 'boolean',
        'pdisponible' => 'boolean',
        'potencia_proyecto_kw' => 'decimal:2',
        'porcentaje_ocupacion' => 'decimal:2',
        'porcentaje_resultado_oficial' => 'decimal:2',
        'requiere_estudio_conexion' => 'boolean',
        'prorroga_solicitada' => 'boolean',
        'requiere_medidor_bidireccional' => 'boolean',
        'costo_visitas_adicionales' => 'decimal:2',
        'fecha_consulta_disponibilidad' => 'date',
        'fecha_radicacion' => 'date',
        'fecha_inicio_revision_completitud' => 'date',
        'fecha_limite_completitud_or' => 'date',
        'fecha_notificacion_subsanacion' => 'date',
        'fecha_limite_subsanacion_solicitante' => 'date',
        'fecha_entrega_subsanacion' => 'date',
        'fecha_inicio_verificacion_tecnica' => 'date',
        'fecha_limite_verificacion_or' => 'date',
        'fecha_notificacion_or_tecnica' => 'date',
        'fecha_entrega_subsanacion_tecnica' => 'date',
        'fecha_aprobacion' => 'date',
        'fecha_vencimiento_aprobacion' => 'date',
        'fecha_vencimiento_prorrogada' => 'date',
        'fecha_firma_contrato' => 'date',
        'fecha_limite_firma_contrato' => 'date',
        'fecha_solicitud_visita' => 'date',
        'fecha_limite_visita_or' => 'date',
        'fecha_visita_programada' => 'date',
        'fecha_visita_2' => 'date',
        'fecha_energizacion' => 'date',
        'fecha_solicitud_cambio_medidor' => 'date',
        'fecha_instalacion_medidor' => 'date',
        'fecha_inicio_facturacion_neta' => 'date',
    ];

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function documentos(): HasMany
    {
        return $this->hasMany(AireDocumento::class, 'seguimiento_id');
    }

    public function logs(): HasMany
    {
        return $this->hasMany(AireSeguimientoLog::class, 'seguimiento_id');
    }

    public function scopeActivo($query)
    {
        return $query->where('status', 'activo');
    }

    public function scopeByStage($query, $stage)
    {
        return $query->where('current_stage', $stage);
    }
}
