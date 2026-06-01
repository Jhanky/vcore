<?php

namespace App\Services;

use App\Models\AireSeguimiento;
use App\Models\AireSeguimientoLog;
use App\Models\Client;
use App\Models\Project;
use Carbon\Carbon;

class AireSeguimientoService
{
    public function __construct(
        private readonly ColombianHolidayService $holidays,
    ) {}

    public function createFromProject(Project $project, ?float $potenciaKw = null): AireSeguimiento
    {
        $client = $project->client;
        $connectionPoint = $client?->connectionPoint;

        $data = [
            'project_id' => $project->id,
            'client_id' => $client?->id,
            'current_stage' => 'borrador',
            'status' => 'activo',
        ];

        if ($connectionPoint) {
            $data['nic'] = $connectionPoint->matricula;
            $data['codigo_transformador'] = $connectionPoint->codigo;
            $data['direccion_predio'] = $connectionPoint->localizacion;
            $data['potencia_nominal'] = $connectionPoint->potencia_nominal;
            $data['capacidad_disponible'] = $connectionPoint->capacidad_disp;
            $data['tension_primaria'] = $connectionPoint->tens_pri;
            $data['tension_secundaria'] = $connectionPoint->tens_sec;
            $data['nivel_tension'] = $this->determinarNivelTension($connectionPoint->tens_pri);
            $data['latitud'] = $connectionPoint->latitud;
            $data['longitud'] = $connectionPoint->longitud;
            $data['circuito'] = $connectionPoint->datos_json[0]['circuito'] ?? null;
            $data['subestacion'] = $connectionPoint->datos_json[0]['subestacion'] ?? null;
            $data['amarado'] = ($connectionPoint->datos_json[0]['AMARADO'] ?? '0') === '1';
            $data['pdisponible'] = ($connectionPoint->datos_json[0]['PDISPONIBLE'] ?? '0') === '1';
            $data['propiedad_transformador'] = $connectionPoint->propiedad;
        }

        if ($potenciaKw !== null) {
            $data['potencia_proyecto_kw'] = $potenciaKw;
            $data['clasificacion'] = $this->clasificarProyecto($potenciaKw);

            if (isset($data['capacidad_disponible']) && $data['capacidad_disponible'] > 0) {
                $potenciaKva = $potenciaKw / 0.9;
                $ocupacion = ($potenciaKva / $data['capacidad_disponible']) * 100;
                $data['porcentaje_ocupacion'] = round($ocupacion, 2);
                $data['color_resultado_preliminar'] = $this->calcularColorPreliminar(
                    $data['pdisponible'] ?? false,
                    $ocupacion
                );
            }
        }

        return AireSeguimiento::create($data);
    }

    public function actualizarDatosProxy(AireSeguimiento $seguimiento, array $proxyData): void
    {
        $data = $proxyData[0] ?? [];
        $seguimiento->update([
            'codigo_transformador' => $data['codigo'] ?? $seguimiento->codigo_transformador,
            'direccion_predio' => $data['localizacion'] ?? $seguimiento->direccion_predio,
            'potencia_nominal' => $data['potencia_nominal'] ?? $seguimiento->potencia_nominal,
            'capacidad_disponible' => $data['CapacidadDisp'] ?? $seguimiento->capacidad_disponible,
            'tension_primaria' => $data['tens_pri'] ?? $seguimiento->tension_primaria,
            'tension_secundaria' => $data['tens_sec'] ?? $seguimiento->tension_secundaria,
            'nivel_tension' => $this->determinarNivelTension($data['tens_pri'] ?? null),
            'latitud' => $data['latitud'] ?? $seguimiento->latitud,
            'longitud' => $data['longitud'] ?? $seguimiento->longitud,
            'circuito' => $data['circuito'] ?? $seguimiento->circuito,
            'subestacion' => $data['subestacion'] ?? $seguimiento->subestacion,
            'amarado' => ($data['AMARADO'] ?? '0') === '1',
            'pdisponible' => ($data['PDISPONIBLE'] ?? '0') === '1',
            'propiedad_transformador' => $data['nom_propiedad'] ?? $seguimiento->propiedad_transformador,
        ]);
    }

    public function transitionTo(AireSeguimiento $seguimiento, string $targetStage, ?int $userId = null): bool
    {
        $allowed = $this->allowedTransitions($seguimiento->current_stage);

        if (!in_array($targetStage, $allowed, true)) {
            return false;
        }

        $fromStage = $seguimiento->current_stage;
        $seguimiento->update(['current_stage' => $targetStage]);

        if ($targetStage === 'completado') {
            $seguimiento->update(['status' => 'completado']);
        }

        if ($targetStage === 'negado') {
            $seguimiento->update(['status' => 'negado']);
        }

        AireSeguimientoLog::create([
            'seguimiento_id' => $seguimiento->id,
            'from_stage' => $fromStage,
            'to_stage' => $targetStage,
            'action' => 'stage_changed',
            'user_id' => $userId,
        ]);

        return true;
    }

    public function allowedTransitions(string $currentStage): array
    {
        return match ($currentStage) {
            'borrador' => ['consulta_disponibilidad'],
            'consulta_disponibilidad' => ['radicacion'],
            'radicacion' => ['revision_completitud'],
            'revision_completitud' => ['verificacion_tecnica', 'aprobacion_contrato', 'negado'],
            'verificacion_tecnica' => ['aprobacion_contrato', 'negado'],
            'aprobacion_contrato' => ['visita_energizacion', 'negado'],
            'visita_energizacion' => ['medidor_bidireccional', 'completado', 'negado'],
            'medidor_bidireccional' => ['completado'],
            'negado' => ['borrador'],
            'completado' => [],
            default => [],
        };
    }

    public function calcularFechasLimite(AireSeguimiento $seguimiento): array
    {
        $fechas = [];

        $ahora = Carbon::now();

        // Stage 2: Revisión de Completitud
        if ($seguimiento->fecha_inicio_revision_completitud) {
            $inicio = Carbon::parse($seguimiento->fecha_inicio_revision_completitud);
            $plazoOr = $this->getPlazoCompletitud($seguimiento);
            $fechas['fecha_limite_completitud_or'] = $this->holidays->addBusinessDays($inicio, $plazoOr);

            if ($seguimiento->fecha_notificacion_subsanacion) {
                $notif = Carbon::parse($seguimiento->fecha_notificacion_subsanacion);
                $fechas['fecha_limite_subsanacion_solicitante'] = $this->holidays->addBusinessDays($notif, 5);
            }
        }

        // Stage 3: Verificación Técnica
        if ($seguimiento->fecha_inicio_verificacion_tecnica) {
            $inicio = Carbon::parse($seguimiento->fecha_inicio_verificacion_tecnica);
            $plazoOr = $this->getPlazoVerificacion($seguimiento);
            $fechas['fecha_limite_verificacion_or'] = $this->holidays->addBusinessDays($inicio, $plazoOr);
        }

        // Stage 4: Aprobación y Contrato
        if ($seguimiento->fecha_aprobacion) {
            $aprob = Carbon::parse($seguimiento->fecha_aprobacion);
            $mesesVigencia = $seguimiento->clasificacion === 'AGGE' ? 12 : 6;
            $fechas['fecha_vencimiento_aprobacion'] = (clone $aprob)->addMonths($mesesVigencia);
            $fechas['fecha_limite_firma_contrato'] = $this->holidays->addBusinessDays($aprob, 15);
        }

        // Stage 5: Visita Técnica
        if ($seguimiento->fecha_solicitud_visita) {
            $solicitud = Carbon::parse($seguimiento->fecha_solicitud_visita);
            $fechas['fecha_limite_visita_or'] = $this->holidays->addBusinessDays($solicitud, 5);
        }

        return $fechas;
    }

    public function getPlazoCompletitud(AireSeguimiento $seguimiento): int
    {
        $potencia = $seguimiento->potencia_proyecto_kw ?? 0;

        return $potencia <= 100 ? 2 : 5;
    }

    public function getPlazoVerificacion(AireSeguimiento $seguimiento): int
    {
        $potencia = $seguimiento->potencia_proyecto_kw ?? 0;
        $requiereEstudio = $seguimiento->requiere_estudio_conexion;
        $nivelTension = $seguimiento->nivel_tension;

        if ($requiereEstudio) {
            return 20;
        }

        if ($nivelTension === 'NT1' && $potencia <= 10 && $seguimiento->pdisponible) {
            return 3;
        }

        if ($nivelTension === 'NT1' && $potencia <= 100) {
            return 5;
        }

        return 10;
    }

    public function clasificarProyecto(float $potenciaKw): string
    {
        if ($potenciaKw <= 100) {
            return 'AGPE_pequeno';
        }

        if ($potenciaKw <= 1000) {
            return 'AGPE_mediano';
        }

        return 'AGGE';
    }

    public function determinarNivelTension(?float $tensionPri): ?string
    {
        if ($tensionPri === null) {
            return null;
        }

        if ($tensionPri < 1) {
            return 'NT1';
        }

        if ($tensionPri <= 13.8) {
            return 'NT2';
        }

        return 'NT3';
    }

    public function calcularColorPreliminar(bool $pdisponible, float $porcentajeOcupacion): string
    {
        if (!$pdisponible) {
            return 'rojo';
        }

        if ($porcentajeOcupacion < 50) {
            return 'verde';
        }

        if ($porcentajeOcupacion <= 80) {
            return 'amarillo';
        }

        return 'naranja';
    }

    public function puedeDuplicarExpediente(AireSeguimiento $seguimiento): bool
    {
        return $seguimiento->status === 'negado';
    }

    public function duplicarExpediente(AireSeguimiento $seguimiento, ?int $userId = null): AireSeguimiento
    {
        $data = $seguimiento->replicate(['current_stage', 'status', 'created_at', 'updated_at'])->toArray();
        $data['current_stage'] = 'borrador';
        $data['status'] = 'activo';

        $nuevo = AireSeguimiento::create($data);

        AireSeguimientoLog::create([
            'seguimiento_id' => $nuevo->id,
            'from_stage' => null,
            'to_stage' => 'borrador',
            'action' => 'duplicated',
            'description' => "Duplicado del expediente #{$seguimiento->id}",
            'user_id' => $userId,
        ]);

        return $nuevo;
    }

    public function registrarLog(AireSeguimiento $seguimiento, string $action, ?string $description = null, ?int $userId = null): void
    {
        AireSeguimientoLog::create([
            'seguimiento_id' => $seguimiento->id,
            'from_stage' => $seguimiento->current_stage,
            'to_stage' => $seguimiento->current_stage,
            'action' => $action,
            'description' => $description,
            'user_id' => $userId,
        ]);
    }
}
