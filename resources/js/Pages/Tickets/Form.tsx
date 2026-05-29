import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { showToast } from '@/Components/Toast';

interface Props {
    ticket?: any;
    technicians: any[];
    projects: any[];
    onClose: () => void;
}

export default function TicketForm({ ticket, technicians, projects, onClose }: Props) {
    const isEditing = !!ticket;

    const { data, setData, post, put, processing, errors, reset } = useForm({
        project_id: ticket?.project_id || '',
        title: ticket?.title || '',
        description: ticket?.description || '',
        category: ticket?.category || 'otro',
        priority: ticket?.priority || 'media',
        assigned_to: ticket?.assigned_to || '',
        status: ticket?.status || 'abierto',
    });

    useEffect(() => {
        if (ticket) reset();
    }, [ticket]);

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

    return (
        <div className="p-6">
            <h2 className="text-xl font-bold font-outfit text-[var(--text-primary)] mb-6">
                {isEditing ? 'Editar Ticket' : 'Nuevo Ticket'}
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
