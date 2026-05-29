import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Plus, Pencil, Trash2, ArrowLeft, Check, X } from 'lucide-react';
import { useState, useCallback } from 'react';
import { DataTable, Column } from '@/Components/DataTable';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import ConfirmModal from '@/Components/ConfirmModal';
import Modal from '@/Components/Modal';
import { showToast } from '@/Components/Toast';

interface ClientType {
    id: number;
    name: string;
    code: string;
    active: boolean;
}

interface Props {
    clientTypes: { data: ClientType[]; current_page: number; last_page: number; per_page: number; total: number; from: number; to: number; links: any[] };
}

export default function Index({ clientTypes }: Props) {
    const [showModal, setShowModal] = useState(false);
    const [editingType, setEditingType] = useState<ClientType | null>(null);
    const [formData, setFormData] = useState({ name: '', code: '', active: true });
    const [errors, setErrors] = useState<{ name?: string; code?: string }>({});
    const [deleteTarget, setDeleteTarget] = useState<ClientType | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const openModal = (type?: ClientType) => {
        if (type) {
            setEditingType(type);
            setFormData({ name: type.name, code: type.code, active: type.active });
        } else {
            setEditingType(null);
            setFormData({ name: '', code: '', active: true });
        }
        setErrors({});
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingType(null);
        setFormData({ name: '', code: '', active: true });
        setErrors({});
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        if (editingType) {
            router.put(route('client-types.update', editingType.id), formData, {
                onSuccess: () => {
                    closeModal();
                    setSubmitting(false);
                    showToast('Tipo de cliente actualizado.', 'success');
                },
                onError: (errs: any) => {
                    setErrors(errs);
                    setSubmitting(false);
                },
            });
        } else {
            router.post(route('client-types.store'), formData, {
                onSuccess: () => {
                    closeModal();
                    setSubmitting(false);
                    showToast('Tipo de cliente creado.', 'success');
                },
                onError: (errs: any) => {
                    setErrors(errs);
                    setSubmitting(false);
                },
            });
        }
    };

    const handleDelete = () => {
        if (deleteTarget) {
            setDeleting(true);
            router.delete(route('client-types.destroy', deleteTarget.id), {
                preserveScroll: true,
                onSuccess: () => {
                    setDeleteTarget(null);
                    setDeleting(false);
                    showToast('Tipo de cliente eliminado.', 'success');
                },
                onError: () => {
                    setDeleting(false);
                },
            });
        }
    };

    const columns: Column<ClientType>[] = [
        {
            key: 'name',
            label: 'Nombre',
            render: (type) => (
                <span className="font-bold text-[var(--text-primary)]">{type.name}</span>
            ),
        },
        {
            key: 'code',
            label: 'Código',
            render: (type) => (
                <span className="font-mono text-sm text-[var(--text-secondary)]">{type.code}</span>
            ),
        },
        {
            key: 'active',
            label: 'Estado',
            render: (type) => (
                type.active ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-xs font-bold">
                        <Check className="h-3 w-3" /> Activo
                    </span>
                ) : (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-slate-500/10 text-slate-400 rounded-full text-xs font-bold">
                        <X className="h-3 w-3" /> Inactivo
                    </span>
                )
            ),
        },
    ];

    const handlePerPageChange = useCallback((perPage: number) => {
        router.get(route('client-types.index'), { per_page: perPage }, { preserveState: true, replace: true });
    }, []);

    return (
        <AuthenticatedLayout header="Tipos de Cliente">
            <Head title="Tipos de Cliente" />

            <div className="mb-6">
                <Link
                    href={route('clients.index')}
                    className="inline-flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--solar-gold)] transition-colors font-medium"
                >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Volver a Clientes</span>
                </Link>
            </div>

            <DataTable
                data={clientTypes.data}
                columns={columns}
                searchPlaceholder="Buscar tipo de cliente..."
                emptyMessage="No hay tipos de cliente registrados"
                pagination={clientTypes}
                onPerPageChange={handlePerPageChange}
                actions={(type) => (
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => openModal(type)}
                            className="inline-flex p-2 rounded-xl hover:bg-[var(--solar-gold)]/10 text-[var(--text-secondary)] hover:text-[var(--solar-gold)] transition-all"
                            title="Editar"
                        >
                            <Pencil className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => setDeleteTarget(type)}
                            className="inline-flex p-2 rounded-xl hover:bg-red-500/10 text-[var(--text-secondary)] hover:text-red-400 transition-all"
                            title="Eliminar"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                )}
                headerAction={
                    <button
                        onClick={() => openModal()}
                        className="flex items-center gap-2 bg-[var(--solar-gold)] text-slate-900 font-bold px-5 py-2.5 rounded-xl hover:brightness-110 transition-all shadow-lg"
                    >
                        <Plus className="h-4 w-4" />
                        <span>Nuevo Tipo</span>
                    </button>
                }
            />

            <Modal show={showModal} onClose={closeModal} maxWidth="md">
                <div className="p-6 bg-[var(--surface)] text-[var(--text-primary)]">
                    <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6 font-outfit">
                        {editingType ? 'Editar Tipo de Cliente' : 'Nuevo Tipo de Cliente'}
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <InputLabel htmlFor="name" value="Nombre *" />
                            <TextInput
                                id="name"
                                type="text"
                                className="mt-1 block w-full"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                            <InputError message={errors.name} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="code" value="Código *" />
                            <TextInput
                                id="code"
                                type="text"
                                className="mt-1 block w-full"
                                value={formData.code}
                                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                required
                                maxLength={10}
                            />
                            <InputError message={errors.code} className="mt-2" />
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="active"
                                className="rounded border-[var(--border-ui)] text-[var(--solar-gold)] focus:ring-[var(--solar-gold)]/20 bg-[var(--surface)]"
                                checked={formData.active}
                                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                            />
                            <label htmlFor="active" className="text-sm text-[var(--text-primary)] cursor-pointer">
                                Activo
                            </label>
                        </div>

                        <div className="flex items-center justify-end gap-4 pt-4">
                            <SecondaryButton type="button" onClick={closeModal} disabled={submitting}>
                                Cancelar
                            </SecondaryButton>
                            <PrimaryButton type="submit" disabled={submitting} isLoading={submitting}>
                                {editingType ? 'Actualizar' : 'Crear'}
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </Modal>

            <ConfirmModal
                show={!!deleteTarget}
                title="Eliminar Tipo de Cliente"
                message={`Estás seguro de eliminar "${deleteTarget?.name}"? Esta acción no se puede deshacer.`}
                confirmLabel="Eliminar"
                variant="danger"
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDelete}
                processing={deleting}
            />
        </AuthenticatedLayout>
    );
}
