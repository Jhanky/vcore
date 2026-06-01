import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { FileText, Upload, Download, Edit2, Check, X, AlertCircle } from 'lucide-react';
import { showToast } from '@/Components/Toast';
import type { Project } from '@/features/projects/types';

interface ProjectDocumentsTabProps {
    project: Project;
}

export default function ProjectDocumentsTab({ project }: ProjectDocumentsTabProps) {
    const [documents, setDocuments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editValue, setEditValue] = useState('');
    const [saving, setSaving] = useState(false);

    const fetchDocuments = async () => {
        try {
            const response = await fetch(route('projects.documents-tab', project.id));
            const data = await response.json();
            setDocuments(data.documents || []);
        } catch (error) {
            console.error('Error fetching documents:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDocuments();
    }, []);

    const handleSaveText = async (fieldId: number) => {
        setSaving(true);
        const formData = new FormData();
        formData.append(`field_values[${fieldId}]`, editValue);

        router.post(route('projects.field-values.save', project.id), formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            onSuccess: () => {
                setEditingId(null);
                fetchDocuments();
                setSaving(false);
                showToast('Documento actualizado.', 'success');
            },
            onError: () => {
                setSaving(false);
                showToast('Error al guardar.', 'error');
            },
        });
    };

    const handleFileUpload = async (fieldId: number, file: File) => {
        const formData = new FormData();
        formData.append('state_field_id', String(fieldId));
        formData.append('file', file);

        try {
            const response = await fetch(route('projects.field-documents', project.id), {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content,
                },
                body: formData,
            });

            if (response.ok) {
                fetchDocuments();
            }
        } catch (error) {
            console.error('Error uploading file:', error);
        }
    };

    const startEdit = (doc: any) => {
        setEditingId(doc.id);
        setEditValue(doc.text_value || '');
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditValue('');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--solar-gold)]"></div>
            </div>
        );
    }

    return (
        <div className="glass rounded-[2rem] p-8">
            <h3 className="text-lg font-bold font-outfit text-[var(--text-primary)] mb-6 flex items-center gap-2">
                <FileText className="w-5 h-5 text-[var(--solar-gold)]" />
                Documentos y Datos del Proyecto
            </h3>

            <div className="space-y-4">
                {documents.map((doc) => (
                    <div
                        key={doc.id}
                        className={`p-4 rounded-2xl border ${
                            doc.field_type === 'file' && doc.document
                                ? 'border-emerald-500/20 bg-emerald-500/10'
                                : doc.field_type === 'file' && doc.is_required
                                ? 'border-red-500/20 bg-red-500/10'
                                : 'border-[var(--border-ui)] bg-slate-500/5'
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {doc.field_type === 'file' && doc.document ? (
                                    <Check className="w-5 h-5 text-emerald-400" />
                                ) : doc.field_type === 'file' && doc.is_required ? (
                                    <AlertCircle className="w-5 h-5 text-red-400" />
                                ) : (
                                    <FileText className="w-5 h-5 text-[var(--text-secondary)]" />
                                )}
                                <div>
                                    <div className="font-bold text-[var(--text-primary)]">
                                        {doc.label}
                                        {doc.is_required && <span className="text-red-400 ml-1">*</span>}
                                    </div>
                                    <div className="text-xs text-[var(--text-secondary)]">
                                        {doc.field_type === 'text' ? (
                                            doc.text_updated_by ? (
                                                <>Editado por {doc.text_updated_by}</>
                                            ) : (
                                                'Sin datos'
                                            )
                                        ) : doc.document ? (
                                            <>
                                                {doc.document.original_filename} - Subido por{' '}
                                                {doc.document.uploader_name}
                                            </>
                                        ) : (
                                            'Sin archivo'
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                {doc.field_type === 'text' ? (
                                    editingId === doc.id ? (
                                        <>
                                            <input
                                                type="text"
                                                value={editValue}
                                                onChange={(e) => setEditValue(e.target.value)}
                                                className="px-3 py-1 rounded-xl border border-[var(--border-ui)] bg-[var(--surface)] text-sm text-[var(--text-primary)]"
                                            />
                                            <button
                                                onClick={() => handleSaveText(doc.id)}
                                                disabled={saving}
                                                className="p-2 rounded-xl hover:bg-emerald-500/10 text-emerald-400"
                                            >
                                                <Check className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={cancelEdit}
                                                className="p-2 rounded-xl hover:bg-red-500/10 text-red-400"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <span className="text-sm text-[var(--text-secondary)]">
                                                {doc.text_value || '-'}
                                            </span>
                                            <button
                                                onClick={() => startEdit(doc)}
                                                className="p-2 rounded-xl hover:bg-slate-500/10 text-[var(--text-secondary)]"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                        </>
                                    )
                                ) : (
                                    <>
                                        {doc.document ? (
                                            <a
                                                href={route('projects.documents.download', [project.id, doc.document.id])}
                                                className="flex items-center gap-1 px-3 py-2 rounded-xl bg-[var(--solar-gold)]/10 text-[var(--solar-gold)] hover:bg-[var(--solar-gold)]/20"
                                            >
                                                <Download className="w-4 h-4" />
                                                <span className="text-sm">Descargar</span>
                                            </a>
                                        ) : null}
                                        <label className="cursor-pointer flex items-center gap-1 px-3 py-2 rounded-xl bg-[var(--solar-gold)]/10 text-[var(--solar-gold)] hover:bg-[var(--solar-gold)]/20">
                                            <Upload className="w-4 h-4" />
                                            <span className="text-sm">
                                                {doc.document ? 'Reemplazar' : 'Subir'}
                                            </span>
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept={doc.accepted_types ? `.${doc.accepted_types.replace(/,/g, ',.')}` : undefined}
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        handleFileUpload(doc.id, file);
                                                    }
                                                }}
                                            />
                                        </label>
                                    </>
                                )}
                            </div>
                        </div>

                        {doc.field_type === 'file' && doc.accepted_types && (
                            <p className="text-xs text-[var(--text-secondary)] mt-2">
                                Formatos aceptados: {doc.accepted_types}
                            </p>
                        )}
                    </div>
                ))}

                {documents.length === 0 && (
                    <p className="text-sm text-[var(--text-secondary)] text-center py-8">
                        No hay documentos definidos para este estado
                    </p>
                )}
            </div>
        </div>
    );
}