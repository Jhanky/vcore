import type { AireStage, ColorSemaforo } from './types';

export const STAGE_LABELS: Record<AireStage, string> = {
    borrador: 'Borrador',
    consulta_disponibilidad: 'Consulta de Disponibilidad',
    radicacion: 'Radicación',
    revision_completitud: 'Revisión de Completitud',
    verificacion_tecnica: 'Verificación Técnica',
    aprobacion_contrato: 'Aprobación y Contrato',
    visita_energizacion: 'Visita Técnica y Energización',
    medidor_bidireccional: 'Medidor Bidireccional',
    completado: 'Completado',
    negado: 'Negado',
};

export const STAGE_COLORS: Record<AireStage, string> = {
    borrador: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    consulta_disponibilidad: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    radicacion: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    revision_completitud: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    verificacion_tecnica: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    aprobacion_contrato: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    visita_energizacion: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    medidor_bidireccional: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    completado: 'bg-green-500/10 text-green-400 border-green-500/20',
    negado: 'bg-red-500/10 text-red-400 border-red-500/20',
};

export const SEMAFORO_LABELS: Record<ColorSemaforo, string> = {
    verde: 'Verde',
    amarillo: 'Amarillo',
    naranja: 'Naranja',
    rojo: 'Rojo',
};

export const SEMAFORO_COLORS: Record<ColorSemaforo, string> = {
    verde: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    amarillo: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    naranja: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    rojo: 'bg-red-500/10 text-red-400 border-red-500/20',
};

export function formatDate(dateStr: string | null | undefined): string {
    if (!dateStr) return '–';
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('es-CO', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}

export function formatCurrency(value: number | null | undefined): string {
    if (value == null) return '$0';
    return '$' + value.toLocaleString('es-CO', { minimumFractionDigits: 0 });
}
