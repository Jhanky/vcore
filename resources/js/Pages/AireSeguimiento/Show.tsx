import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Copy, AlertTriangle, Wifi, MapPin } from 'lucide-react';
import { useState, useCallback } from 'react';
import ConfirmModal from '@/Components/ConfirmModal';
import { showToast } from '@/Components/Toast';
import {
    STAGE_LABELS, STAGE_COLORS, SEMAFORO_COLORS, SEMAFORO_LABELS,
    formatDate, formatCurrency,
} from '@/features/aire-seguimiento/utils';
import StageDisponibilidad from '@/features/aire-seguimiento/components/stages/StageDisponibilidad';
import StageRadicacion from '@/features/aire-seguimiento/components/stages/StageRadicacion';
import StageCompletitud from '@/features/aire-seguimiento/components/stages/StageCompletitud';
import StageVerificacionTecnica from '@/features/aire-seguimiento/components/stages/StageVerificacionTecnica';
import StageAprobacion from '@/features/aire-seguimiento/components/stages/StageAprobacion';
import StageVisita from '@/features/aire-seguimiento/components/stages/StageVisita';
import StageMedidor from '@/features/aire-seguimiento/components/stages/StageMedidor';
import type {
    AireSeguimiento, AireStage, StageDefinition,
    AireDocumento, AireSeguimientoLog,
} from '@/features/aire-seguimiento/types';

interface Props {
    seguimiento: AireSeguimiento;
    fechasCalculadas: Record<string, string>;
    allowedTransitions: string[];
    puedeDuplicar: boolean;
    stages: Record<string, StageDefinition>;
}

export default function Show({
    seguimiento,
    fechasCalculadas,
    allowedTransitions,
    puedeDuplicar,
    stages,
}: Props) {
    const [showDuplicateModal, setShowDuplicateModal] = useState(false);
    const [duplicating, setDuplicating] = useState(false);
    const [activeStage, setActiveStage] = useState<string>(seguimiento.current_stage);

    const stageOrder: AireStage[] = [
        'consulta_disponibilidad',
        'radicacion',
        'revision_completitud',
        'verificacion_tecnica',
        'aprobacion_contrato',
        'visita_energizacion',
        'medidor_bidireccional',
    ];

    const currentIndex = stageOrder.indexOf(seguimiento.current_stage as AireStage);

    const handleDuplicate = () => {
        setDuplicating(true);
        router.post(route('aire-seguimiento.duplicate', seguimiento.id), {}, {
            onSuccess: () => {
                setShowDuplicateModal(false);
                setDuplicating(false);
                showToast('Expediente duplicado correctamente', 'success');
            },
            onError: () => setDuplicating(false),
        });
    };

    const documentosPorStage = (stage: string) =>
        seguimiento.documentos?.filter(d => d.stage === stage) ?? [];

    return (
        <AuthenticatedLayout>
            <Head title={`Seguimiento Air-e - ${seguimiento.project?.name ?? ''}`} />

            <div className="py-6">
                <div className="w-full px-4 sm:px-6 lg:px-8">
                    <Link
                        href={route('aire-seguimiento.index')}
                        className="inline-flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--solar-gold)] transition-colors mb-6"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Volver a lista
                    </Link>

                    {/* Header */}
                    <div className="glass rounded-[2rem] p-6 border border-[var(--border-ui)] mb-8">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-[var(--solar-gold)]/20 to-[var(--solar-gold)]/5 flex items-center justify-center border border-[var(--solar-gold)]/20">
                                    <Wifi className="h-7 w-7 text-[var(--solar-gold)]" />
                                </div>
                                <div>
                                    <h1 className="font-outfit text-2xl font-bold text-[var(--text-primary)]">
                                        {seguimiento.project?.name ?? 'Seguimiento Air-e'}
                                    </h1>
                                    <div className="flex items-center gap-3 mt-1">
                                        <span className="text-sm text-[var(--text-secondary)]">
                                            {seguimiento.project?.code}
                                        </span>
                                        <span className="text-[var(--border-ui)]">·</span>
                                        <span className={`inline-flex items-center px-3 py-0.5 rounded-full text-xs font-bold border ${STAGE_COLORS[seguimiento.current_stage as AireStage] || ''}`}>
                                            {STAGE_LABELS[seguimiento.current_stage as AireStage]}
                                        </span>
                                        {seguimiento.color_resultado_preliminar && (
                                            <>
                                                <span className="text-[var(--border-ui)]">·</span>
                                                <span className={`inline-flex items-center px-3 py-0.5 rounded-full text-xs font-bold border ${SEMAFORO_COLORS[seguimiento.color_resultado_preliminar]}`}>
                                                    {SEMAFORO_LABELS[seguimiento.color_resultado_preliminar]}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                {puedeDuplicar && (
                                    <button
                                        onClick={() => setShowDuplicateModal(true)}
                                        className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--border-ui)] text-[var(--text-secondary)] hover:text-[var(--solar-gold)] hover:border-[var(--solar-gold)]/30 transition-all"
                                    >
                                        <Copy className="h-4 w-4" />
                                        <span className="text-sm font-bold">Duplicar expediente</span>
                                    </button>
                                )}
                            </div>
                        </div>

                        {seguimiento.nic && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-[var(--border-ui)]">
                                <div>
                                    <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wider">NIC</p>
                                    <p className="font-mono font-bold">{seguimiento.nic}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wider">Clasificación</p>
                                    <p className="font-bold">{seguimiento.clasificacion?.replace('_', ' ') ?? '—'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wider">Potencia</p>
                                    <p className="font-bold">{seguimiento.potencia_proyecto_kw ? `${seguimiento.potencia_proyecto_kw} kW` : '—'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wider">Nivel de Tensión</p>
                                    <p className="font-bold">{seguimiento.nivel_tension ?? '—'}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        {/* Sidebar: Timeline de etapas */}
                        <div className="lg:col-span-1">
                            <div className="glass rounded-[2rem] p-5 border border-[var(--border-ui)] sticky top-28">
                                <h3 className="font-outfit font-bold text-sm text-[var(--text-secondary)] uppercase tracking-wider mb-4">
                                    Etapas del proceso
                                </h3>
                                <div className="space-y-0">
                                    {stageOrder.map((stageId, index) => {
                                        const stageIndex = stageOrder.indexOf(stageId);
                                        const isCompleted = currentIndex > stageIndex;
                                        const isCurrent = seguimiento.current_stage === stageId;
                                        const isPending = currentIndex < stageIndex;

                                        return (
                                            <button
                                                key={stageId}
                                                onClick={() => setActiveStage(stageId)}
                                                className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
                                                    activeStage === stageId
                                                        ? 'bg-[var(--solar-gold)]/10 text-[var(--solar-gold)]'
                                                        : 'text-[var(--text-secondary)] hover:bg-[var(--solar-gold)]/5'
                                                }`}
                                            >
                                                <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                                                    isCompleted
                                                        ? 'bg-emerald-400'
                                                        : isCurrent
                                                            ? 'bg-[var(--solar-gold)] ring-2 ring-[var(--solar-gold)]/30'
                                                            : 'bg-slate-600'
                                                }`} />
                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-xs font-bold truncate ${
                                                        isCompleted
                                                            ? 'text-emerald-400'
                                                            : isCurrent
                                                                ? 'text-[var(--solar-gold)]'
                                                                : 'text-[var(--text-secondary)]'
                                                    }`}>
                                                        {STAGE_LABELS[stageId]}
                                                    </p>
                                                </div>
                                                {isCompleted && (
                                                    <span className="text-emerald-400 text-xs">✓</span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Info del transformador */}
                            {seguimiento.nic && (
                                <div className="glass rounded-[2rem] p-5 border border-[var(--border-ui)] mt-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <MapPin className="h-4 w-4 text-[var(--solar-gold)]" />
                                        <h3 className="font-outfit font-bold text-sm text-[var(--text-secondary)] uppercase tracking-wider">
                                            Transformador
                                        </h3>
                                    </div>
                                    <div className="space-y-2 text-sm">
                                        {seguimiento.codigo_transformador && (
                                            <div className="flex justify-between">
                                                <span className="text-[var(--text-secondary)]">Código:</span>
                                                <span className="font-mono font-bold">{seguimiento.codigo_transformador}</span>
                                            </div>
                                        )}
                                        {seguimiento.potencia_nominal && (
                                            <div className="flex justify-between">
                                                <span className="text-[var(--text-secondary)]">Potencia nominal:</span>
                                                <span className="font-bold">{seguimiento.potencia_nominal} kVA</span>
                                            </div>
                                        )}
                                        {seguimiento.capacidad_disponible && (
                                            <div className="flex justify-between">
                                                <span className="text-[var(--text-secondary)]">Capacidad disp.:</span>
                                                <span className="font-bold">{seguimiento.capacidad_disponible} kVA</span>
                                            </div>
                                        )}
                                        {seguimiento.circuito && (
                                            <div className="flex justify-between">
                                                <span className="text-[var(--text-secondary)]">Circuito:</span>
                                                <span className="font-bold">{seguimiento.circuito}</span>
                                            </div>
                                        )}
                                        {seguimiento.subestacion && (
                                            <div className="flex justify-between">
                                                <span className="text-[var(--text-secondary)]">Subestación:</span>
                                                <span className="font-bold">{seguimiento.subestacion}</span>
                                            </div>
                                        )}
                                        {seguimiento.amarado && (
                                            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-2 mt-2">
                                                <p className="text-xs text-amber-400 font-bold flex items-center gap-1">
                                                    <AlertTriangle className="h-3 w-3" />
                                                    Transformador amarrado
                                                </p>
                                                <p className="text-xs text-[var(--text-secondary)]">
                                                    Puede tener restricciones técnicas. Valide con Air-e.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Main content: Stage forms */}
                        <div className="lg:col-span-3 space-y-6">
                            {activeStage === 'consulta_disponibilidad' && (
                                <StageDisponibilidad
                                    seguimiento={seguimiento}
                                    fechasCalculadas={fechasCalculadas}
                                    allowedTransitions={allowedTransitions}
                                    documentos={documentosPorStage('consulta_disponibilidad')}
                                />
                            )}
                            {activeStage === 'radicacion' && (
                                <StageRadicacion
                                    seguimiento={seguimiento}
                                    allowedTransitions={allowedTransitions}
                                    documentos={documentosPorStage('radicacion')}
                                />
                            )}
                            {activeStage === 'revision_completitud' && (
                                <StageCompletitud
                                    seguimiento={seguimiento}
                                    fechasCalculadas={fechasCalculadas}
                                    allowedTransitions={allowedTransitions}
                                    documentos={documentosPorStage('subsanacion_completitud')}
                                />
                            )}
                            {activeStage === 'verificacion_tecnica' && (
                                <StageVerificacionTecnica
                                    seguimiento={seguimiento}
                                    fechasCalculadas={fechasCalculadas}
                                    allowedTransitions={allowedTransitions}
                                    documentos={documentosPorStage('subsanacion_tecnica')}
                                />
                            )}
                            {activeStage === 'aprobacion_contrato' && (
                                <StageAprobacion
                                    seguimiento={seguimiento}
                                    fechasCalculadas={fechasCalculadas}
                                    allowedTransitions={allowedTransitions}
                                    documentos={documentosPorStage('aprobacion_contrato')}
                                />
                            )}
                            {activeStage === 'visita_energizacion' && (
                                <StageVisita
                                    seguimiento={seguimiento}
                                    fechasCalculadas={fechasCalculadas}
                                    allowedTransitions={allowedTransitions}
                                    documentos={documentosPorStage('visita_energizacion')}
                                />
                            )}
                            {activeStage === 'medidor_bidireccional' && (
                                <StageMedidor
                                    seguimiento={seguimiento}
                                    allowedTransitions={allowedTransitions}
                                    documentos={documentosPorStage('medidor_bidireccional')}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <ConfirmModal
                show={showDuplicateModal}
                onClose={() => setShowDuplicateModal(false)}
                onConfirm={handleDuplicate}
                title="Duplicar expediente"
                message="Se creará un nuevo seguimiento en estado Borrador con los mismos datos del transformador y clasificación. ¿Desea continuar?"
                confirmLabel="Duplicar"
                variant="info"
                processing={duplicating}
            />
        </AuthenticatedLayout>
    );
}
