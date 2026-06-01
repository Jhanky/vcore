import type { LucideIcon } from 'lucide-react';

export type AireStage =
    | 'borrador'
    | 'consulta_disponibilidad'
    | 'radicacion'
    | 'revision_completitud'
    | 'verificacion_tecnica'
    | 'aprobacion_contrato'
    | 'visita_energizacion'
    | 'medidor_bidireccional'
    | 'completado'
    | 'negado';

export type AireStatus = 'activo' | 'completado' | 'negado';

export type ColorSemaforo = 'verde' | 'amarillo' | 'naranja' | 'rojo';

export type Clasificacion = 'AGPE_pequeno' | 'AGPE_mediano' | 'AGGE' | 'GD_pequeno' | 'GD_mediano';

export type NivelTension = 'NT1' | 'NT2' | 'NT3';

export type EstadoRevision = 'en_revision' | 'subsanacion_requerida' | 'aprobada' | 'negada';

export type ResultadoVisita = 'aprobada' | 'ajustes_requeridos' | 'no_realizada';

export interface AireSeguimiento {
    id: number;
    project_id: number;
    client_id: number | null;
    user_id: number | null;
    current_stage: AireStage;
    status: AireStatus;

    nic: string | null;
    codigo_transformador: number | null;
    direccion_predio: string | null;
    potencia_nominal: number | null;
    capacidad_disponible: number | null;
    tension_primaria: number | null;
    tension_secundaria: string | null;
    nivel_tension: NivelTension | null;
    latitud: number | null;
    longitud: number | null;
    circuito: string | null;
    subestacion: string | null;
    amarado: boolean | null;
    pdisponible: boolean | null;
    propiedad_transformador: string | null;

    potencia_proyecto_kw: number | null;
    porcentaje_ocupacion: number | null;
    color_resultado_preliminar: ColorSemaforo | null;
    clasificacion: Clasificacion | null;

    fecha_consulta_disponibilidad: string | null;
    color_resultado_oficial: ColorSemaforo | null;
    porcentaje_resultado_oficial: number | null;
    requiere_estudio_conexion: boolean | null;

    fecha_radicacion: string | null;
    numero_radicado: string | null;
    observaciones_radicacion: string | null;

    fecha_inicio_revision_completitud: string | null;
    fecha_limite_completitud_or: string | null;
    estado_completitud: EstadoRevision | null;
    fecha_notificacion_subsanacion: string | null;
    fecha_limite_subsanacion_solicitante: string | null;
    observaciones_completitud: string | null;
    fecha_entrega_subsanacion: string | null;

    fecha_inicio_verificacion_tecnica: string | null;
    fecha_limite_verificacion_or: string | null;
    estado_verificacion: EstadoRevision | null;
    motivo_negacion: string | null;
    fecha_notificacion_or_tecnica: string | null;
    observaciones_tecnicas: string | null;
    fecha_entrega_subsanacion_tecnica: string | null;

    fecha_aprobacion: string | null;
    fecha_vencimiento_aprobacion: string | null;
    prorroga_solicitada: boolean | null;
    fecha_vencimiento_prorrogada: string | null;
    numero_contrato_conexion: string | null;
    fecha_firma_contrato: string | null;
    fecha_limite_firma_contrato: string | null;

    fecha_solicitud_visita: string | null;
    fecha_limite_visita_or: string | null;
    fecha_visita_programada: string | null;
    resultado_visita_1: ResultadoVisita | null;
    observaciones_visita_1: string | null;
    fecha_visita_2: string | null;
    resultado_visita_2: ResultadoVisita | null;
    costo_visitas_adicionales: number | null;
    fecha_energizacion: string | null;

    requiere_medidor_bidireccional: boolean | null;
    fecha_solicitud_cambio_medidor: string | null;
    fecha_instalacion_medidor: string | null;
    numero_medidor_nuevo: string | null;
    tipo_medidor: string | null;
    fecha_inicio_facturacion_neta: string | null;
    comercializador_excedentes: string | null;
    numero_contrato_excedentes: string | null;

    project?: { id: number; name: string; code: string };
    client?: { id: number; name: string };
    creator?: { id: number; name: string };
    documentos?: AireDocumento[];
    logs?: AireSeguimientoLog[];

    created_at: string;
    updated_at: string;
}

export interface AireDocumento {
    id: number;
    seguimiento_id: number;
    stage: string;
    tipo_documento: string;
    file_path: string;
    original_filename: string;
    file_size: number | null;
    mime_type: string | null;
    user_id: number | null;
    created_at: string;
}

export interface AireSeguimientoLog {
    id: number;
    seguimiento_id: number;
    from_stage: string | null;
    to_stage: string | null;
    action: string;
    description: string | null;
    user_id: number | null;
    user?: { id: number; name: string };
    created_at: string;
}

export interface StageDefinition {
    id: AireStage;
    label: string;
    order: number;
}

export interface ProjectOption {
    id: number;
    name: string;
    code: string;
    client: { id: number; name: string; nic: string | null } | null;
    has_connection_point: boolean;
}
