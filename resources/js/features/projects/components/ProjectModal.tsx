import { useEffect } from 'react';
import { useForm, router } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { showToast } from '@/Components/Toast';

interface ProjectModalProps {
    show: boolean;
    onClose: () => void;
    project?: any;
    clients?: any[];
    users?: any[];
}

export default function ProjectModal({ show, onClose, project = null, clients = [], users = [] }: ProjectModalProps) {
    const { data, setData, patch, processing, errors, reset } = useForm({
        client_id: project?.client_id || '',
        name: project?.name || '',
        description: project?.description || '',
        installation_address: project?.installation_address || '',
        start_date: project?.start_date || '',
        estimated_end_date: project?.estimated_end_date || '',
        contracted_value_cop: project?.contracted_value_cop || '',
        total_cost_cop: project?.total_cost_cop || '',
        project_manager_id: project?.project_manager_id || '',
        technical_leader_id: project?.technical_leader_id || '',
        priority: project?.priority || 'media',
        is_active: project?.is_active ?? true,
        notes: project?.notes || '',
    });

    useEffect(() => {
        if (project) {
            setData({
                client_id: project.client_id || '',
                name: project.name || '',
                description: project.description || '',
                installation_address: project.installation_address || '',
                start_date: project.start_date || '',
                estimated_end_date: project.estimated_end_date || '',
                contracted_value_cop: project.contracted_value_cop || '',
                total_cost_cop: project.total_cost_cop || '',
                project_manager_id: project.project_manager_id || '',
                technical_leader_id: project.technical_leader_id || '',
                priority: project.priority || 'media',
                is_active: project.is_active ?? true,
                notes: project.notes || '',
            });
        }
    }, [project, show]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!project) return;

        patch(route('projects.update', project.id), {
            onSuccess: () => {
                onClose();
                reset();
                showToast('Proyecto actualizado.', 'success');
                router.reload({ preserveUrl: true });
            },
        });
    };

    const labelClass = "block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5";

    return (
        <Modal show={show} onClose={onClose} maxWidth="xl">
            <div className="text-[var(--text-primary)]">
                <div className="px-6 py-4 border-b border-[var(--border-ui)]/50 bg-slate-500/5">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold font-outfit text-[var(--text-primary)]">Editar Proyecto</h2>
                        {project?.code && (
                            <span className="text-xs text-[var(--text-secondary)] bg-slate-500/10 px-2.5 py-1 rounded-full border border-[var(--border-ui)]">
                                {project.code}
                            </span>
                        )}
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="px-4 sm:px-6 py-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4">
                        <div className="md:col-span-2">
                            <label className={labelClass}>Nombre del Proyecto</label>
                            <TextInput
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className="block w-full"
                                required
                            />
                            <InputError message={errors.name} className="mt-1" />
                        </div>

                        <div>
                            <label className={labelClass}>Cliente</label>
                            <select
                                value={data.client_id}
                                disabled
                                className="block w-full rounded-xl border-[var(--border-ui)] bg-slate-500/10 text-[var(--text-secondary)] cursor-not-allowed px-3 py-2.5 text-sm"
                            >
                                {clients.map((c) => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className={labelClass}>Prioridad</label>
                            <select
                                value={data.priority}
                                onChange={(e) => setData('priority', e.target.value)}
                                className="block w-full rounded-xl border-[var(--border-ui)] bg-transparent focus:border-[var(--solar-gold)] focus:ring focus:ring-[var(--solar-gold)]/20 text-[var(--text-primary)] px-3 py-2.5 text-sm [&>option]:bg-[var(--bg-content)]"
                            >
                                <option value="baja">Baja</option>
                                <option value="media">Media</option>
                                <option value="alta">Alta</option>
                            </select>
                        </div>

                        <div className="col-span-2">
                            <label className={labelClass}>Descripción</label>
                            <textarea
                                value={data.description || ''}
                                onChange={(e) => setData('description', e.target.value)}
                                className="block w-full rounded-xl border-[var(--border-ui)] bg-transparent text-[var(--text-primary)] focus:border-[var(--solar-gold)] focus:ring focus:ring-[var(--solar-gold)]/20 resize-none px-3 py-2.5 text-sm"
                                rows={2}
                            />
                            <InputError message={errors.description} className="mt-1" />
                        </div>

                        <div className="col-span-2">
                            <label className={labelClass}>Dirección de Instalación</label>
                            <TextInput
                                value={data.installation_address}
                                onChange={(e) => setData('installation_address', e.target.value)}
                                className="block w-full"
                            />
                            <InputError message={errors.installation_address} className="mt-1" />
                        </div>

                        <div>
                            <label className={labelClass}>Fecha de Inicio</label>
                            <TextInput
                                type="date"
                                value={data.start_date}
                                onChange={(e) => setData('start_date', e.target.value)}
                                className="block w-full"
                            />
                            <InputError message={errors.start_date} className="mt-1" />
                        </div>

                        <div>
                            <label className={labelClass}>Fin Estimado</label>
                            <TextInput
                                type="date"
                                value={data.estimated_end_date}
                                onChange={(e) => setData('estimated_end_date', e.target.value)}
                                className="block w-full"
                            />
                            <InputError message={errors.estimated_end_date} className="mt-1" />
                        </div>

                        <div>
                            <label className={labelClass}>Valor Contratado (COP)</label>
                            <TextInput
                                type="number"
                                step="0.01"
                                value={data.contracted_value_cop}
                                onChange={(e) => setData('contracted_value_cop', e.target.value)}
                                className="block w-full"
                            />
                            <InputError message={errors.contracted_value_cop} className="mt-1" />
                        </div>

                        <div>
                            <label className={labelClass}>Costo Total (COP)</label>
                            <TextInput
                                type="number"
                                step="0.01"
                                value={data.total_cost_cop}
                                onChange={(e) => setData('total_cost_cop', e.target.value)}
                                className="block w-full"
                            />
                            <InputError message={errors.total_cost_cop} className="mt-1" />
                        </div>

                        <div>
                            <label className={labelClass}>Estado</label>
                            <select
                                value={data.is_active ? '1' : '0'}
                                onChange={(e) => setData('is_active', e.target.value === '1')}
                                className="block w-full rounded-xl border-[var(--border-ui)] bg-transparent focus:border-[var(--solar-gold)] focus:ring focus:ring-[var(--solar-gold)]/20 text-[var(--text-primary)] px-3 py-2.5 text-sm [&>option]:bg-[var(--bg-content)]"
                            >
                                <option value="1">Activo</option>
                                <option value="0">Inactivo</option>
                            </select>
                            <InputError message={errors.is_active} className="mt-1" />
                        </div>

                        <div>
                            <label className={labelClass}>Gerente de Proyecto</label>
                            <select
                                value={data.project_manager_id}
                                onChange={(e) => setData('project_manager_id', e.target.value)}
                                className="block w-full rounded-xl border-[var(--border-ui)] bg-transparent focus:border-[var(--solar-gold)] focus:ring focus:ring-[var(--solar-gold)]/20 text-[var(--text-primary)] px-3 py-2.5 text-sm [&>option]:bg-[var(--bg-content)]"
                            >
                                <option value="">Sin asignar</option>
                                {users.map((u) => (
                                    <option key={u.id} value={u.id}>{u.name}</option>
                                ))}
                            </select>
                            <InputError message={errors.project_manager_id} className="mt-1" />
                        </div>

                        <div>
                            <label className={labelClass}>Líder Técnico</label>
                            <select
                                value={data.technical_leader_id}
                                onChange={(e) => setData('technical_leader_id', e.target.value)}
                                className="block w-full rounded-xl border-[var(--border-ui)] bg-transparent focus:border-[var(--solar-gold)] focus:ring focus:ring-[var(--solar-gold)]/20 text-[var(--text-primary)] px-3 py-2.5 text-sm [&>option]:bg-[var(--bg-content)]"
                            >
                                <option value="">Sin asignar</option>
                                {users.map((u) => (
                                    <option key={u.id} value={u.id}>{u.name}</option>
                                ))}
                            </select>
                            <InputError message={errors.technical_leader_id} className="mt-1" />
                        </div>

                        <div className="col-span-2">
                            <label className={labelClass}>Notas</label>
                            <textarea
                                value={data.notes || ''}
                                onChange={(e) => setData('notes', e.target.value)}
                                className="block w-full rounded-xl border-[var(--border-ui)] bg-transparent text-[var(--text-primary)] focus:border-[var(--solar-gold)] focus:ring focus:ring-[var(--solar-gold)]/20 resize-none px-3 py-2.5 text-sm"
                                rows={2}
                            />
                            <InputError message={errors.notes} className="mt-1" />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-[var(--border-ui)]/50">
                        <SecondaryButton onClick={onClose} type="button">Cancelar</SecondaryButton>
                        <PrimaryButton disabled={processing}>
                            {processing ? 'Guardando...' : 'Actualizar Proyecto'}
                        </PrimaryButton>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
