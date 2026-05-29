import { useState, useCallback } from 'react';
import { router, Link, Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { DataTable } from '@/Components/DataTable';
import Modal from '@/Components/Modal';
import MaintenanceForm from './Form';
import { showToast } from '@/Components/Toast';
import {
    Wrench, Plus, Calendar, CheckCircle2,
    XCircle, AlertCircle, Clock
} from 'lucide-react';

interface MaintenanceData {
    id: number;
    code: string;
    title: string;
    type: string;
    priority: string;
    status: string;
    scheduled_date: string;
    description: string;
    completion_notes: string | null;
    estimated_hours: number | null;
    project: { id: number; code: string; name: string } | null;
    technicians: { id: number; name: string; pivot: { role: string } }[];
    creator: { id: number; name: string };
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
    maintenances: PaginatedData;
    filters: Record<string, any>;
    canManage: boolean;
    technicians: any[];
    projects: any[];
}

const STATUS_STYLES: Record<string, string> = {
    programado: 'bg-blue-500/20 text-blue-400',
    en_progreso: 'bg-amber-500/20 text-amber-400',
    completado: 'bg-emerald-500/20 text-emerald-400',
    cancelado: 'bg-red-500/20 text-red-400',
};

const PRIORITY_STYLES: Record<string, string> = {
    critica: 'bg-red-500/20 text-red-400',
    alta: 'bg-orange-500/20 text-orange-400',
    media: 'bg-yellow-500/20 text-yellow-400',
    baja: 'bg-green-500/20 text-green-400',
};

export default function MaintenanceIndex({ maintenances, filters, canManage, technicians, projects }: Props) {
    const [showForm, setShowForm] = useState(false);
    const [editingMaintenance, setEditingMaintenance] = useState<any>(null);

    const handleSearch = useCallback((search: string) => {
        router.get(route('maintenances.index'), { ...filters, search, per_page: maintenances.per_page }, { preserveState: true, replace: true });
    }, [filters, maintenances.per_page]);

    const handleStatusFilter = (status: string) => {
        router.get(route('maintenances.index'), { ...filters, status, per_page: maintenances.per_page }, { preserveState: true, replace: true });
    };

    const handleEdit = (m: MaintenanceData) => {
        setEditingMaintenance(m);
        setShowForm(true);
    };

    const handleStart = (id: number) => {
        router.patch(route('maintenances.start', id), {}, {
            onSuccess: () => showToast('Mantenimiento iniciado.', 'success'),
        });
    };

    const handleComplete = (id: number) => {
        const notes = prompt('Notas de finalización:');
        router.patch(route('maintenances.complete', id), { completion_notes: notes }, {
            onSuccess: () => showToast('Mantenimiento completado.', 'success'),
        });
    };

    const handleCancel = (id: number) => {
        if (confirm('Cancelar este mantenimiento?')) {
            const notes = prompt('Motivo de cancelación:');
            router.patch(route('maintenances.cancel', id), { completion_notes: notes }, {
                onSuccess: () => showToast('Mantenimiento cancelado.', 'success'),
            });
        }
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
            render: (m: MaintenanceData) => (
                <Link href={route('maintenances.show', m.id)} className="font-mono text-sm font-bold text-[var(--solar-gold)] hover:brightness-125">
                    {m.code}
                </Link>
            ),
        },
        {
            key: 'title',
            label: 'Título',
            render: (m: MaintenanceData) => (
                <div>
                    <p className="font-bold text-[var(--text-primary)]">{m.title}</p>
                    {m.project && <p className="text-xs text-[var(--text-secondary)]">{m.project.code} - {m.project.name}</p>}
                </div>
            ),
        },
        {
            key: 'type',
            label: 'Tipo',
            render: (m: MaintenanceData) => (
                <span className={`text-xs font-medium ${m.type === 'preventivo' ? 'text-blue-400' : 'text-orange-400'}`}>
                    {m.type === 'preventivo' ? 'Preventivo' : 'Correctivo'}
                </span>
            ),
        },
        {
            key: 'priority',
            label: 'Prioridad',
            render: (m: MaintenanceData) => priorityBadge(m.priority),
        },
        {
            key: 'status',
            label: 'Estado',
            render: (m: MaintenanceData) => statusBadge(m.status),
        },
        {
            key: 'scheduled_date',
            label: 'Fecha',
            render: (m: MaintenanceData) => (
                <div className="flex items-center gap-1 text-sm text-[var(--text-secondary)]">
                    <Calendar className="h-3 w-3" />
                    {new Date(m.scheduled_date).toLocaleDateString('es-CO')}
                </div>
            ),
        },
        {
            key: 'technicians',
            label: 'Técnicos',
            render: (m: MaintenanceData) => (
                <div className="flex -space-x-2">
                    {m.technicians?.slice(0, 3).map((t: any) => (
                        <div key={t.id} className="h-7 w-7 rounded-full bg-[var(--solar-gold)] flex items-center justify-center text-white text-xs font-bold border-2 border-[var(--bg-main)]" title={t.name}>
                            {t.name.charAt(0)}
                        </div>
                    ))}
                    {m.technicians?.length > 3 && (
                        <div className="h-7 w-7 rounded-full bg-slate-500/20 flex items-center justify-center text-[var(--text-secondary)] text-xs font-bold">
                            +{m.technicians.length - 3}
                        </div>
                    )}
                </div>
            ),
        },
    ];

    return (
        <AuthenticatedLayout header="Mantenimientos">
            <Head title="Mantenimientos" />
            <div className="glass rounded-[2rem] p-6 border border-[var(--border-ui)]/30">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                        <div className="flex rounded-xl border border-[var(--border-ui)] overflow-hidden">
                            {['', 'programado', 'en_progreso', 'completado', 'cancelado'].map((s) => (
                                <button
                                    key={s}
                                    onClick={() => handleStatusFilter(s)}
                                    className={`px-3 py-2 text-sm font-medium transition-colors border-r border-[var(--border-ui)] last:border-r-0 ${
                                        (filters.status || '') === s ? 'bg-[var(--solar-gold)] text-slate-900' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                                    }`}
                                >
                                    {s === '' ? 'Todos' : s === 'programado' ? 'Programados' : s === 'en_progreso' ? 'En Progreso' : s === 'completado' ? 'Completados' : 'Cancelados'}
                                </button>
                            ))}
                        </div>
                    </div>
                    {canManage && (
                        <button
                            onClick={() => { setEditingMaintenance(null); setShowForm(true); }}
                            className="flex items-center gap-2 bg-[var(--solar-gold)] text-slate-900 font-bold px-5 py-2.5 rounded-xl hover:brightness-110 transition-all shadow-lg"
                        >
                            <Plus className="h-4 w-4" /> Nuevo Mantenimiento
                        </button>
                    )}
                </div>

                <DataTable
                    data={maintenances.data}
                    columns={columns}
                    searchPlaceholder="Buscar por código o título..."
                    emptyMessage="No hay mantenimientos registrados"
                    pagination={maintenances}
                    onSearch={handleSearch}
                    actions={(m: MaintenanceData) => (
                        <div className="flex gap-1">
                            {m.status === 'programado' && (
                                <button onClick={() => handleStart(m.id)} className="p-2 rounded-xl hover:bg-emerald-500/10 text-[var(--text-secondary)] hover:text-emerald-400 transition-colors" title="Iniciar">
                                    <Clock className="h-4 w-4" />
                                </button>
                            )}
                            {m.status === 'en_progreso' && (
                                <button onClick={() => handleComplete(m.id)} className="p-2 rounded-xl hover:bg-emerald-500/10 text-[var(--text-secondary)] hover:text-emerald-400 transition-colors" title="Completar">
                                    <CheckCircle2 className="h-4 w-4" />
                                </button>
                            )}
                            {(m.status === 'programado' || m.status === 'en_progreso') && canManage && (
                                <button onClick={() => handleCancel(m.id)} className="p-2 rounded-xl hover:bg-red-500/10 text-[var(--text-secondary)] hover:text-red-400 transition-colors" title="Cancelar">
                                    <XCircle className="h-4 w-4" />
                                </button>
                            )}
                            {canManage && (
                                <button onClick={() => handleEdit(m)} className="p-2 rounded-xl hover:bg-[var(--solar-gold)]/10 text-[var(--text-secondary)] hover:text-[var(--solar-gold)] transition-colors" title="Editar">
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                </button>
                            )}
                        </div>
                    )}
                />
            </div>

            <Modal show={showForm} onClose={() => setShowForm(false)} maxWidth="2xl">
                <MaintenanceForm
                    maintenance={editingMaintenance}
                    technicians={technicians}
                    projects={projects}
                    onClose={() => setShowForm(false)}
                />
            </Modal>
        </AuthenticatedLayout>
    );
}
