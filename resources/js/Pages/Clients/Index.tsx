import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Plus, Phone, Mail, MapPin, Eye, Pencil, Trash2, Zap, DollarSign, Maximize2, Users, TrendingUp, BarChart3 } from 'lucide-react';
import { useState, useCallback } from 'react';
import { DataTable, Column } from '@/Components/DataTable';
import ConfirmModal from '@/Components/ConfirmModal';
import { showToast } from '@/Components/Toast';

interface Props {
    clients: any;
    filters: {
        search?: string;
        client_type?: string;
        consumption_min?: string;
        consumption_max?: string;
    };
    clientTypes: { id: number; name: string; code: string }[];
    statistics: {
        total: number;
        total_consumption: number;
        avg_consumption: number;
        total_monthly_bill: number;
        by_type: Record<string, number>;
    };
}

export default function Index({ clients, filters, clientTypes, statistics }: Props) {
    const [isLoading, setIsLoading] = useState(false);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<{ type: 'single' | 'bulk'; id?: number; count?: number } | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [clientTypeFilter, setClientTypeFilter] = useState(filters.client_type || '');
    const [consumptionMin, setConsumptionMin] = useState(filters.consumption_min || '');
    const [consumptionMax, setConsumptionMax] = useState(filters.consumption_max || '');

    const allSelected = selectedIds.length === clients.data.length && clients.data.length > 0;
    const someSelected = selectedIds.length > 0 && selectedIds.length < clients.data.length;

    const handleSearch = useCallback((search: string) => {
        setIsLoading(true);
        router.get(
            route('clients.index'),
            {
                search,
                client_type: clientTypeFilter || undefined,
                consumption_min: consumptionMin || undefined,
                consumption_max: consumptionMax || undefined,
                per_page: clients.per_page,
            },
            {
                preserveState: true,
                replace: true,
                onFinish: () => setIsLoading(false),
            }
        );
    }, [clients.per_page, clientTypeFilter, consumptionMin, consumptionMax]);

    const handlePerPageChange = useCallback((perPage: number) => {
        setIsLoading(true);
        router.get(
            route('clients.index'),
            {
                search: filters.search,
                client_type: clientTypeFilter || undefined,
                consumption_min: consumptionMin || undefined,
                consumption_max: consumptionMax || undefined,
                per_page: perPage,
            },
            {
                preserveState: true,
                replace: true,
                onFinish: () => setIsLoading(false),
            }
        );
    }, [filters.search, clientTypeFilter, consumptionMin, consumptionMax]);

    const handleFilterChange = useCallback((key: string, value: string) => {
        if (key === 'client_type') setClientTypeFilter(value);
        if (key === 'consumption_min') setConsumptionMin(value);
        if (key === 'consumption_max') setConsumptionMax(value);

        setIsLoading(true);
        router.get(
            route('clients.index'),
            {
                search: filters.search,
                client_type: key === 'client_type' ? value : (clientTypeFilter || undefined),
                consumption_min: key === 'consumption_min' ? value : (consumptionMin || undefined),
                consumption_max: key === 'consumption_max' ? value : (consumptionMax || undefined),
                per_page: clients.per_page,
            },
            {
                preserveState: true,
                replace: true,
                onFinish: () => setIsLoading(false),
            }
        );
    }, [filters.search, clientTypeFilter, consumptionMin, consumptionMax, clients.per_page]);

    const clearFilters = useCallback(() => {
        setClientTypeFilter('');
        setConsumptionMin('');
        setConsumptionMax('');
        setIsLoading(true);
        router.get(
            route('clients.index'),
            { search: filters.search, per_page: clients.per_page },
            {
                preserveState: true,
                replace: true,
                onFinish: () => setIsLoading(false),
            }
        );
    }, [filters.search, clients.per_page]);

    const toggleSelectAll = () => {
        if (allSelected) {
            setSelectedIds([]);
        } else {
            setSelectedIds(clients.data.map((c: any) => c.id));
        }
    };

    const toggleSelect = (id: number) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const confirmDelete = (type: 'single' | 'bulk', id?: number) => {
        setDeleteTarget(type === 'bulk' ? { type, count: selectedIds.length } : { type, id });
        setShowDeleteModal(true);
    };

    const handleDelete = () => {
        if (!deleteTarget) return;
        setDeleting(true);

        if (deleteTarget.type === 'bulk') {
            router.visit(route('clients.destroy-multiple'), {
                method: 'delete',
                data: { ids: selectedIds },
                preserveScroll: true,
                onSuccess: () => {
                    setSelectedIds([]);
                    setShowDeleteModal(false);
                    setDeleting(false);
                    showToast(`${selectedIds.length} cliente(s) eliminado(s)`, 'success');
                },
                onError: () => {
                    setDeleting(false);
                },
            });
        } else if (deleteTarget.type === 'single' && deleteTarget.id) {
            router.delete(route('clients.destroy', deleteTarget.id), {
                preserveScroll: true,
                onSuccess: () => {
                    setShowDeleteModal(false);
                    setDeleting(false);
                    showToast('Cliente eliminado exitosamente', 'success');
                },
                onError: () => {
                    setDeleting(false);
                },
            });
        }
    };

    const columns: Column<any>[] = [
        {
            key: 'checkbox',
            label: '',
            render: (client) => (
                <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-[var(--border-ui)] text-[var(--solar-gold)] focus:ring-[var(--solar-gold)]/20 bg-transparent cursor-pointer"
                    checked={selectedIds.includes(client.id)}
                    onChange={() => toggleSelect(client.id)}
                />
            ),
        },
        {
            key: 'name',
            label: 'Cliente',
            render: (client) => (
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[var(--solar-gold)]/20 to-[var(--solar-gold)]/5 flex items-center justify-center border border-[var(--solar-gold)]/20 text-[var(--solar-gold)] font-bold text-xl font-outfit">
                        {client.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <div className="font-bold text-[var(--text-primary)] text-lg">{client.name}</div>
                        <div className="text-xs text-[var(--text-secondary)] flex items-center gap-1 mt-1">
                            <MapPin className="h-3 w-3" />
                            {client.city ? `${client.city}, ${client.state}` : 'Sin direccion'}
                        </div>
                    </div>
                </div>
            ),
        },
        {
            key: 'contact',
            label: 'Contacto',
            render: (client) => (
                <div className="space-y-1">
                    {client.email && (
                        <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                            <Mail className="h-4 w-4 text-slate-400" />
                            <span className="truncate max-w-[180px]">{client.email}</span>
                        </div>
                    )}
                    {client.phone && (
                        <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                            <Phone className="h-4 w-4 text-slate-400" />
                            {client.phone}
                        </div>
                    )}
                </div>
            ),
        },
        {
            key: 'client_types',
            label: 'Tipo',
            render: (client) => (
                <div className="flex flex-wrap gap-1">
                    {client.client_types && client.client_types.length > 0 ? (
                        client.client_types.slice(0, 2).map((type: any) => (
                            <span
                                key={type.id}
                                className="px-2 py-1 rounded-lg bg-[var(--solar-gold)]/10 text-[var(--solar-gold)] font-bold text-xs"
                            >
                                {type.name}
                            </span>
                        ))
                    ) : (
                        <span className="text-xs text-[var(--text-secondary)]">Sin tipo</span>
                    )}
                </div>
            ),
        },
        {
            key: 'project_data',
            label: 'Datos del Proyecto',
            render: (client) => (
                <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                        <Zap className="h-3.5 w-3.5 text-[var(--solar-gold)]" />
                        <span>{client.energy_consumption_kwh || 0} kWh</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                        <DollarSign className="h-3.5 w-3.5 text-emerald-400" />
                        <span>${Math.round(client.monthly_bill_amount || 0).toLocaleString('es-CO')}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                        <div className="h-3.5 w-3.5 border border-current rounded-sm flex items-center justify-center text-[8px] font-bold">$/kWh</div>
                        <span>{client.energy_tariff ? Math.round(Number(client.energy_tariff)) : '-'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                        <Maximize2 className="h-3.5 w-3.5 text-blue-400" />
                        <span>{client.available_area_m2 || 0} m2</span>
                    </div>
                </div>
            ),
        },
    ];

    const renderActions = (client: any) => (
        <div className="flex items-center gap-1">
            <Link
                href={route('clients.show', client.id)}
                className="inline-flex p-2 rounded-xl hover:bg-[var(--solar-gold)]/10 text-[var(--text-secondary)] hover:text-[var(--solar-gold)] transition-all"
                title="Ver detalles"
            >
                <Eye className="h-5 w-5" />
            </Link>
            <Link
                href={route('clients.edit', client.id)}
                className="inline-flex p-2 rounded-xl hover:bg-blue-500/10 text-[var(--text-secondary)] hover:text-blue-400 transition-all"
                title="Editar cliente"
            >
                <Pencil className="h-5 w-5" />
            </Link>
            <button
                onClick={() => confirmDelete('single', client.id)}
                className="inline-flex p-2 rounded-xl hover:bg-red-500/10 text-[var(--text-secondary)] hover:text-red-400 transition-all"
                title="Eliminar cliente"
            >
                <Trash2 className="h-5 w-5" />
            </button>
        </div>
    );

    return (
        <AuthenticatedLayout header="Gestion de Clientes">
            <Head title="Clientes" />

            {selectedIds.length > 0 && (
                <div className="mb-4 p-4 glass rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-[var(--text-primary)]">
                            {selectedIds.length} cliente(s) seleccionado(s)
                        </span>
                    </div>
                    <button
                        onClick={() => confirmDelete('bulk')}
                        className="inline-flex items-center gap-2 bg-red-500/10 text-red-400 font-bold px-4 py-2 rounded-xl hover:bg-red-500/20 transition-all"
                    >
                        <Trash2 className="h-4 w-4" />
                        Eliminar seleccionados
                    </button>
                </div>
            )}

            {/* Estadísticas de clientes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
                <div className="glass rounded-2xl p-6 border border-[var(--border-ui)]/30 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-500/5 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                        <Users className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                        <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wider">Total Clientes</p>
                        <p className="text-xl font-bold font-outfit text-blue-400">{statistics.total}</p>
                    </div>
                </div>

                <div className="glass rounded-2xl p-6 border border-[var(--border-ui)]/30 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                        <Zap className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                        <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wider">Consumo Total</p>
                        <p className="text-xl font-bold font-outfit text-emerald-400">{statistics.total_consumption.toLocaleString('es-CO')} kWh</p>
                    </div>
                </div>

                <div className="glass rounded-2xl p-6 border border-[var(--border-ui)]/30 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-violet-500/5 border border-violet-500/20 flex items-center justify-center flex-shrink-0">
                        <TrendingUp className="w-6 h-6 text-violet-400" />
                    </div>
                    <div>
                        <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wider">Consumo Promedio</p>
                        <p className="text-xl font-bold font-outfit text-violet-400">{statistics.avg_consumption.toLocaleString('es-CO')} kWh</p>
                    </div>
                </div>

                <div className="glass rounded-2xl p-6 border border-[var(--border-ui)]/30 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--solar-gold)]/20 to-[var(--solar-gold)]/5 border border-[var(--solar-gold)]/20 flex items-center justify-center flex-shrink-0">
                        <DollarSign className="w-6 h-6 text-[var(--solar-gold)]" />
                    </div>
                    <div>
                        <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wider">Factura Total Mensual</p>
                        <p className="text-xl font-bold font-outfit text-[var(--solar-gold)]">${Math.round(statistics.total_monthly_bill).toLocaleString('es-CO')}</p>
                    </div>
                </div>
            </div>

            <DataTable
                data={clients.data}
                columns={columns}
                searchPlaceholder="Buscar cliente por nombre o email..."
                emptyMessage="No se encontraron clientes registrados"
                pagination={clients}
                onSearch={handleSearch}
                onPerPageChange={handlePerPageChange}
                onFilterChange={handleFilterChange}
                filters={[{
                    key: 'client_type',
                    label: 'Tipo de Cliente',
                    options: clientTypes.map((type) => ({ value: type.id.toString(), label: type.name })),
                }, {
                    key: 'consumption',
                    label: 'Consumo (kWh)',
                    type: 'range',
                }]}
                actions={renderActions}
                headerAction={
                    <Link
                        href={route('clients.create')}
                        className="flex items-center gap-2 bg-[var(--solar-gold)] text-slate-900 font-bold px-5 py-2.5 rounded-xl hover:brightness-110 transition-all shadow-lg"
                    >
                        <Plus className="h-4 w-4" />
                        <span>Nuevo Cliente</span>
                    </Link>
                }
            />

            <ConfirmModal
                show={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDelete}
                title={deleteTarget?.type === 'bulk' ? 'Eliminar clientes' : 'Eliminar cliente'}
                message={
                    deleteTarget?.type === 'bulk'
                        ? `Esta seguro de eliminar ${deleteTarget.count} cliente(s)? Esta accion no se puede deshacer.`
                        : 'Esta seguro de eliminar este cliente? Esta accion no se puede deshacer.'
                }
                confirmLabel="Eliminar"
                variant="danger"
                processing={deleting}
            />
        </AuthenticatedLayout>
    );
}