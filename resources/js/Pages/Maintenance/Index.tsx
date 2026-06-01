import { useState, useCallback } from 'react';
import { router, Link, Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { DataTable } from '@/Components/DataTable';
import Modal from '@/Components/Modal';
import MaintenanceForm from './Form';
import { showToast } from '@/Components/Toast';
import {
    Wrench, Plus, Calendar, CheckCircle2,
    XCircle, AlertCircle, Clock, Pencil, Eye
} from 'lucide-react';
import { cn } from '@/utils/cn';

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
    canCreate: boolean;
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

export default function MaintenanceIndex({ maintenances, filters, canManage, canCreate, technicians, projects }: Props) {
    const [showForm, setShowForm] = useState(false);
    const [editingMaintenance, setEditingMaintenance] = useState<any>(null);

    const handleSearch = useCallback((search: string) => {
        router.get(route('maintenances.index'), { ...filters, search, per_page: maintenances.per_page }, { preserveState: true, replace: true });
    }, [filters, maintenances.per_page]);

    const handleFilterChange = useCallback((key: string, value: string) => {
        router.get(route('maintenances.index'), { ...filters, [key]: value || undefined, per_page: maintenances.per_page }, { preserveState: true, replace: true });
    }, [filters, maintenances.per_page]);

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
        <span className={cn('text-xs font-bold font-outfit px-2 py-1 rounded-full', STATUS_STYLES[status])}>{status}</span>
    );

    const priorityBadge = (priority: string) => (
        <span className={cn('text-xs font-bold font-outfit px-2 py-1 rounded-full', PRIORITY_STYLES[priority])}>{priority}</span>
    );

    const columns = [
        {
            key: 'code',
            label: 'Código',
            render: (m: MaintenanceData) => (
                <Link href={route('maintenances.show', m.id)} className="font-mono text-sm font-bold font-outfit text-[var(--solar-gold)] hover:brightness-125">
                    {m.code}
                </Link>
            ),
        },
        {
            key: 'title',
            label: 'Título',
            render: (m: MaintenanceData) => (
                <div>
                    <p className="font-bold font-outfit text-[var(--text-primary)]">{m.title}</p>
                    {m.project && <p className="text-xs font-outfit text-[var(--text-secondary)]">{m.project.code} - {m.project.name}</p>}
                </div>
            ),
        },
        {
            key: 'type',
            label: 'Tipo',
            render: (m: MaintenanceData) => (
                <span className={cn('text-xs font-medium font-outfit', m.type === 'preventivo' ? 'text-blue-400' : 'text-orange-400')}>
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
                        <div key={t.id} className="h-7 w-7 rounded-full bg-[var(--solar-gold)] flex items-center justify-center text-[var(--text-primary)] text-xs font-bold border-2 border-[var(--bg-main)]" title={t.name}>
                            {t.name.charAt(0)}
                        </div>
                    ))}
                    {m.technicians?.length > 3 && (
                        <div className="h-7 w-7 rounded-full bg-[var(--surface)] flex items-center justify-center text-[var(--text-secondary)] text-xs font-bold">
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
            <DataTable
                    data={maintenances.data}
                    columns={columns}
                    searchPlaceholder="Buscar por código o título..."
                    emptyMessage="No hay mantenimientos registrados"
                    pagination={maintenances}
                    onSearch={handleSearch}
                    onFilterChange={handleFilterChange}
                    filters={[{
                        key: 'status',
                        label: 'Estado',
                        options: [
                            { value: 'programado', label: 'Programados' },
                            { value: 'en_progreso', label: 'En Progreso' },
                            { value: 'completado', label: 'Completados' },
                            { value: 'cancelado', label: 'Cancelados' },
                        ],
                    }]}
                    actions={(m: MaintenanceData) => (
                        <div className="flex gap-1">
                            <Link
                                href={route('maintenances.show', m.id)}
                                className="inline-flex p-2 rounded-xl hover:bg-[var(--solar-gold)]/10 text-[var(--text-secondary)] hover:text-[var(--solar-gold)] transition-all"
                                title="Ver detalle"
                            >
                                <Eye className="h-4 w-4" />
                            </Link>
                            {m.status === 'programado' && (
                                <button onClick={() => handleStart(m.id)} className="inline-flex p-2 rounded-xl hover:bg-emerald-500/10 text-[var(--text-secondary)] hover:text-emerald-400 transition-all" title="Iniciar">
                                    <Clock className="h-4 w-4" />
                                </button>
                            )}
                            {m.status === 'en_progreso' && (
                                <button onClick={() => handleComplete(m.id)} className="inline-flex p-2 rounded-xl hover:bg-emerald-500/10 text-[var(--text-secondary)] hover:text-emerald-400 transition-all" title="Completar">
                                    <CheckCircle2 className="h-4 w-4" />
                                </button>
                            )}
                            {(m.status === 'programado' || m.status === 'en_progreso') && canManage && (
                                <button onClick={() => handleCancel(m.id)} className="inline-flex p-2 rounded-xl hover:bg-red-500/10 text-[var(--text-secondary)] hover:text-red-400 transition-all" title="Cancelar">
                                    <XCircle className="h-4 w-4" />
                                </button>
                            )}
                            {canManage && (
                                <button onClick={() => handleEdit(m)} className="inline-flex p-2 rounded-xl hover:bg-blue-500/10 text-[var(--text-secondary)] hover:text-blue-400 transition-all" title="Editar">
                                    <Pencil className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                    )}
                    headerAction={canCreate && (
                        <button
                            onClick={() => { setEditingMaintenance(null); setShowForm(true); }}
                            className="flex items-center gap-2 bg-[var(--solar-gold)] text-slate-900 font-bold px-5 py-2.5 rounded-xl hover:brightness-110 transition-all shadow-lg"
                        >
                            <Plus className="h-4 w-4" />
                            <span>Nuevo Mantenimiento</span>
                        </button>
                    )}
                />

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
