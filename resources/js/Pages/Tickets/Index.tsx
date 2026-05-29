import { useState, useCallback } from 'react';
import { router, Link, Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { DataTable } from '@/Components/DataTable';
import Modal from '@/Components/Modal';
import TicketForm from './Form';
import { showToast } from '@/Components/Toast';
import {
    Ticket, Plus, User, Calendar
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

    const handleStatusFilter = (status: string) => {
        router.get(route('tickets.index'), { ...filters, status, per_page: tickets.per_page }, { preserveState: true, replace: true });
    };

    const handleEdit = (t: TicketData) => {
        setEditingTicket(t);
        setShowForm(true);
    };

    const statusBadge = (status: string) => (
        <span className={`text-xs font-bold px-2 py-1 rounded-full ${STATUS_STYLES[status] || ''}`}>{status}</span>
    );

    const priorityBadge = (priority: string) => (
        <span className={`text-xs font-bold px-2 py-1 rounded-full ${PRIORITY_STYLES[priority] || ''}`}>{priority}</span>
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
                    <p className="font-bold text-[var(--text-primary)]">{t.title}</p>
                    {t.project && <p className="text-xs text-[var(--text-secondary)]">{t.project.code}</p>}
                </div>
            ),
        },
        {
            key: 'category',
            label: 'Categoría',
            render: (t: TicketData) => (
                <span className="text-xs text-[var(--text-secondary)]">{t.category}</span>
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
                        <div className="h-6 w-6 rounded-full bg-[var(--solar-gold)] flex items-center justify-center text-slate-900 text-xs font-bold">
                            {t.assignee.name.charAt(0)}
                        </div>
                        <span className="text-xs text-[var(--text-secondary)]">{t.assignee.name}</span>
                    </div>
                ) : (
                    <span className="text-xs text-[var(--text-secondary)]">-</span>
                )
            ),
        },
        {
            key: 'created_at',
            label: 'Creado',
            render: (t: TicketData) => (
                <span className="text-xs text-[var(--text-secondary)]">
                    {new Date(t.created_at).toLocaleDateString('es-CO')}
                </span>
            ),
        },
    ];

    return (
        <AuthenticatedLayout header="Tickets">
            <Head title="Tickets" />
            <div className="glass rounded-[2rem] p-6 border border-[var(--border-ui)]/30">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                        <div className="flex rounded-xl border border-[var(--border-ui)] overflow-hidden">
                            {['', 'abierto', 'en_progreso', 'resuelto', 'cerrado'].map((s) => (
                                <button
                                    key={s}
                                    onClick={() => handleStatusFilter(s)}
                                    className={`px-3 py-2 text-sm font-medium transition-colors border-r border-[var(--border-ui)] last:border-r-0 ${
                                        (filters.status || '') === s ? 'bg-[var(--solar-gold)] text-slate-900' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                                    }`}
                                >
                                    {s === '' ? 'Todos' : s === 'abierto' ? 'Abiertos' : s === 'en_progreso' ? 'En Progreso' : s === 'resuelto' ? 'Resueltos' : 'Cerrados'}
                                </button>
                            ))}
                        </div>
                    </div>
                    <button
                        onClick={() => { setEditingTicket(null); setShowForm(true); }}
                        className="flex items-center gap-2 bg-[var(--solar-gold)] text-slate-900 font-bold px-5 py-2.5 rounded-xl hover:brightness-110 transition-all shadow-lg"
                    >
                        <Plus className="h-4 w-4" /> Nuevo Ticket
                    </button>
                </div>

                <DataTable
                    data={tickets.data}
                    columns={columns}
                    searchPlaceholder="Buscar por código o título..."
                    emptyMessage="No hay tickets registrados"
                    pagination={tickets}
                    onSearch={handleSearch}
                    actions={(t: TicketData) => (
                        <div className="flex gap-1">
                            {canManage && (
                                <button onClick={() => handleEdit(t)} className="p-2 rounded-xl hover:bg-[var(--solar-gold)]/10 text-[var(--text-secondary)] hover:text-[var(--solar-gold)] transition-colors" title="Editar">
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                </button>
                            )}
                        </div>
                    )}
                />
            </div>

            <Modal show={showForm} onClose={() => setShowForm(false)} maxWidth="2xl">
                <TicketForm
                    ticket={editingTicket}
                    technicians={technicians}
                    projects={projects}
                    onClose={() => setShowForm(false)}
                />
            </Modal>
        </AuthenticatedLayout>
    );
}
