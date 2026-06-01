import { useForm, router } from '@inertiajs/react';
import { HardHat, Upload, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import { showToast } from '@/Components/Toast';
import { formatDate, formatCurrency } from '../../utils';
import type { AireSeguimiento, AireDocumento } from '../../types';

interface Props {
    seguimiento: AireSeguimiento;
    fechasCalculadas: Record<string, string>;
    allowedTransitions: string[];
    documentos: AireDocumento[];
}

export default function StageVisita({ seguimiento, fechasCalculadas, allowedTransitions, documentos }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        fecha_solicitud_visita: seguimiento.fecha_solicitud_visita ?? '',
        fecha_visita_programada: seguimiento.fecha_visita_programada ?? '',
        resultado_visita_1: seguimiento.resultado_visita_1 ?? '',
        observaciones_visita_1: seguimiento.observaciones_visita_1 ?? '',
        fecha_visita_2: seguimiento.fecha_visita_2 ?? '',
        resultado_visita_2: seguimiento.resultado_visita_2 ?? '',
        costo_visitas_adicionales: seguimiento.costo_visitas_adicionales?.toString() ?? '',
        fecha_energizacion: seguimiento.fecha_energizacion ?? '',
    });

    const [uploading, setUploading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('aire-seguimiento.update', seguimiento.id), {
            preserveScroll: true,
            onSuccess: () => showToast('Visita actualizada', 'success'),
        });
    };

    const handleAdvance = () => {
        router.patch(route('aire-seguimiento.stage', seguimiento.id), {
            target_stage: 'medidor_bidireccional',
        }, { preserveScroll: true });
    };

    const handleComplete = () => {
        router.patch(route('aire-seguimiento.stage', seguimiento.id), {
            target_stage: 'completado',
        }, { preserveScroll: true });
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        const formData = new FormData();
        formData.append('stage', 'visita_energizacion');
        formData.append('tipo_documento', 'acta_visita');
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
                <div className="h-10 w-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                    <HardHat className="h-5 w-5 text-cyan-400" />
                </div>
                <div>
                    <h2 className="font-outfit font-bold text-lg">Visita Técnica y Energización</h2>
                    <p className="text-xs text-[var(--text-secondary)]">
                        Air-e realiza la visita técnica y energización
                    </p>
                </div>
            </div>

            {seguimiento.fecha_limite_visita_or && (
                <div className="bg-cyan-500/5 border border-cyan-500/20 rounded-2xl p-4 mb-6">
                    <p className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Plazo OR para visita</p>
                    <p className="font-bold text-lg">{formatDate(seguimiento.fecha_limite_visita_or)}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <InputLabel htmlFor="fecha_solicitud" value="Fecha solicitud visita" />
                        <TextInput
                            id="fecha_solicitud"
                            type="date"
                            className="mt-1 block w-full"
                            value={data.fecha_solicitud_visita}
                            onChange={(e) => setData('fecha_solicitud_visita', e.target.value)}
                        />
                    </div>

                    <div>
                        <InputLabel htmlFor="fecha_programada" value="Fecha visita programada" />
                        <TextInput
                            id="fecha_programada"
                            type="date"
                            className="mt-1 block w-full"
                            value={data.fecha_visita_programada}
                            onChange={(e) => setData('fecha_visita_programada', e.target.value)}
                        />
                    </div>

                    <div>
                        <InputLabel htmlFor="resultado_1" value="Resultado 1ra visita" />
                        <select
                            id="resultado_1"
                            className="mt-1 block w-full rounded-2xl border-[var(--border-ui)] bg-[var(--bg-content)] text-[var(--text-primary)] px-4 py-3 focus:ring-[var(--solar-gold)] focus:border-[var(--solar-gold)]"
                            value={data.resultado_visita_1}
                            onChange={(e) => setData('resultado_visita_1', e.target.value)}
                        >
                            <option value="">Seleccione...</option>
                            <option value="aprobada">Aprobada</option>
                            <option value="ajustes_requeridos">Ajustes requeridos</option>
                            <option value="no_realizada">No realizada</option>
                        </select>
                    </div>

                    <div>
                        <InputLabel htmlFor="fecha_energizacion" value="Fecha de energización" />
                        <TextInput
                            id="fecha_energizacion"
                            type="date"
                            className="mt-1 block w-full"
                            value={data.fecha_energizacion}
                            onChange={(e) => setData('fecha_energizacion', e.target.value)}
                        />
                    </div>
                </div>

                <div>
                    <InputLabel htmlFor="observaciones_1" value="Observaciones 1ra visita" />
                    <textarea
                        id="observaciones_1"
                        className="mt-1 block w-full rounded-2xl border-[var(--border-ui)] bg-[var(--bg-content)] text-[var(--text-primary)] px-4 py-3 focus:ring-[var(--solar-gold)] focus:border-[var(--solar-gold)]"
                        rows={3}
                        value={data.observaciones_visita_1}
                        onChange={(e) => setData('observaciones_visita_1', e.target.value)}
                    />
                </div>

                {/* 2da visita (si aplica) */}
                {data.resultado_visita_1 === 'ajustes_requeridos' && (
                    <>
                        <div className="border-t border-[var(--border-ui)] pt-4">
                            <h4 className="font-outfit font-bold text-sm mb-3">Segunda Visita</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <InputLabel htmlFor="fecha_visita_2" value="Fecha 2da visita" />
                                    <TextInput
                                        id="fecha_visita_2"
                                        type="date"
                                        className="mt-1 block w-full"
                                        value={data.fecha_visita_2}
                                        onChange={(e) => setData('fecha_visita_2', e.target.value)}
                                    />
                                </div>

                                <div>
                                    <InputLabel htmlFor="resultado_2" value="Resultado" />
                                    <select
                                        id="resultado_2"
                                        className="mt-1 block w-full rounded-2xl border-[var(--border-ui)] bg-[var(--bg-content)] text-[var(--text-primary)] px-4 py-3 focus:ring-[var(--solar-gold)] focus:border-[var(--solar-gold)]"
                                        value={data.resultado_visita_2}
                                        onChange={(e) => setData('resultado_visita_2', e.target.value)}
                                    >
                                        <option value="">Seleccione...</option>
                                        <option value="aprobada">Aprobada</option>
                                        <option value="ajustes_requeridos">Ajustes requeridos</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div>
                            <InputLabel htmlFor="costo" value="Costo visitas adicionales (COP)" />
                            <TextInput
                                id="costo"
                                type="number"
                                step="1000"
                                className="mt-1 block w-full"
                                value={data.costo_visitas_adicionales}
                                onChange={(e) => setData('costo_visitas_adicionales', e.target.value)}
                            />
                        </div>
                    </>
                )}

                <InputError message={errors.resultado_visita_1} />

                <PrimaryButton type="submit" disabled={processing}>
                    Guardar cambios
                </PrimaryButton>
            </form>

            <div className="mt-6 pt-6 border-t border-[var(--border-ui)]">
                <h3 className="font-outfit font-bold text-sm text-[var(--text-secondary)] uppercase tracking-wider mb-3">
                    Documentos de visita
                </h3>
                <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--border-ui)] cursor-pointer hover:border-[var(--solar-gold)]/30 transition-all text-sm">
                    <Upload className="h-4 w-4" />
                    Subir acta de visita
                    <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={handleFileUpload} disabled={uploading} />
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

            {(allowedTransitions.includes('medidor_bidireccional') || allowedTransitions.includes('completado')) && (
                <div className="mt-6 pt-6 border-t border-[var(--border-ui)] flex items-center justify-end gap-3">
                    {allowedTransitions.includes('medidor_bidireccional') && (
                        <PrimaryButton onClick={handleAdvance} className="flex items-center gap-2">
                            Avanzar a Medidor Bidireccional
                            <ArrowRight className="h-4 w-4" />
                        </PrimaryButton>
                    )}
                    {allowedTransitions.includes('completado') && (
                        <button
                            onClick={handleComplete}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 text-white font-bold hover:bg-emerald-600 transition-all shadow-lg"
                        >
                            Marcar como completado
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
