import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import {
    Plus, Eye, Trash2, Activity, Wifi, FileText,
    CheckCircle, XCircle, AlertTriangle,
} from 'lucide-react';
import { useState, useCallback } from 'react';
import { DataTable, type Column } from '@/Components/DataTable';
import ConfirmModal from '@/Components/ConfirmModal';
import { showToast } from '@/Components/Toast';
import {
    STAGE_LABELS, STAGE_COLORS, SEMAFORO_LABELS,
    SEMAFORO_COLORS, formatDate,
} from '@/features/aire-seguimiento/utils';
import type { AireSeguimiento, AireStage, ColorSemaforo } from '@/features/aire-seguimiento/types';

interface Props {
    items: any;
    filters: {
        search?: string;
        current_stage?: string;
        status?: string;
        color?: string;
        per_page?: string;
    };
    statistics: {
        total: number;
        activos: number;
        completados: number;
        verdes: number;
        rojos: number;
    };
    stages: Record<string, string>;
}

export default function Index({ items, filters, statistics, stages }: Props) {
    const [isLoading, setIsLoading] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<{ id: number } | null>(null);
    const [deleting, setDeleting] = useState(false);

    const handleSearch = useCallback((search: string) => {
        setIsLoading(true);
        router.get(
            route('aire-seguimiento.index'),
            { search, per_page: items.per_page },
            { preserveState: true, replace: true, onFinish: () => setIsLoading(false) }
        );
    }, [items.per_page]);

    const handlePerPageChange = useCallback((perPage: number) => {
        setIsLoading(true);
        router.get(
            route('aire-seguimiento.index'),
            { search: filters.search, per_page: perPage },
            { preserveState: true, replace: true, onFinish: () => setIsLoading(false) }
        );
    }, [filters.search]);

    const handleFilterChange = useCallback((key: string, value: string) => {
        setIsLoading(true);
        router.get(
            route('aire-seguimiento.index'),
            { search: filters.search, [key]: value || undefined, per_page: items.per_page },
            { preserveState: true, replace: true, onFinish: () => setIsLoading(false) }
        );
    }, [filters.search, items.per_page]);

    const confirmDelete = (id: number) => {
        setDeleteTarget({ id });
        setShowDeleteModal(true);
    };

    const handleDelete = () => {
        if (!deleteTarget) return;
        setDeleting(true);
        router.delete(route('aire-seguimiento.destroy', deleteTarget.id), {
            preserveScroll: true,
            onSuccess: () => {
                setShowDeleteModal(false);
                setDeleting(false);
                showToast('Seguimiento eliminado exitosamente', 'success');
            },
            onError: () => setDeleting(false),
        });
    };

    const columns: Column<AireSeguimiento>[] = [
        {
            key: 'project',
            label: 'Proyecto',
            render: (item) => (
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[var(--solar-gold)]/20 to-[var(--solar-gold)]/5 flex items-center justify-center border border-[var(--solar-gold)]/20 text-[var(--solar-gold)] font-bold text-xl font-outfit">
                        <Wifi className="h-5 w-5" />
                    </div>
                    <div>
                        <div className="font-bold text-[var(--text-primary)] text-lg">
                            {item.project?.name ?? '—'}
                        </div>
                        <div className="text-xs text-[var(--text-secondary)]">
                            {item.project?.code} {item.client ? `· ${item.client.name}` : ''}
                        </div>
                    </div>
                </div>
            ),
        },
        {
            key: 'nic',
            label: 'NIC',
            render: (item) => (
                <span className="font-mono text-sm">{item.nic ?? '—'}</span>
            ),
        },
        {
            key: 'current_stage',
            label: 'Etapa',
            render: (item) => (
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${STAGE_COLORS[item.current_stage as AireStage] || ''}`}>
                    {STAGE_LABELS[item.current_stage as AireStage] || item.current_stage}
                </span>
            ),
        },
        {
            key: 'color_resultado_preliminar',
            label: 'Disponibilidad',
            render: (item) =>
                item.color_resultado_preliminar ? (
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${SEMAFORO_COLORS[item.color_resultado_preliminar as ColorSemaforo] || ''}`}>
                        {SEMAFORO_LABELS[item.color_resultado_preliminar as ColorSemaforo] || item.color_resultado_preliminar}
                    </span>
                ) : (
                    <span className="text-[var(--text-secondary)] text-sm">—</span>
                ),
        },
        {
            key: 'created_at',
            label: 'Creado',
            render: (item) => (
                <span className="text-sm text-[var(--text-secondary)]">
                    {formatDate(item.created_at)}
                </span>
            ),
        },
    ];

    const renderActions = (item: AireSeguimiento) => (
        <div className="flex items-center gap-1">
            <Link
                href={route('aire-seguimiento.show', item.id)}
                className="inline-flex p-2 rounded-xl hover:bg-[var(--solar-gold)]/10 text-[var(--text-secondary)] hover:text-[var(--solar-gold)] transition-all"
                title="Ver detalles"
            >
                <Eye className="h-5 w-5" />
            </Link>
            <button
                onClick={() => confirmDelete(item.id)}
                className="inline-flex p-2 rounded-xl hover:bg-red-500/10 text-[var(--text-secondary)] hover:text-red-400 transition-all"
                title="Eliminar"
            >
                <Trash2 className="h-5 w-5" />
            </button>
        </div>
    );

    return (
        <AuthenticatedLayout header="Seguimiento Air-e">
            <Head title="Seguimiento Air-e" />

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 mb-8">
                <div className="glass rounded-2xl p-6 border border-[var(--border-ui)]/30 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-500/5 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                        <Activity className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                        <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wider">Total</p>
                        <p className="text-xl font-bold font-outfit text-blue-400">{statistics.total}</p>
                    </div>
                </div>

                <div className="glass rounded-2xl p-6 border border-[var(--border-ui)]/30 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-500/5 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-6 h-6 text-amber-400" />
                    </div>
                    <div>
                        <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wider">Activos</p>
                        <p className="text-xl font-bold font-outfit text-amber-400">{statistics.activos}</p>
                    </div>
                </div>

                <div className="glass rounded-2xl p-6 border border-[var(--border-ui)]/30 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                        <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wider">Completados</p>
                        <p className="text-xl font-bold font-outfit text-emerald-400">{statistics.completados}</p>
                    </div>
                </div>

                <div className="glass rounded-2xl p-6 border border-[var(--border-ui)]/30 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                        <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wider">Disponibilidad Verde</p>
                        <p className="text-xl font-bold font-outfit text-emerald-400">{statistics.verdes}</p>
                    </div>
                </div>

                <div className="glass rounded-2xl p-6 border border-[var(--border-ui)]/30 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500/20 to-red-500/5 border border-red-500/20 flex items-center justify-center flex-shrink-0">
                        <XCircle className="w-6 h-6 text-red-400" />
                    </div>
                    <div>
                        <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wider">Disponibilidad Roja</p>
                        <p className="text-xl font-bold font-outfit text-red-400">{statistics.rojos}</p>
                    </div>
                </div>
            </div>

            <DataTable
                data={items.data}
                columns={columns}
                searchPlaceholder="Buscar por NIC, radicado, proyecto..."
                emptyMessage="No se encontraron seguimientos Air-e"
                pagination={items}
                loading={isLoading}
                onSearch={handleSearch}
                onFilterChange={handleFilterChange}
                onPerPageChange={handlePerPageChange}
                actions={renderActions}
                filters={[
                    {
                        key: 'current_stage',
                        label: 'Etapa',
                        options: Object.entries(stages).map(([value, label]) => ({
                            value,
                            label,
                        })),
                    },
                    {
                        key: 'status',
                        label: 'Estado',
                        options: [
                            { value: 'activo', label: 'Activo' },
                            { value: 'completado', label: 'Completado' },
                            { value: 'negado', label: 'Negado' },
                        ],
                    },
                    {
                        key: 'color',
                        label: 'Disponibilidad',
                        options: [
                            { value: 'verde', label: 'Verde' },
                            { value: 'amarillo', label: 'Amarillo' },
                            { value: 'naranja', label: 'Naranja' },
                            { value: 'rojo', label: 'Rojo' },
                        ],
                    },
                ]}
                headerAction={
                    <Link
                        href={route('aire-seguimiento.create')}
                        className="flex items-center gap-2 bg-[var(--solar-gold)] text-slate-900 font-bold px-5 py-2.5 rounded-xl hover:brightness-110 transition-all shadow-lg"
                    >
                        <Plus className="h-4 w-4" />
                        <span>Nuevo Seguimiento</span>
                    </Link>
                }
            />

            <ConfirmModal
                show={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDelete}
                title="Eliminar seguimiento"
                message="¿Está seguro de eliminar este seguimiento Air-e? Esta acción no se puede deshacer."
                confirmLabel="Eliminar"
                variant="danger"
                processing={deleting}
            />
        </AuthenticatedLayout>
    );
}
