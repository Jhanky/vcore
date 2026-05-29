import { useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { showToast } from '@/Components/Toast';
import {
    Upload,
    FileText,
    X,
    File,
    Image as ImageIcon,
    FileSpreadsheet,
    Trash2,
    Download,
    CheckCircle,
    AlertCircle
} from 'lucide-react';

export default function EvidenceForm({ project }) {
    const [previewFile, setPreviewFile] = useState(null);
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        description: '',
        file: null,
    });

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setData('file', file);
        if (!data.name) {
            const fileName = file.name.split('.')[0];
            setData('name', fileName);
        }
        e.target.value = '';
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!data.file) return;

        const formData = new FormData();
        formData.append('file', data.file);
        formData.append('name', data.name);
        if (data.description) {
            formData.append('description', data.description);
        }

        post(route('projects.documents', project.id), {
            headers: { 'Content-Type': 'multipart/form-data' },
            onSuccess: () => {
                reset();
                setPreviewFile(null);
                showToast('Documento subido.', 'success');
            },
        });
    };

    const handleDeleteDocument = (documentId) => {
        if (confirm('¿Está seguro de eliminar este documento?')) {
            router.delete(route('projects.documents.destroy', [project.id, documentId]), {
                onSuccess: () => {
                    router.reload({ only: ['project'] });
                    showToast('Documento eliminado.', 'success');
                },
            });
        }
    };

    const getFileIcon = (mimeType) => {
        if (mimeType?.includes('image')) return ImageIcon;
        if (mimeType?.includes('pdf')) return FileText;
        if (mimeType?.includes('spreadsheet') || mimeType?.includes('excel')) return FileSpreadsheet;
        return File;
    };

    const formatFileSize = (bytes) => {
        if (!bytes) return '-';
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('es-CO', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <div className="glass rounded-[2rem] p-8 border border-[var(--border-ui)]/30">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-bold font-outfit text-[var(--text-primary)] flex items-center gap-2">
                        <Upload className="w-5 h-5 text-[var(--solar-gold)]" />
                        Cargar Evidencias
                    </h2>
                    <p className="text-sm text-[var(--text-secondary)] mt-1">
                        {project.code} - {project.name}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <InputLabel value="Nombre del documento" />
                        <input
                            type="text"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            className="w-full rounded-xl border-[var(--border-ui)] bg-slate-500/5 text-[var(--text-primary)] shadow-sm transition-all focus:border-[var(--solar-gold)] focus:ring focus:ring-[var(--solar-gold)]/20 px-4 py-3"
                            placeholder="Nombre del documento"
                            required
                        />
                        <InputError message={errors.name} className="mt-2" />
                    </div>

                    <div>
                        <InputLabel value="Descripción (opcional)" />
                        <input
                            type="text"
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            className="w-full rounded-xl border-[var(--border-ui)] bg-slate-500/5 text-[var(--text-primary)] shadow-sm transition-all focus:border-[var(--solar-gold)] focus:ring focus:ring-[var(--solar-gold)]/20 px-4 py-3"
                            placeholder="Breve descripción del archivo"
                        />
                        <InputError message={errors.description} className="mt-2" />
                    </div>
                </div>

                <div>
                    <InputLabel value="Archivo" />
                    <div className="border-2 border-dashed border-[var(--border-ui)] rounded-2xl p-8 text-center hover:border-[var(--solar-gold)]/50 transition-colors">
                        {data.file ? (
                            <div className="flex items-center justify-center gap-4">
                                {(() => {
                                    const FileIcon = getFileIcon(data.file.type);
                                    return <FileIcon className="w-10 h-10 text-[var(--solar-gold)]" />;
                                })()}
                                <div className="text-left">
                                    <p className="font-bold text-[var(--text-primary)]">{data.file.name}</p>
                                    <p className="text-sm text-[var(--text-secondary)]">
                                        {formatFileSize(data.file.size)}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setData('file', null);
                                        setPreviewFile(null);
                                    }}
                                    className="p-2 rounded-xl hover:bg-red-500/10 text-red-400 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        ) : (
                            <>
                                <Upload className="w-12 h-12 text-[var(--text-secondary)]/40 mx-auto mb-4" />
                                <p className="text-[var(--text-secondary)] mb-2">
                                    Arrastre un archivo aquí o haga clic para seleccionar
                                </p>
                                <p className="text-xs text-[var(--text-secondary)]/60">
                                    PDF, JPG, PNG, DOC, XLS hasta 10MB
                                </p>
                            </>
                        )}
                        <input
                            type="file"
                            onChange={handleFileSelect}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.doc,.docx,.xls,.xlsx"
                        />
                    </div>
                    <InputError message={errors.file} className="mt-2" />
                </div>

                <div className="flex justify-end gap-3">
                    <SecondaryButton
                        type="button"
                        onClick={() => {
                            reset();
                            setPreviewFile(null);
                        }}
                        disabled={processing}
                    >
                        Limpiar
                    </SecondaryButton>
                    <PrimaryButton disabled={!data.file || processing}>
                        {processing ? (
                            <span className="flex items-center gap-2">
                                <span className="w-4 h-4 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" />
                                Subiendo...
                            </span>
                        ) : (
                            <span className="flex items-center gap-2">
                                <Upload className="w-4 h-4" />
                                Subir Evidencia
                            </span>
                        )}
                    </PrimaryButton>
                </div>
            </form>

            {project.documents && project.documents.length > 0 && (
                <div className="mt-10">
                    <h3 className="text-lg font-bold font-outfit text-[var(--text-primary)] mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-[var(--solar-gold)]" />
                        Evidencias Cargadas
                    </h3>
                    <div className="space-y-3">
                        {project.documents.map((doc) => {
                            const FileIcon = getFileIcon(doc.mime_type);
                            return (
                                <div
                                    key={doc.id}
                                    className="flex items-center justify-between p-4 rounded-xl border border-[var(--border-ui)] bg-slate-500/5 hover:bg-slate-500/10 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-[var(--solar-gold)]/10 flex items-center justify-center">
                                            <FileIcon className="w-5 h-5 text-[var(--solar-gold)]" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-[var(--text-primary)]">{doc.name}</p>
                                            <div className="flex items-center gap-3 text-xs text-[var(--text-secondary)]">
                                                <span>{formatFileSize(doc.file_size)}</span>
                                                <span>•</span>
                                                <span>{formatDate(doc.created_at)}</span>
                                                {doc.description && (
                                                    <>
                                                        <span>•</span>
                                                        <span className="max-w-[200px] truncate">{doc.description}</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <a
                                            href={route('projects.documents.download', [project.id, doc.id])}
                                            className="p-2 rounded-xl hover:bg-[var(--solar-gold)]/10 text-[var(--text-secondary)] hover:text-[var(--solar-gold)] transition-colors"
                                            title="Descargar"
                                        >
                                            <Download className="w-5 h-5" />
                                        </a>
                                        <button
                                            onClick={() => handleDeleteDocument(doc.id)}
                                            className="p-2 rounded-xl hover:bg-red-500/10 text-[var(--text-secondary)] hover:text-red-400 transition-colors"
                                            title="Eliminar"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {(!project.documents || project.documents.length === 0) && (
                <div className="mt-10 text-center py-8 border border-dashed border-[var(--border-ui)] rounded-2xl">
                    <FileText className="w-12 h-12 text-[var(--text-secondary)]/20 mx-auto mb-3" />
                    <p className="text-[var(--text-secondary)]">
                        No hay evidencias cargadas para este proyecto
                    </p>
                </div>
            )}
        </div>
    );
}
