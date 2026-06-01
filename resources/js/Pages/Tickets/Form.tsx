import { useForm } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { showToast } from '@/Components/Toast';
import { FileText, Image, Video, X, Upload } from 'lucide-react';

interface Props {
    ticket?: any;
    technicians: any[];
    projects: any[];
    onClose: () => void;
}

interface SelectedFile {
    file: File;
    preview?: string;
}

export default function TicketForm({ ticket, technicians, projects, onClose }: Props) {
    const isEditing = !!ticket;
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        project_id: ticket?.project_id || '',
        title: ticket?.title || '',
        description: ticket?.description || '',
        category: ticket?.category || 'otro',
        priority: ticket?.priority || 'media',
        assigned_to: ticket?.assigned_to || '',
        status: ticket?.status || 'abierto',
        files: [] as File[],
    });

    useEffect(() => {
        if (ticket) reset();
    }, [ticket]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const newFiles: SelectedFile[] = files.map((file) => ({
            file,
            preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
        }));
        setSelectedFiles((prev) => [...prev, ...newFiles]);
        setData('files', [...data.files, ...files]);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const removeFile = (index: number) => {
        setSelectedFiles((prev) => {
            const file = prev[index];
            if (file.preview) URL.revokeObjectURL(file.preview);
            return prev.filter((_, i) => i !== index);
        });
        setData('files', data.files.filter((_, i) => i !== index));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEditing) {
            put(route('tickets.update', ticket.id), {
                onSuccess: () => {
                    showToast('Ticket actualizado.', 'success');
                    onClose();
                },
            });
        } else {
            post(route('tickets.store'), {
                onSuccess: () => {
                    showToast('Ticket creado.', 'success');
                    onClose();
                    reset();
                },
            });
        }
    };

    const fileIcon = (file: SelectedFile) => {
        if (file.file.type.startsWith('image/')) return <Image className="h-5 w-5 text-emerald-400" />;
        if (file.file.type.startsWith('video/')) return <Video className="h-5 w-5 text-purple-400" />;
        return <FileText className="h-5 w-5 text-blue-400" />;
    };

    const formatSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    return (
        <div className="p-4 sm:p-6">
            <h2 className="text-xl font-bold font-outfit text-[var(--text-primary)] mb-6">
                {isEditing ? 'Editar Ticket' : 'Nuevo Ticket'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6" encType="multipart/form-data">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <InputLabel value="Título" />
                        <input
                            type="text"
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                            className="w-full rounded-xl border-[var(--border-ui)] bg-slate-500/5 text-[var(--text-primary)] px-4 py-3"
                            required
                        />
                        <InputError message={errors.title} />
                    </div>

                    <div className="md:col-span-2">
                        <InputLabel value="Descripción" />
                        <textarea
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            className="w-full rounded-xl border-[var(--border-ui)] bg-slate-500/5 text-[var(--text-primary)] px-4 py-3"
                            rows={3}
                        />
                        <InputError message={errors.description} />
                    </div>

                    <div>
                        <InputLabel value="Categoría" />
                        <select
                            value={data.category}
                            onChange={(e) => setData('category', e.target.value)}
                            className="w-full rounded-xl border-[var(--border-ui)] bg-transparent text-[var(--text-primary)] px-4 py-3 [&>option]:bg-[var(--bg-content)]"
                        >
                            <option value="electrico">Eléctrico</option>
                            <option value="estructural">Estructural</option>
                            <option value="equipo">Equipo</option>
                            <option value="comunicacion">Comunicación</option>
                            <option value="otro">Otro</option>
                        </select>
                    </div>

                    <div>
                        <InputLabel value="Prioridad" />
                        <select
                            value={data.priority}
                            onChange={(e) => setData('priority', e.target.value)}
                            className="w-full rounded-xl border-[var(--border-ui)] bg-transparent text-[var(--text-primary)] px-4 py-3 [&>option]:bg-[var(--bg-content)]"
                        >
                            <option value="baja">Baja</option>
                            <option value="media">Media</option>
                            <option value="alta">Alta</option>
                            <option value="critica">Crítica</option>
                        </select>
                    </div>

                    {isEditing && (
                        <div>
                            <InputLabel value="Estado" />
                            <select
                                value={data.status}
                                onChange={(e) => setData('status', e.target.value)}
                                className="w-full rounded-xl border-[var(--border-ui)] bg-transparent text-[var(--text-primary)] px-4 py-3 [&>option]:bg-[var(--bg-content)]"
                            >
                                <option value="abierto">Abierto</option>
                                <option value="en_progreso">En Progreso</option>
                                <option value="resuelto">Resuelto</option>
                                <option value="cerrado">Cerrado</option>
                            </select>
                        </div>
                    )}

                    <div>
                        <InputLabel value="Asignar a técnico" />
                        <select
                            value={data.assigned_to}
                            onChange={(e) => setData('assigned_to', e.target.value)}
                            className="w-full rounded-xl border-[var(--border-ui)] bg-transparent text-[var(--text-primary)] px-4 py-3 [&>option]:bg-[var(--bg-content)]"
                        >
                            <option value="">Sin asignar</option>
                            {technicians?.map((t: any) => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <InputLabel value="Proyecto (opcional)" />
                        <select
                            value={data.project_id}
                            onChange={(e) => setData('project_id', e.target.value)}
                            className="w-full rounded-xl border-[var(--border-ui)] bg-transparent text-[var(--text-primary)] px-4 py-3 [&>option]:bg-[var(--bg-content)]"
                        >
                            <option value="">Sin proyecto</option>
                            {projects?.map((p: any) => (
                                <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {!isEditing && (
                    <div>
                        <InputLabel value="Archivos adjuntos (imagen, documento o video)" />
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="mt-1 flex cursor-pointer items-center justify-center gap-3 rounded-xl border-2 border-dashed border-[var(--border-ui)] bg-slate-500/5 px-4 py-6 text-sm text-[var(--text-secondary)] hover:border-[var(--solar-gold)]/50 hover:text-[var(--solar-gold)] transition-colors"
                        >
                            <Upload className="h-5 w-5" />
                            <span>Haz clic para seleccionar archivos</span>
                        </div>

                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx"
                            onChange={handleFileSelect}
                            className="hidden"
                        />

                        {selectedFiles.length > 0 && (
                            <div className="mt-3 space-y-2">
                                {selectedFiles.map((sf, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center gap-3 rounded-xl border border-[var(--border-ui)] bg-slate-500/5 px-3 py-2"
                                    >
                                        {sf.preview ? (
                                            <img
                                                src={sf.preview}
                                                alt={sf.file.name}
                                                className="h-10 w-10 rounded-lg object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-500/10">
                                                {fileIcon(sf)}
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                                                {sf.file.name}
                                            </p>
                                            <p className="text-xs text-[var(--text-secondary)]">
                                                {formatSize(sf.file.size)}
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeFile(i)}
                                            className="shrink-0 rounded-lg p-1 text-[var(--text-secondary)] hover:bg-red-500/10 hover:text-red-400 transition-colors"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <p className="mt-2 text-xs text-[var(--text-secondary)]">
                            Formatos permitidos: JPG, PNG, GIF, WebP, PDF, DOC, DOCX, XLS, XLSX, MP4, MOV, AVI — Máx. 20MB por archivo
                        </p>
                        {(errors as any)['files.0'] && <InputError message={(errors as any)['files.0']} />}
                    </div>
                )}

                <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-ui)]">
                    <SecondaryButton type="button" onClick={onClose} disabled={processing}>
                        Cancelar
                    </SecondaryButton>
                    <PrimaryButton disabled={processing}>
                        {isEditing ? 'Actualizar' : 'Crear Ticket'}
                    </PrimaryButton>
                </div>
            </form>
        </div>
    );
}
