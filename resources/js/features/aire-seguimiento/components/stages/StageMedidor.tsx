import { useForm, router } from '@inertiajs/react';
import { Zap, Upload } from 'lucide-react';
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
    allowedTransitions: string[];
    documentos: AireDocumento[];
}

export default function StageMedidor({ seguimiento, allowedTransitions, documentos }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        requiere_medidor_bidireccional: seguimiento.requiere_medidor_bidireccional ?? false,
        fecha_solicitud_cambio_medidor: seguimiento.fecha_solicitud_cambio_medidor ?? '',
        fecha_instalacion_medidor: seguimiento.fecha_instalacion_medidor ?? '',
        numero_medidor_nuevo: seguimiento.numero_medidor_nuevo ?? '',
        tipo_medidor: seguimiento.tipo_medidor ?? '',
        fecha_inicio_facturacion_neta: seguimiento.fecha_inicio_facturacion_neta ?? '',
        comercializador_excedentes: seguimiento.comercializador_excedentes ?? '',
        numero_contrato_excedentes: seguimiento.numero_contrato_excedentes ?? '',
    });

    const [uploading, setUploading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('aire-seguimiento.update', seguimiento.id), {
            preserveScroll: true,
            onSuccess: () => showToast('Medidor actualizado', 'success'),
        });
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
        formData.append('stage', 'medidor_bidireccional');
        formData.append('tipo_documento', 'soporte_medidor');
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
                <div className="h-10 w-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
                    <Zap className="h-5 w-5 text-violet-400" />
                </div>
                <div>
                    <h2 className="font-outfit font-bold text-lg">Medidor Bidireccional</h2>
                    <p className="text-xs text-[var(--text-secondary)]">
                        Instalación del medidor bidireccional y configuración de facturación neta
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex items-center gap-4 mb-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            className="w-4 h-4 rounded border-[var(--border-ui)] text-[var(--solar-gold)] focus:ring-[var(--solar-gold)]/20 bg-transparent"
                            checked={data.requiere_medidor_bidireccional}
                            onChange={(e) => setData('requiere_medidor_bidireccional', e.target.checked)}
                        />
                        <span className="text-sm font-medium">Requiere medidor bidireccional</span>
                    </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <InputLabel htmlFor="fecha_solicitud" value="Fecha solicitud cambio medidor" />
                        <TextInput
                            id="fecha_solicitud"
                            type="date"
                            className="mt-1 block w-full"
                            value={data.fecha_solicitud_cambio_medidor}
                            onChange={(e) => setData('fecha_solicitud_cambio_medidor', e.target.value)}
                        />
                    </div>

                    <div>
                        <InputLabel htmlFor="fecha_instalacion" value="Fecha instalación medidor" />
                        <TextInput
                            id="fecha_instalacion"
                            type="date"
                            className="mt-1 block w-full"
                            value={data.fecha_instalacion_medidor}
                            onChange={(e) => setData('fecha_instalacion_medidor', e.target.value)}
                        />
                    </div>

                    <div>
                        <InputLabel htmlFor="numero_medidor" value="Número de medidor nuevo" />
                        <TextInput
                            id="numero_medidor"
                            type="text"
                            className="mt-1 block w-full"
                            value={data.numero_medidor_nuevo}
                            onChange={(e) => setData('numero_medidor_nuevo', e.target.value)}
                        />
                    </div>

                    <div>
                        <InputLabel htmlFor="tipo_medidor" value="Tipo de medidor" />
                        <TextInput
                            id="tipo_medidor"
                            type="text"
                            className="mt-1 block w-full"
                            value={data.tipo_medidor}
                            onChange={(e) => setData('tipo_medidor', e.target.value)}
                        />
                    </div>

                    <div>
                        <InputLabel htmlFor="fecha_facturacion" value="Fecha inicio facturación neta" />
                        <TextInput
                            id="fecha_facturacion"
                            type="date"
                            className="mt-1 block w-full"
                            value={data.fecha_inicio_facturacion_neta}
                            onChange={(e) => setData('fecha_inicio_facturacion_neta', e.target.value)}
                        />
                    </div>

                    <div>
                        <InputLabel htmlFor="comercializador" value="Comercializador de excedentes" />
                        <TextInput
                            id="comercializador"
                            type="text"
                            className="mt-1 block w-full"
                            value={data.comercializador_excedentes}
                            onChange={(e) => setData('comercializador_excedentes', e.target.value)}
                        />
                    </div>

                    <div>
                        <InputLabel htmlFor="contrato_excedentes" value="Número contrato excedentes" />
                        <TextInput
                            id="contrato_excedentes"
                            type="text"
                            className="mt-1 block w-full"
                            value={data.numero_contrato_excedentes}
                            onChange={(e) => setData('numero_contrato_excedentes', e.target.value)}
                        />
                    </div>
                </div>

                <InputError message={errors.numero_medidor_nuevo} />

                <PrimaryButton type="submit" disabled={processing}>
                    Guardar cambios
                </PrimaryButton>
            </form>

            <div className="mt-6 pt-6 border-t border-[var(--border-ui)]">
                <h3 className="font-outfit font-bold text-sm text-[var(--text-secondary)] uppercase tracking-wider mb-3">
                    Documentos del medidor
                </h3>
                <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--border-ui)] cursor-pointer hover:border-[var(--solar-gold)]/30 transition-all text-sm">
                    <Upload className="h-4 w-4" />
                    Subir soporte
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

            {allowedTransitions.includes('completado') && (
                <div className="mt-6 pt-6 border-t border-[var(--border-ui)] flex justify-end">
                    <button
                        onClick={handleComplete}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 text-white font-bold hover:bg-emerald-600 transition-all shadow-lg"
                    >
                        Marcar como completado
                    </button>
                </div>
            )}
        </div>
    );
}
