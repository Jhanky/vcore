import { useEffect } from 'react';
import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { showToast } from '@/Components/Toast';

export default function ProjectModal({ show, onClose, project = null, clients = [], users = [], states = [], isEditing = false }) {
    const { data, setData, post, patch, processing, errors, reset } = useForm({
        client_id: project?.client_id || '',
        quotation_id: project?.quotation_id || '',
        name: project?.name || '',
        description: project?.description || '',
        installation_address: project?.installation_address || '',
        coordinates: project?.coordinates || '',
        start_date: project?.start_date || '',
        estimated_end_date: project?.estimated_end_date || '',
        contracted_value_cop: project?.contracted_value_cop || '',
        project_manager_id: project?.project_manager_id || '',
        technical_leader_id: project?.technical_leader_id || '',
        priority: project?.priority || 'media',
    });

    useEffect(() => {
        if (project) {
            setData({
                client_id: project.client_id || '',
                quotation_id: project.quotation_id || '',
                name: project.name || '',
                description: project.description || '',
                installation_address: project.installation_address || '',
                coordinates: project.coordinates || '',
                start_date: project.start_date || '',
                estimated_end_date: project.estimated_end_date || '',
                contracted_value_cop: project.contracted_value_cop || '',
                project_manager_id: project.project_manager_id || '',
                technical_leader_id: project.technical_leader_id || '',
                priority: project.priority || 'media',
            });
        } else {
            reset();
        }
    }, [project, show]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isEditing && project) {
            patch(route('projects.update', project.id), {
                onSuccess: () => {
                    onClose();
                    reset();
                    showToast('Proyecto actualizado.', 'success');
                },
            });
        } else {
            post(route('projects.store'), {
                onSuccess: () => {
                    onClose();
                    reset();
                    showToast('Proyecto creado.', 'success');
                },
            });
        }
    };

    return (
        <Modal show={show} onClose={onClose} maxWidth="lg">
            <div className="p-6 bg-[var(--surface)] text-[var(--text-primary)]">
                <h2 className="text-xl font-bold font-outfit mb-6 text-[var(--solar-gold)]">
                    {isEditing ? 'Editar Proyecto' : 'Nuevo Proyecto'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <InputLabel htmlFor="name" value="Nombre del Proyecto" />
                            <TextInput
                                id="name"
                                name="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className="mt-1 block w-full"
                                required
                            />
                            <InputError message={errors.name} className="mt-2" />
                        </div>

                        <div className="col-span-2">
                            <InputLabel htmlFor="client_id" value="Cliente" />
                            <select
                                id="client_id"
                                name="client_id"
                                value={data.client_id}
                                onChange={(e) => setData('client_id', e.target.value)}
                                className="mt-1 block w-full rounded-2xl border-[var(--border-ui)] bg-transparent focus:border-[var(--solar-gold)] focus:ring focus:ring-[var(--solar-gold)]/20 text-[var(--text-primary)] [&>option]:bg-[var(--bg-content)]"
                                required
                            >
                                <option value="">Seleccionar cliente</option>
                                {clients.map((client) => (
                                    <option key={client.id} value={client.id}>
                                        {client.name}
                                    </option>
                                ))}
                            </select>
                            <InputError message={errors.client_id} className="mt-2" />
                        </div>

                        <div className="col-span-2">
                            <InputLabel htmlFor="description" value="Descripción" />
                            <textarea
                                id="description"
                                name="description"
                                value={data.description || ''}
                                onChange={(e) => setData('description', e.target.value)}
                                className="mt-1 block w-full rounded-2xl border-[var(--border-ui)] bg-transparent text-[var(--text-primary)] focus:border-[var(--solar-gold)] focus:ring focus:ring-[var(--solar-gold)]/20 resize-none"
                                rows={3}
                            />
                            <InputError message={errors.description} className="mt-2" />
                        </div>

                        <div className="col-span-2">
                            <InputLabel htmlFor="installation_address" value="Dirección de Instalación" />
                            <TextInput
                                id="installation_address"
                                name="installation_address"
                                value={data.installation_address}
                                onChange={(e) => setData('installation_address', e.target.value)}
                                className="mt-1 block w-full"
                            />
                            <InputError message={errors.installation_address} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="start_date" value="Fecha de Inicio" />
                            <TextInput
                                id="start_date"
                                name="start_date"
                                type="date"
                                value={data.start_date}
                                onChange={(e) => setData('start_date', e.target.value)}
                                className="mt-1 block w-full"
                            />
                            <InputError message={errors.start_date} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="estimated_end_date" value="Fecha Estimada de Finalización" />
                            <TextInput
                                id="estimated_end_date"
                                name="estimated_end_date"
                                type="date"
                                value={data.estimated_end_date}
                                onChange={(e) => setData('estimated_end_date', e.target.value)}
                                className="mt-1 block w-full"
                            />
                            <InputError message={errors.estimated_end_date} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="contracted_value_cop" value="Valor Contratado (COP)" />
                            <TextInput
                                id="contracted_value_cop"
                                name="contracted_value_cop"
                                type="number"
                                step="0.01"
                                value={data.contracted_value_cop}
                                onChange={(e) => setData('contracted_value_cop', e.target.value)}
                                className="mt-1 block w-full"
                            />
                            <InputError message={errors.contracted_value_cop} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="priority" value="Prioridad" />
                            <select
                                id="priority"
                                name="priority"
                                value={data.priority}
                                onChange={(e) => setData('priority', e.target.value)}
                                className="mt-1 block w-full rounded-2xl border-[var(--border-ui)] bg-transparent focus:border-[var(--solar-gold)] focus:ring focus:ring-[var(--solar-gold)]/20 text-[var(--text-primary)] [&>option]:bg-[var(--bg-content)]"
                            >
                                <option value="baja">Baja</option>
                                <option value="media">Media</option>
                                <option value="alta">Alta</option>
                            </select>
                            <InputError message={errors.priority} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="project_manager_id" value="Gerente de Proyecto" />
                            <select
                                id="project_manager_id"
                                name="project_manager_id"
                                value={data.project_manager_id}
                                onChange={(e) => setData('project_manager_id', e.target.value)}
                                className="mt-1 block w-full rounded-2xl border-[var(--border-ui)] bg-transparent focus:border-[var(--solar-gold)] focus:ring focus:ring-[var(--solar-gold)]/20 text-[var(--text-primary)] [&>option]:bg-[var(--bg-content)]"
                            >
                                <option value="">Sin asignar</option>
                                {users.map((user) => (
                                    <option key={user.id} value={user.id}>
                                        {user.name}
                                    </option>
                                ))}
                            </select>
                            <InputError message={errors.project_manager_id} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="technical_leader_id" value="Líder Técnico" />
                            <select
                                id="technical_leader_id"
                                name="technical_leader_id"
                                value={data.technical_leader_id}
                                onChange={(e) => setData('technical_leader_id', e.target.value)}
                                className="mt-1 block w-full rounded-2xl border-[var(--border-ui)] bg-transparent focus:border-[var(--solar-gold)] focus:ring focus:ring-[var(--solar-gold)]/20 text-[var(--text-primary)] [&>option]:bg-[var(--bg-content)]"
                            >
                                <option value="">Sin asignar</option>
                                {users.map((user) => (
                                    <option key={user.id} value={user.id}>
                                        {user.name}
                                    </option>
                                ))}
                            </select>
                            <InputError message={errors.technical_leader_id} className="mt-2" />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <SecondaryButton onClick={onClose} type="button">
                            Cancelar
                        </SecondaryButton>
                        <PrimaryButton disabled={processing}>
                            {isEditing ? 'Actualizar' : 'Crear Proyecto'}
                        </PrimaryButton>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
