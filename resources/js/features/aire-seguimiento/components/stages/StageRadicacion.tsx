import { useForm, router } from '@inertiajs/react';
import { FileText, Upload, ArrowRight } from 'lucide-react';
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

export default function StageRadicacion({ seguimiento, allowedTransitions, documentos }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        fecha_radicacion: seguimiento.fecha_radicacion ?? '',
        numero_radicado: seguimiento.numero_radicado ?? '',
        observaciones_radicacion: seguimiento.observaciones_radicacion ?? '',
    });

    const [uploading, setUploading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('aire-seguimiento.update', seguimiento.id), {
            preserveScroll: true,
            onSuccess: () => showToast('Radicación actualizada', 'success'),
        });
    };

    const handleAdvance = () => {
        router.patch(route('aire-seguimiento.stage', seguimiento.id), {
            target_stage: 'revision_completitud',
        }, { preserveScroll: true });
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        const formData = new FormData();
        formData.append('stage', 'radicacion');
        formData.append('tipo_documento', 'formulario_conexion');
        formData.append('file', file);
        router.post(route('aire-seguimiento.documents', seguimiento.id), formData, {
            preserveScroll: true,
            onSuccess: () => { showToast('Documento cargado', 'success'); setUploading(false); },
            onError: () => setUploading(false),
        });
    };

    const canAdvance = allowedTransitions.includes('revision_completitud');

    return (
        <div className="glass rounded-[2rem] p-6 border border-[var(--border-ui)]">
            <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-amber-400" />
                </div>
                <div>
                    <h2 className="font-outfit font-bold text-lg">Radicación de Solicitud</h2>
                    <p className="text-xs text-[var(--text-secondary)]">
                        Diligencie y radique el formulario oficial ante Air-e
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <InputLabel htmlFor="fecha_radicacion" value="Fecha de radicación" />
                        <TextInput
                            id="fecha_radicacion"
                            type="date"
                            className="mt-1 block w-full"
                            value={data.fecha_radicacion}
                            onChange={(e) => setData('fecha_radicacion', e.target.value)}
                        />
                        <InputError message={errors.fecha_radicacion} />
                    </div>

                    <div>
                        <InputLabel htmlFor="numero_radicado" value="Número de radicado" />
                        <TextInput
                            id="numero_radicado"
                            type="text"
                            className="mt-1 block w-full"
                            value={data.numero_radicado}
                            onChange={(e) => setData('numero_radicado', e.target.value)}
                            placeholder="Asignado por Air-e"
                        />
                        <InputError message={errors.numero_radicado} />
                    </div>
                </div>

                <div>
                    <InputLabel htmlFor="observaciones" value="Observaciones" />
                    <textarea
                        id="observaciones"
                        className="mt-1 block w-full rounded-2xl border-[var(--border-ui)] bg-[var(--bg-content)] text-[var(--text-primary)] px-4 py-3 focus:ring-[var(--solar-gold)] focus:border-[var(--solar-gold)]"
                        rows={3}
                        value={data.observaciones_radicacion}
                        onChange={(e) => setData('observaciones_radicacion', e.target.value)}
                    />
                </div>

                <PrimaryButton type="submit" disabled={processing}>
                    Guardar cambios
                </PrimaryButton>
            </form>

            <div className="mt-6 pt-6 border-t border-[var(--border-ui)]">
                <h3 className="font-outfit font-bold text-sm text-[var(--text-secondary)] uppercase tracking-wider mb-3">
                    Documentos de radicación
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

            {canAdvance && (
                <div className="mt-6 pt-6 border-t border-[var(--border-ui)] flex justify-end">
                    <PrimaryButton onClick={handleAdvance} className="flex items-center gap-2">
                        Avanzar a Revisión de Completitud
                        <ArrowRight className="h-4 w-4" />
                    </PrimaryButton>
                </div>
            )}
        </div>
    );
}
