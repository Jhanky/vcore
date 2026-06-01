import { useState, useCallback } from 'react';
import { router, Link, Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { DataTable } from '@/Components/DataTable';
import Modal from '@/Components/Modal';
import TicketForm from './Form';
import { showToast } from '@/Components/Toast';
import { cn } from '@/utils/cn';
import ConfirmModal from '@/Components/ConfirmModal';
import {
    Ticket, Plus, User, Calendar, Pencil, Eye, Trash2
} from 'lucide-react';

interface TicketData {
    id: number;
    code: string;
    title: string;
    category: string;
    priority: string;
    status: string;
    created_at: string;
    project: { id: number; code: string } | null;
    assignee: { id: number; name: string } | null;
    creator: { id: number; name: string };
    comments_count?: number;
}

interface PaginatedData {
    data: any[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
    links: any[];
}

interface Props {
    tickets: PaginatedData;
    filters: Record<string, any>;
    canManage: boolean;
    technicians: any[];
    projects: any[];
}

const STATUS_STYLES: Record<string, string> = {
    abierto: 'bg-blue-500/20 text-blue-400',
    en_progreso: 'bg-amber-500/20 text-amber-400',
    resuelto: 'bg-emerald-500/20 text-emerald-400',
    cerrado: 'bg-gray-500/20 text-gray-400',
};

const PRIORITY_STYLES: Record<string, string> = {
    critica: 'bg-red-500/20 text-red-400',
    alta: 'bg-orange-500/20 text-orange-400',
    media: 'bg-yellow-500/20 text-yellow-400',
    baja: 'bg-green-500/20 text-green-400',
};

export default function TicketsIndex({ tickets, filters, canManage, technicians, projects }: Props) {
    const [showForm, setShowForm] = useState(false);
    const [editingTicket, setEditingTicket] = useState<any>(null);

    const handleSearch = useCallback((search: string) => {
        router.get(route('tickets.index'), { ...filters, search, per_page: tickets.per_page }, { preserveState: true, replace: true });
    }, [filters, tickets.per_page]);

    const handleFilterChange = useCallback((key: string, value: string) => {
        router.get(route('tickets.index'), { ...filters, [key]: value || undefined, per_page: tickets.per_page }, { preserveState: true, replace: true });
    }, [filters, tickets.per_page]);

    const handleEdit = (t: TicketData) => {
        setEditingTicket(t);
        setShowForm(true);
    };

    const [confirmDelete, setConfirmDelete] = useState<{
        show: boolean;
        id: number | null;
        code: string;
    }>({
        show: false,
        id: null,
        code: ''
    });
    const [deleting, setDeleting] = useState(false);

    const handleDelete = (id: number, code: string) => {
        setConfirmDelete({ show: true, id, code });
    };

    const onConfirmDelete = () => {
        if (confirmDelete.id) {
            setDeleting(true);
            router.delete(route('tickets.destroy', confirmDelete.id), {
                preserveScroll: true,
                onSuccess: () => {
                    setConfirmDelete({ show: false, id: null, code: '' });
                    setDeleting(false);
                    showToast('Ticket eliminado.', 'success');
                },
                onError: () => {
                    setDeleting(false);
                },
            });
        }
    };

    const statusBadge = (status: string) => (
        <span className={cn('text-xs font-bold font-outfit px-2 py-1 rounded-full', STATUS_STYLES[status])}>{status}</span>
    );

    const priorityBadge = (priority: string) => (
        <span className={cn('text-xs font-bold font-outfit px-2 py-1 rounded-full', PRIORITY_STYLES[priority])}>{priority}</span>
    );

    const columns = [
        {
            key: 'code',
            label: 'Código',
            render: (t: TicketData) => (
                <Link href={route('tickets.show', t.id)} className="font-mono text-sm font-bold text-[var(--solar-gold)] hover:brightness-125">
                    {t.code}
                </Link>
            ),
        },
        {
            key: 'title',
            label: 'Título',
            render: (t: TicketData) => (
                <div>
                    <p className="font-bold font-outfit text-[var(--text-primary)]">{t.title}</p>
                    {t.project && <p className="text-xs text-[var(--text-secondary)] font-outfit">{t.project.code}</p>}
                </div>
            ),
        },
        {
            key: 'category',
            label: 'Categoría',
            render: (t: TicketData) => (
                <span className="text-xs text-[var(--text-secondary)] font-outfit">{t.category}</span>
            ),
        },
        {
            key: 'priority',
            label: 'Prioridad',
            render: (t: TicketData) => priorityBadge(t.priority),
        },
        {
            key: 'status',
            label: 'Estado',
            render: (t: TicketData) => statusBadge(t.status),
        },
        {
            key: 'assignee',
            label: 'Asignado',
            render: (t: TicketData) => (
                t.assignee ? (
                    <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-[var(--solar-gold)] flex items-center justify-center text-[var(--text-primary)] text-xs font-bold">
                            {t.assignee.name.charAt(0)}
                        </div>
                        <span className="text-xs text-[var(--text-secondary)] font-outfit">{t.assignee.name}</span>
                    </div>
                ) : (
                    <span className="text-xs text-[var(--text-secondary)] font-outfit">-</span>
                )
            ),
        },
        {
            key: 'created_at',
            label: 'Creado',
            render: (t: TicketData) => (
                <span className="text-xs text-[var(--text-secondary)] font-outfit">
                    {new Date(t.created_at).toLocaleDateString('es-CO')}
                </span>
            ),
        },
    ];

    return (
        <AuthenticatedLayout header="Tickets">
            <Head title="Tickets" />
            <DataTable
                    data={tickets.data}
                    columns={columns}
                    searchPlaceholder="Buscar por código o título..."
                    emptyMessage="No hay tickets registrados"
                    pagination={tickets}
                    onSearch={handleSearch}
                    onFilterChange={handleFilterChange}
                    filters={[{
                        key: 'status',
                        label: 'Estado',
                        options: [
                            { value: 'abierto', label: 'Abiertos' },
                            { value: 'en_progreso', label: 'En Progreso' },
                            { value: 'resuelto', label: 'Resueltos' },
                            { value: 'cerrado', label: 'Cerrados' },
                        ],
                    }]}
                    actions={(t: TicketData) => (
                        <div className="flex gap-1">
                            <Link href={route('tickets.show', t.id)} className="inline-flex p-2 rounded-xl hover:bg-[var(--solar-gold)]/10 text-[var(--text-secondary)] hover:text-[var(--solar-gold)] transition-all" title="Ver">
                                <Eye className="h-4 w-4" />
                            </Link>
                            {canManage && (
                                <button onClick={() => handleEdit(t)} className="inline-flex p-2 rounded-xl hover:bg-blue-500/10 text-[var(--text-secondary)] hover:text-blue-400 transition-all" title="Editar">
                                    <Pencil className="h-4 w-4" />
                                </button>
                            )}
                            {canManage && (
                                <button onClick={() => handleDelete(t.id, t.code)} className="inline-flex p-2 rounded-xl hover:bg-red-500/10 text-[var(--text-secondary)] hover:text-red-400 transition-all" title="Eliminar">
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                    )}
                    headerAction={
                        <button
                            onClick={() => { setEditingTicket(null); setShowForm(true); }}
                            className="flex items-center gap-2 bg-[var(--solar-gold)] text-slate-900 font-bold px-5 py-2.5 rounded-xl hover:brightness-110 transition-all shadow-lg"
                        >
                            <Plus className="h-4 w-4" />
                            <span>Nuevo Ticket</span>
                        </button>
                    }
                />

            <Modal show={showForm} onClose={() => setShowForm(false)} maxWidth="2xl">
                <TicketForm
                    ticket={editingTicket}
                    technicians={technicians}
                    projects={projects}
                    onClose={() => setShowForm(false)}
                />
            </Modal>

            <ConfirmModal
                show={confirmDelete.show}
                onClose={() => setConfirmDelete({ ...confirmDelete, show: false })}
                onConfirm={onConfirmDelete}
                title="Eliminar Ticket"
                message={`¿Estás seguro de eliminar el ticket ${confirmDelete.code}? Esta acción no se puede deshacer.`}
                confirmLabel="Eliminar"
                variant="danger"
                processing={deleting}
            />
        </AuthenticatedLayout>
    );
}
