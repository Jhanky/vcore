import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { Check, AlertCircle, Paperclip } from 'lucide-react';
import { showToast } from '@/Components/Toast';
import type { Project } from '@/features/projects/types';

interface ProjectFieldFormProps {
    project: Project;
}

export default function ProjectFieldForm({ project }: ProjectFieldFormProps) {
    const [fields, setFields] = useState<any[]>([]);
    const [fieldValues, setFieldValues] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const fetchFieldValues = async () => {
        try {
            const response = await fetch(route('projects.field-values', project.id));
            const data = await response.json();
            setFields(data.fields || []);

            const values: Record<string, any> = {};
            data.fields?.forEach((field: any) => {
                if (field.field_type === 'text') {
                    values[field.id] = field.text_value || '';
                }
            });
            setFieldValues(values);
        } catch (error) {
            console.error('Error fetching field values:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFieldValues();
    }, []);

    const handleTextChange = (fieldId: number, value: string) => {
        setFieldValues((prev) => ({
            ...prev,
            [fieldId]: value,
        }));
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

            const data = await response.json();

            if (data.success) {
                fetchFieldValues();
            }
        } catch (error) {
            console.error('Error uploading file:', error);
        }
    };

    const handleSave = () => {
        setSaving(true);
        const formData = new FormData();

        Object.entries(fieldValues).forEach(([fieldId, value]) => {
            formData.append(`field_values[${fieldId}]`, value);
        });

        router.post(route('projects.field-values.save', project.id), formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            onSuccess: () => {
                setSaving(false);
                fetchFieldValues();
                showToast('Campos guardados.', 'success');
            },
            onError: () => {
                setSaving(false);
                showToast('Error al guardar campos.', 'error');
            },
        });
    };

    const requiredFields = fields.filter((f) => f.is_required);
    const completedRequired = requiredFields.filter((f) => {
        if (f.field_type === 'text') {
            return fieldValues[f.id]?.trim();
        }
        if (f.field_type === 'file') {
            return f.document;
        }
        return false;
    });

    const progress =
        requiredFields.length > 0
            ? Math.round((completedRequired.length / requiredFields.length) * 100)
            : 100;

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--solar-gold)]"></div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="space-y-4">
                {fields.map((field) => (
                    <div key={field.id}>
                        <label className="block text-sm font-bold text-[var(--text-secondary)] mb-2">
                            {field.label}
                            {field.is_required && <span className="text-red-400 ml-1">*</span>}
                        </label>

                        {field.field_type === 'text' && (
                            <input
                                type="text"
                                value={fieldValues[field.id] || ''}
                                onChange={(e) => handleTextChange(field.id, e.target.value)}
                                className="w-full rounded-xl border-[var(--border-ui)] bg-[var(--surface)] focus:border-[var(--solar-gold)] focus:ring focus:ring-[var(--solar-gold)]/20 text-[var(--text-primary)]"
                            />
                        )}

                        {field.field_type === 'file' && (
                            <div>
                                {field.document ? (
                                    <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                                        <Check className="w-4 h-4 text-emerald-400" />
                                        <span className="text-sm text-[var(--text-primary)] flex-1 truncate">
                                            {field.document.original_filename}
                                        </span>
                                        <span className="text-xs text-emerald-400">Subido</span>
                                    </div>
                                ) : (
                                    <div className="relative">
                                        <input
                                            type="file"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    handleFileUpload(field.id, file);
                                                }
                                            }}
                                            className="block w-full text-sm text-[var(--text-secondary)] file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-[var(--solar-gold)]/10 file:text-[var(--solar-gold)] hover:file:bg-[var(--solar-gold)]/20"
                                            accept={
                                                field.accepted_types
                                                    ? `.${field.accepted_types.replace(/,/g, ',.')}`
                                                    : undefined
                                            }
                                        />
                                        {field.accepted_types && (
                                            <p className="text-xs text-[var(--text-secondary)] mt-1">
                                                Formatos: {field.accepted_types}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}

                {fields.length === 0 && (
                    <p className="text-sm text-[var(--text-secondary)] text-center py-4">
                        No hay campos definidos para este estado
                    </p>
                )}
            </div>

            {fields.length > 0 && (
                <>
                    <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-[var(--text-secondary)]">Progreso</span>
                        <span className="text-[var(--text-primary)] font-bold">{progress}%</span>
                    </div>
                    <div className="w-full bg-[var(--border-ui)] rounded-full h-2">
                        <div
                            className="bg-[var(--solar-gold)] h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        />
                    </div>

                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="w-full bg-[var(--solar-gold)] text-slate-900 py-3 px-4 rounded-xl font-bold hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        {saving ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </>
            )}
        </div>
    );
}