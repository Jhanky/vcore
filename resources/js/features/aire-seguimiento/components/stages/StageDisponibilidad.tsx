import { useForm, router } from '@inertiajs/react';
import { Wifi, Upload, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { showToast } from '@/Components/Toast';
import { formatDate, SEMAFORO_COLORS, SEMAFORO_LABELS } from '../../utils';
import type { AireSeguimiento, AireDocumento, ColorSemaforo } from '../../types';

interface Props {
    seguimiento: AireSeguimiento;
    fechasCalculadas: Record<string, string>;
    allowedTransitions: string[];
    documentos: AireDocumento[];
}

export default function StageDisponibilidad({ seguimiento, fechasCalculadas, allowedTransitions, documentos }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        fecha_consulta_disponibilidad: seguimiento.fecha_consulta_disponibilidad ?? '',
        color_resultado_oficial: seguimiento.color_resultado_oficial ?? '',
        porcentaje_resultado_oficial: seguimiento.porcentaje_resultado_oficial?.toString() ?? '',
        requiere_estudio_conexion: seguimiento.requiere_estudio_conexion ?? false,
    });

    const [uploading, setUploading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('aire-seguimiento.update', seguimiento.id), {
            preserveScroll: true,
            onSuccess: () => showToast('Disponibilidad actualizada', 'success'),
        });
    };

    const handleAdvance = () => {
        router.patch(route('aire-seguimiento.stage', seguimiento.id), {
            target_stage: 'radicacion',
        }, { preserveScroll: true });
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        const formData = new FormData();
        formData.append('stage', 'consulta_disponibilidad');
        formData.append('tipo_documento', 'resultado_disponibilidad');
        formData.append('file', file);
        router.post(route('aire-seguimiento.documents', seguimiento.id), formData, {
            preserveScroll: true,
            onSuccess: () => {
                showToast('Documento cargado', 'success');
                setUploading(false);
            },
            onError: () => setUploading(false),
        });
    };

    const canAdvance = allowedTransitions.includes('radicacion');

    return (
        <div className="glass rounded-[2rem] p-6 border border-[var(--border-ui)]">
            <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                    <Wifi className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                    <h2 className="font-outfit font-bold text-lg">Consulta de Disponibilidad de Red</h2>
                    <p className="text-xs text-[var(--text-secondary)]">
                        Registre el resultado oficial de la consulta de disponibilidad en el portal Air-e
                    </p>
                </div>
            </div>

            {/* Semáforo preliminar */}
            {seguimiento.color_resultado_preliminar && (
                <div className={`rounded-2xl p-4 mb-6 border ${SEMAFORO_COLORS[seguimiento.color_resultado_preliminar]}`}>
                    <p className="text-xs font-bold uppercase tracking-wider mb-1">Resultado preliminar</p>
                    <p className="font-bold text-lg">
                        {SEMAFORO_LABELS[seguimiento.color_resultado_preliminar]}
                    </p>
                    {seguimiento.porcentaje_ocupacion !== null && (
                        <p className="text-sm opacity-80">
                            Ocupación estimada: {seguimiento.porcentaje_ocupacion}%
                        </p>
                    )}
                    <p className="text-xs mt-2 opacity-60">
                        Este es un cálculo orientativo. El color oficial lo asigna Air-e al ingresar el código del transformador.
                    </p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <InputLabel htmlFor="fecha_consulta" value="Fecha de consulta" />
                        <TextInput
                            id="fecha_consulta"
                            type="date"
                            className="mt-1 block w-full"
                            value={data.fecha_consulta_disponibilidad}
                            onChange={(e) => setData('fecha_consulta_disponibilidad', e.target.value)}
                        />
                    </div>

                    <div>
                        <InputLabel htmlFor="color_oficial" value="Color resultado oficial" />
                        <select
                            id="color_oficial"
                            className="mt-1 block w-full rounded-2xl border-[var(--border-ui)] bg-[var(--bg-content)] text-[var(--text-primary)] px-4 py-3 focus:ring-[var(--solar-gold)] focus:border-[var(--solar-gold)]"
                            value={data.color_resultado_oficial}
                            onChange={(e) => setData('color_resultado_oficial', e.target.value)}
                        >
                            <option value="">Seleccione...</option>
                            <option value="verde">Verde</option>
                            <option value="amarillo">Amarillo</option>
                            <option value="naranja">Naranja</option>
                            <option value="rojo">Rojo</option>
                        </select>
                    </div>

                    <div>
                        <InputLabel htmlFor="porcentaje" value="Porcentaje resultado (%)" />
                        <TextInput
                            id="porcentaje"
                            type="number"
                            step="0.01"
                            className="mt-1 block w-full"
                            value={data.porcentaje_resultado_oficial}
                            onChange={(e) => setData('porcentaje_resultado_oficial', e.target.value)}
                        />
                    </div>

                    <div className="flex items-end pb-3">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                className="w-4 h-4 rounded border-[var(--border-ui)] text-[var(--solar-gold)] focus:ring-[var(--solar-gold)]/20 bg-transparent"
                                checked={data.requiere_estudio_conexion}
                                onChange={(e) => setData('requiere_estudio_conexion', e.target.checked)}
                            />
                            <span className="text-sm font-medium">Requiere estudio de conexión</span>
                        </label>
                    </div>
                </div>

                <InputError message={errors.fecha_consulta_disponibilidad} />
                <InputError message={errors.color_resultado_oficial} />

                <PrimaryButton type="submit" disabled={processing} className="mt-2">
                    Guardar cambios
                </PrimaryButton>
            </form>

            {/* Documentos */}
            <div className="mt-6 pt-6 border-t border-[var(--border-ui)]">
                <h3 className="font-outfit font-bold text-sm text-[var(--text-secondary)] uppercase tracking-wider mb-3">
                    Documentos de disponibilidad
                </h3>

                <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--border-ui)] cursor-pointer hover:border-[var(--solar-gold)]/30 transition-all text-sm">
                    <Upload className="h-4 w-4" />
                    Subir resultado PDF
                    <input type="file" accept=".pdf" className="hidden" onChange={handleFileUpload} disabled={uploading} />
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

            {/* Transición */}
            {canAdvance && (
                <div className="mt-6 pt-6 border-t border-[var(--border-ui)] flex justify-end">
                    <PrimaryButton onClick={handleAdvance} className="flex items-center gap-2">
                        Avanzar a Radicación
                        <ArrowRight className="h-4 w-4" />
                    </PrimaryButton>
                </div>
            )}
        </div>
    );
}
