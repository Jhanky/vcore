import { useForm, router } from '@inertiajs/react';
import { Award, Upload, ArrowRight } from 'lucide-react';
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

export default function StageAprobacion({ seguimiento, fechasCalculadas, allowedTransitions, documentos }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        fecha_aprobacion: seguimiento.fecha_aprobacion ?? '',
        prorroga_solicitada: seguimiento.prorroga_solicitada ?? false,
        fecha_vencimiento_prorrogada: seguimiento.fecha_vencimiento_prorrogada ?? '',
        numero_contrato_conexion: seguimiento.numero_contrato_conexion ?? '',
        fecha_firma_contrato: seguimiento.fecha_firma_contrato ?? '',
    });

    const [uploading, setUploading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('aire-seguimiento.update', seguimiento.id), {
            preserveScroll: true,
            onSuccess: () => showToast('Aprobación actualizada', 'success'),
        });
    };

    const handleAdvance = () => {
        router.patch(route('aire-seguimiento.stage', seguimiento.id), {
            target_stage: 'visita_energizacion',
        }, { preserveScroll: true });
    };

    const handleFileUpload = (type: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        const formData = new FormData();
        formData.append('stage', 'aprobacion_contrato');
        formData.append('tipo_documento', type);
        formData.append('file', file);
        router.post(route('aire-seguimiento.documents', seguimiento.id), formData, {
            preserveScroll: true,
            onSuccess: () => { showToast('Documento cargado', 'success'); setUploading(false); },
            onError: () => setUploading(false),
        });
    };

    const canAdvance = allowedTransitions.includes('visita_energizacion');

    const hasVencimiento = seguimiento.fecha_vencimiento_aprobacion;
    const vencimientoWarning = hasVencimiento
        ? (new Date(seguimiento.fecha_vencimiento_aprobacion).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        : null;

    return (
        <div className="glass rounded-[2rem] p-6 border border-[var(--border-ui)]">
            <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                    <Award className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                    <h2 className="font-outfit font-bold text-lg">Aprobación y Contrato de Conexión</h2>
                    <p className="text-xs text-[var(--text-secondary])">
                        Air-e emite aprobación; integrador firma contrato
                    </p>
                </div>
            </div>

            {/* Alertas de vencimiento */}
            {vencimientoWarning !== null && vencimientoWarning <= 30 && (
                <div className={`rounded-2xl p-4 mb-6 ${vencimientoWarning <= 10 ? 'bg-red-500/10 border border-red-500/20' : 'bg-amber-500/10 border border-amber-500/20'}`}>
                    <p className="text-xs font-bold uppercase tracking-wider">
                        {vencimientoWarning <= 10 ? '🔴 Crítica' : 'ℹ️ Informativa'}
                    </p>
                    <p className="font-bold">
                        Vigencia vence: {formatDate(seguimiento.fecha_vencimiento_aprobacion)}
                    </p>
                    <p className="text-sm opacity-80">
                        {vencimientoWarning <= 10
                            ? 'Gestione la entrada en operación o solicite prórroga inmediatamente.'
                            : 'Recuerde gestionar la entrada en operación o solicitar prórroga.'}
                    </p>
                </div>
            )}

            {seguimiento.fecha_limite_firma_contrato && (
                <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4 mb-6">
                    <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Plazo firma de contrato</p>
                    <p className="font-bold text-lg">{formatDate(seguimiento.fecha_limite_firma_contrato)}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <InputLabel htmlFor="fecha_aprobacion" value="Fecha de aprobación" />
                        <TextInput
                            id="fecha_aprobacion"
                            type="date"
                            className="mt-1 block w-full"
                            value={data.fecha_aprobacion}
                            onChange={(e) => setData('fecha_aprobacion', e.target.value)}
                        />
                    </div>

                    <div>
                        <InputLabel htmlFor="contrato" value="Número de contrato" />
                        <TextInput
                            id="contrato"
                            type="text"
                            className="mt-1 block w-full"
                            value={data.numero_contrato_conexion}
                            onChange={(e) => setData('numero_contrato_conexion', e.target.value)}
                        />
                    </div>

                    {seguimiento.fecha_vencimiento_aprobacion && (
                        <div>
                            <InputLabel htmlFor="vencimiento" value="Vencimiento aprobación" />
                            <TextInput
                                id="vencimiento"
                                type="date"
                                className="mt-1 block w-full"
                                value={seguimiento.fecha_vencimiento_aprobacion}
                                disabled
                            />
                            <p className="text-xs text-[var(--text-secondary)] mt-1">
                                {seguimiento.clasificacion === 'AGGE' ? '12 meses' : '6 meses'} desde aprobación
                            </p>
                        </div>
                    )}

                    <div>
                        <InputLabel htmlFor="fecha_firma" value="Fecha firma de contrato" />
                        <TextInput
                            id="fecha_firma"
                            type="date"
                            className="mt-1 block w-full"
                            value={data.fecha_firma_contrato}
                            onChange={(e) => setData('fecha_firma_contrato', e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            className="w-4 h-4 rounded border-[var(--border-ui)] text-[var(--solar-gold)] focus:ring-[var(--solar-gold)]/20 bg-transparent"
                            checked={data.prorroga_solicitada}
                            onChange={(e) => setData('prorroga_solicitada', e.target.checked)}
                        />
                        <span className="text-sm font-medium">Prórroga solicitada</span>
                    </label>

                    {data.prorroga_solicitada && (
                        <div className="flex-1">
                            <InputLabel htmlFor="vencimiento_prorroga" value="Nuevo vencimiento" />
                            <TextInput
                                id="vencimiento_prorroga"
                                type="date"
                                className="mt-1 block w-full"
                                value={data.fecha_vencimiento_prorrogada}
                                onChange={(e) => setData('fecha_vencimiento_prorrogada', e.target.value)}
                            />
                        </div>
                    )}
                </div>

                <InputError message={errors.fecha_aprobacion} />

                <PrimaryButton type="submit" disabled={processing}>
                    Guardar cambios
                </PrimaryButton>
            </form>

            <div className="mt-6 pt-6 border-t border-[var(--border-ui)]">
                <h3 className="font-outfit font-bold text-sm text-[var(--text-secondary)] uppercase tracking-wider mb-3">
                    Documentos de aprobación
                </h3>
                <div className="flex gap-3">
                    <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--border-ui)] cursor-pointer hover:border-[var(--solar-gold)]/30 transition-all text-sm">
                        <Upload className="h-4 w-4" />
                        Subir aprobación
                        <input type="file" accept=".pdf" className="hidden" onChange={handleFileUpload('archivo_aprobacion')} disabled={uploading} />
                    </label>
                    <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--border-ui)] cursor-pointer hover:border-[var(--solar-gold)]/30 transition-all text-sm">
                        <Upload className="h-4 w-4" />
                        Subir contrato
                        <input type="file" accept=".pdf" className="hidden" onChange={handleFileUpload('archivo_contrato')} disabled={uploading} />
                    </label>
                </div>
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

            {canAdvance && (
                <div className="mt-6 pt-6 border-t border-[var(--border-ui)] flex justify-end">
                    <PrimaryButton onClick={handleAdvance} className="flex items-center gap-2">
                        Avanzar a Visita Técnica
                        <ArrowRight className="h-4 w-4" />
                    </PrimaryButton>
                </div>
            )}
        </div>
    );
}
