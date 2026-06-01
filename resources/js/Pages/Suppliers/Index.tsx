import { useCallback, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { DataTable, Column } from '@/Components/DataTable';
import Modal from '@/Components/Modal';
import ConfirmModal from '@/Components/ConfirmModal';
import { showToast } from '@/Components/Toast';
import { cn } from '@/utils/cn';
import SupplierForm from './Form';

interface SupplierData {
    id: number;
    name: string;
    nit: string | null;
    contact_name: string | null;
    phone: string | null;
    email: string | null;
    address: string | null;
    notes: string | null;
    is_active: boolean;
}

interface PaginatedData {
    data: SupplierData[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
    suppliers: PaginatedData;
    filters: {
        search?: string;
        per_page?: string;
    };
}

export default function Index({ suppliers, filters }: Props) {
    const [showForm, setShowForm] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState<SupplierData | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<SupplierData | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSearch = useCallback((search: string) => {
        setIsLoading(true);
        router.get(
            route('suppliers.index'),
            { search, per_page: suppliers.per_page },
            { preserveState: true, replace: true, onFinish: () => setIsLoading(false) }
        );
    }, [suppliers.per_page]);

    const handlePerPageChange = useCallback((perPage: number) => {
        setIsLoading(true);
        router.get(
            route('suppliers.index'),
            { search: filters.search, per_page: perPage },
            { preserveState: true, replace: true, onFinish: () => setIsLoading(false) }
        );
    }, [filters.search]);

    const handleDelete = () => {
        if (!deleteTarget) return;
        setDeleting(true);
        router.delete(route('suppliers.destroy', deleteTarget.id), {
            preserveScroll: true,
            onSuccess: () => {
                setDeleteTarget(null);
                setDeleting(false);
                showToast('Proveedor eliminado.', 'success');
            },
            onError: () => setDeleting(false),
        });
    };

    const columns: Column<SupplierData>[] = [
        {
            key: 'name',
            label: 'Nombre',
            render: (supplier) => (
                <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[var(--solar-gold)]/20 to-[var(--solar-gold)]/5 border border-[var(--solar-gold)]/20 flex items-center justify-center text-[var(--solar-gold)] font-bold font-outfit">
                        {supplier.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <div className="font-bold font-outfit text-[var(--text-primary)]">{supplier.name}</div>
                    </div>
                </div>
            ),
        },
        {
            key: 'nit',
            label: 'NIT',
            render: (supplier) => (
                <span className="text-sm text-[var(--text-secondary)]">{supplier.nit || '-'}</span>
            ),
        },
        {
            key: 'contact_name',
            label: 'Contacto',
            render: (supplier) => (
                <span className="text-sm text-[var(--text-secondary)]">{supplier.contact_name || '-'}</span>
            ),
        },
        {
            key: 'phone',
            label: 'Teléfono',
            render: (supplier) => (
                <span className="text-sm text-[var(--text-secondary)]">{supplier.phone || '-'}</span>
            ),
        },
        {
            key: 'email',
            label: 'Email',
            render: (supplier) => (
                <span className="text-sm text-[var(--text-secondary)]">{supplier.email || '-'}</span>
            ),
        },
        {
            key: 'is_active',
            label: 'Estado',
            render: (supplier) => (
                <span className={cn(
                    'inline-flex items-center px-3 py-1 rounded-full text-xs font-bold',
                    supplier.is_active
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-red-500/10 text-red-400 border-red-500/20'
                )}>
                    {supplier.is_active ? 'Activo' : 'Inactivo'}
                </span>
            ),
        },
    ];

    const renderActions = (supplier: SupplierData) => (
        <div className="flex items-center gap-1">
            <button
                onClick={() => { setEditingSupplier(supplier); setShowForm(true); }}
                className="inline-flex p-2 rounded-xl hover:bg-blue-500/10 text-[var(--text-secondary)] hover:text-blue-400 transition-all"
                title="Editar"
            >
                <Pencil className="h-4 w-4" />
            </button>
            <button
                onClick={() => setDeleteTarget(supplier)}
                className="inline-flex p-2 rounded-xl hover:bg-red-500/10 text-[var(--text-secondary)] hover:text-red-400 transition-all"
                title="Eliminar"
            >
                <Trash2 className="h-4 w-4" />
            </button>
        </div>
    );

    return (
        <AuthenticatedLayout header="Proveedores">
            <Head title="Proveedores" />

            <DataTable
                data={suppliers.data}
                columns={columns}
                searchPlaceholder="Buscar por nombre, NIT, email..."
                emptyMessage="No se encontraron proveedores"
                pagination={suppliers}
                loading={isLoading}
                onSearch={handleSearch}
                onPerPageChange={handlePerPageChange}
                actions={renderActions}
                headerAction={
                    <button
                        onClick={() => { setEditingSupplier(null); setShowForm(true); }}
                        className="flex items-center gap-2 bg-[var(--solar-gold)] text-slate-900 font-bold px-5 py-2.5 rounded-xl hover:brightness-110 transition-all shadow-lg"
                    >
                        <Plus className="h-4 w-4" />
                        <span>Nuevo Proveedor</span>
                    </button>
                }
            />

            <Modal show={showForm} onClose={() => { setShowForm(false); setEditingSupplier(null); }} maxWidth="lg">
                <SupplierForm
                    supplier={editingSupplier}
                    onClose={() => { setShowForm(false); setEditingSupplier(null); }}
                />
            </Modal>

            <ConfirmModal
                show={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDelete}
                title="Eliminar Proveedor"
                message={`¿Estás seguro de eliminar a ${deleteTarget?.name}? Esta acción no se puede deshacer.`}
                confirmLabel="Eliminar"
                variant="danger"
                processing={deleting}
            />
        </AuthenticatedLayout>
    );
}
