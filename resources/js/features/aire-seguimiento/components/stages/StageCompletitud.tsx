import { useForm, router } from '@inertiajs/react';
import { ClipboardCheck, Upload, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import { showToast } from '@/Components/Toast';
import { formatDate } from '../../utils';
import type { AireSeguimiento, AireDocumento } from '../../types';

interface Props {
    seguimiento: AireSeguimiento;
    fechasCalculadas: Record<string, string>;
    allowedTransitions: string[];
    documentos: AireDocumento[];
}

export default function StageCompletitud({ seguimiento, fechasCalculadas, allowedTransitions, documentos }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        fecha_inicio_revision_completitud: seguimiento.fecha_inicio_revision_completitud ?? '',
        estado_completitud: seguimiento.estado_completitud ?? '',
        fecha_notificacion_subsanacion: seguimiento.fecha_notificacion_subsanacion ?? '',
        observaciones_completitud: seguimiento.observaciones_completitud ?? '',
        fecha_entrega_subsanacion: seguimiento.fecha_entrega_subsanacion ?? '',
    });

    const [uploading, setUploading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('aire-seguimiento.update', seguimiento.id), {
            preserveScroll: true,
            onSuccess: () => showToast('Revisión actualizada', 'success'),
        });
    };

    const handleAdvance = (target: string) => {
        router.patch(route('aire-seguimiento.stage', seguimiento.id), {
            target_stage: target,
        }, { preserveScroll: true });
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        const formData = new FormData();
        formData.append('stage', 'subsanacion_completitud');
        formData.append('tipo_documento', 'subsanacion');
        formData.append('file', file);
        router.post(route('aire-seguimiento.documents', seguimiento.id), formData, {
            preserveScroll: true,
            onSuccess: () => { showToast('Documento cargado', 'success'); setUploading(false); },
            onError: () => setUploading(false),
        });
    };

    return (
        <div className="glass rounded-[2rem] p-6 border border-[var(--border-ui)]">
            <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                    <ClipboardCheck className="h-5 w-5 text-indigo-400" />
                </div>
                <div>
                    <h2 className="font-outfit font-bold text-lg">Revisión de Completitud</h2>
                    <p className="text-xs text-[var(--text-secondary)]">
                        Air-e revisa la documentación presentada
                    </p>
                </div>
            </div>

            {seguimiento.fecha_limite_completitud_or && (
                <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-2xl p-4 mb-6">
                    <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Plazo OR</p>
                    <p className="font-bold text-lg">
                        {formatDate(seguimiento.fecha_limite_completitud_or)}
                    </p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <InputLabel htmlFor="fecha_inicio" value="Fecha inicio revisión" />
                        <TextInput
                            id="fecha_inicio"
                            type="date"
                            className="mt-1 block w-full"
                            value={data.fecha_inicio_revision_completitud}
                            onChange={(e) => setData('fecha_inicio_revision_completitud', e.target.value)}
                        />
                    </div>

                    <div>
                        <InputLabel htmlFor="estado" value="Estado de revisión" />
                        <select
                            id="estado"
                            className="mt-1 block w-full rounded-2xl border-[var(--border-ui)] bg-[var(--bg-content)] text-[var(--text-primary)] px-4 py-3 focus:ring-[var(--solar-gold)] focus:border-[var(--solar-gold)]"
                            value={data.estado_completitud}
                            onChange={(e) => setData('estado_completitud', e.target.value)}
                        >
                            <option value="">Seleccione...</option>
                            <option value="en_revision">En revisión</option>
                            <option value="subsanacion_requerida">Subsanación requerida</option>
                            <option value="aprobada">Aprobada</option>
                            <option value="negada">Negada</option>
                        </select>
                    </div>

                    <div>
                        <InputLabel htmlFor="fecha_notificacion" value="Fecha notificación subsanación" />
                        <TextInput
                            id="fecha_notificacion"
                            type="date"
                            className="mt-1 block w-full"
                            value={data.fecha_notificacion_subsanacion}
                            onChange={(e) => setData('fecha_notificacion_subsanacion', e.target.value)}
                        />
                    </div>

                    <div>
                        <InputLabel htmlFor="fecha_entrega" value="Fecha entrega subsanación" />
                        <TextInput
                            id="fecha_entrega"
                            type="date"
                            className="mt-1 block w-full"
                            value={data.fecha_entrega_subsanacion}
                            onChange={(e) => setData('fecha_entrega_subsanacion', e.target.value)}
                        />
                    </div>
                </div>

                {seguimiento.fecha_limite_subsanacion_solicitante && (
                    <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-3">
                        <p className="text-xs font-bold text-amber-400">
                            Fecha límite de subsanación: {formatDate(seguimiento.fecha_limite_subsanacion_solicitante)}
                        </p>
                    </div>
                )}

                <div>
                    <InputLabel htmlFor="observaciones" value="Observaciones del OR" />
                    <textarea
                        id="observaciones"
                        className="mt-1 block w-full rounded-2xl border-[var(--border-ui)] bg-[var(--bg-content)] text-[var(--text-primary)] px-4 py-3 focus:ring-[var(--solar-gold)] focus:border-[var(--solar-gold)]"
                        rows={3}
                        value={data.observaciones_completitud}
                        onChange={(e) => setData('observaciones_completitud', e.target.value)}
                    />
                </div>

                <PrimaryButton type="submit" disabled={processing}>
                    Guardar cambios
                </PrimaryButton>
            </form>

            <div className="mt-6 pt-6 border-t border-[var(--border-ui)]">
                <h3 className="font-outfit font-bold text-sm text-[var(--text-secondary)] uppercase tracking-wider mb-3">
                    Documentos de subsanación
                </h3>
                <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--border-ui)] cursor-pointer hover:border-[var(--solar-gold)]/30 transition-all text-sm">
                    <Upload className="h-4 w-4" />
                    Subir documento
                    <input type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" className="hidden" onChange={handleFileUpload} disabled={uploading} />
                </label>
                {documentos.length > 0 && (
                    <div className="mt-3 space-y-2">
                        {documentos.map((doc) => (
                            <div key={doc.id} className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                                <span>📄 {doc.original_filename}</span>
                                <span className="text-xs">{formatDate(doc.created_at)}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {(allowedTransitions.includes('verificacion_tecnica') || allowedTransitions.includes('aprobacion_contrato') || allowedTransitions.includes('negado')) && (
                <div className="mt-6 pt-6 border-t border-[var(--border-ui)] flex items-center justify-end gap-3">
                    {allowedTransitions.includes('verificacion_tecnica') && (
                        <PrimaryButton onClick={() => handleAdvance('verificacion_tecnica')} className="flex items-center gap-2">
                            Avanzar a Verificación Técnica
                            <ArrowRight className="h-4 w-4" />
                        </PrimaryButton>
                    )}
                    {allowedTransitions.includes('aprobacion_contrato') && (
                        <PrimaryButton onClick={() => handleAdvance('aprobacion_contrato')} className="flex items-center gap-2">
                            Avanzar a Aprobación
                            <ArrowRight className="h-4 w-4" />
                        </PrimaryButton>
                    )}
                    {allowedTransitions.includes('negado') && (
                        <button
                            onClick={() => handleAdvance('negado')}
                            className="px-4 py-2 rounded-xl bg-red-500/10 text-red-400 font-bold hover:bg-red-500/20 transition-all"
                        >
                            Marcar como negado
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
