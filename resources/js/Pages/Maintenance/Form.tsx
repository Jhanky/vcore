import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { showToast } from '@/Components/Toast';

interface Props {
    maintenance?: any;
    technicians: any[];
    projects: any[];
    onClose: () => void;
}

export default function MaintenanceForm({ maintenance, technicians, projects, onClose }: Props) {
    const isEditing = !!maintenance;

    const { data, setData, post, put, processing, errors, reset } = useForm({
        project_id: maintenance?.project_id || '',
        title: maintenance?.title || '',
        description: maintenance?.description || '',
        type: maintenance?.type || 'preventivo',
        priority: maintenance?.priority || 'media',
        scheduled_date: maintenance?.scheduled_date || '',
        estimated_hours: maintenance?.estimated_hours || '',
        technicians: maintenance?.technicians?.map((t: any) => ({ id: t.id, role: t.pivot?.role || 'apoyo' })) || [],
    });

    useEffect(() => {
        if (maintenance) reset();
    }, [maintenance]);

    const handleTechnicianToggle = (techId: number) => {
        const exists = data.technicians.find((t: any) => t.id === techId);
        if (exists) {
            setData('technicians', data.technicians.filter((t: any) => t.id !== techId));
        } else {
            setData('technicians', [...data.technicians, { id: techId, role: 'apoyo' }]);
        }
    };

    const handleRoleChange = (techId: number, role: string) => {
        setData('technicians', data.technicians.map((t: any) => t.id === techId ? { ...t, role } : t));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEditing) {
            put(route('maintenances.update', maintenance.id), {
                onSuccess: () => {
                    showToast('Mantenimiento actualizado.', 'success');
                    onClose();
                },
            });
        } else {
            post(route('maintenances.store'), {
                onSuccess: () => {
                    showToast('Mantenimiento creado.', 'success');
                    onClose();
                    reset();
                },
            });
        }
    };

    return (
        <div className="p-6">
            <h2 className="text-xl font-bold font-outfit text-[var(--text-primary)] mb-6">
                {isEditing ? 'Editar Mantenimiento' : 'Nuevo Mantenimiento'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
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
                        <InputLabel value="Tipo" />
                        <select
                            value={data.type}
                            onChange={(e) => setData('type', e.target.value)}
                            className="w-full rounded-xl border-[var(--border-ui)] bg-transparent text-[var(--text-primary)] px-4 py-3 [&>option]:bg-[var(--bg-content)]"
                        >
                            <option value="preventivo">Preventivo</option>
                            <option value="correctivo">Correctivo</option>
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

                    <div>
                        <InputLabel value="Fecha programada" />
                        <input
                            type="date"
                            value={data.scheduled_date}
                            onChange={(e) => setData('scheduled_date', e.target.value)}
                            className="w-full rounded-xl border-[var(--border-ui)] bg-slate-500/5 text-[var(--text-primary)] px-4 py-3"
                            required
                        />
                        <InputError message={errors.scheduled_date} />
                    </div>

                    <div>
                        <InputLabel value="Horas estimadas" />
                        <input
                            type="number"
                            step="0.5"
                            min="0"
                            value={data.estimated_hours}
                            onChange={(e) => setData('estimated_hours', e.target.value)}
                            className="w-full rounded-xl border-[var(--border-ui)] bg-slate-500/5 text-[var(--text-primary)] px-4 py-3"
                            placeholder="Opcional"
                        />
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

                    <div className="md:col-span-2">
                        <InputLabel value="Técnicos asignados" />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                            {technicians?.map((tech: any) => {
                                const selected = data.technicians.find((t: any) => t.id === tech.id);
                                return (
                                    <div
                                        key={tech.id}
                                        onClick={() => handleTechnicianToggle(tech.id)}
                                        className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                                            selected ? 'border-brand-500 bg-brand-500/10' : 'border-[var(--border-ui)] hover:border-slate-500/30'
                                        }`}
                                    >
                                        <span className="text-sm text-[var(--text-primary)]">{tech.name}</span>
                                        {selected && (
                                            <select
                                                value={selected.role}
                                                onClick={(e) => e.stopPropagation()}
                                                onChange={(e) => handleRoleChange(tech.id, e.target.value)}
                                                className="text-xs rounded-lg border-[var(--border-ui)] bg-slate-500/10 text-[var(--text-primary)] px-2 py-1"
                                            >
                                                <option value="lider">Líder</option>
                                                <option value="apoyo">Apoyo</option>
                                            </select>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                        {(!technicians || technicians.length === 0) && (
                            <p className="text-sm text-[var(--text-secondary)] mt-2">No hay técnicos registrados.</p>
                        )}
                        <InputError message={errors.technicians} />
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-ui)]">
                    <SecondaryButton type="button" onClick={onClose} disabled={processing}>
                        Cancelar
                    </SecondaryButton>
                    <PrimaryButton disabled={processing}>
                        {isEditing ? 'Actualizar' : 'Crear Mantenimiento'}
                    </PrimaryButton>
                </div>
            </form>
        </div>
    );
}
