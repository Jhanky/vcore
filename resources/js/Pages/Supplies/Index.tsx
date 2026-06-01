import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import {
    Plus, Zap, Cpu, Battery as BatteryIcon,
    Trash2, Edit, AlertCircle, FileText
} from 'lucide-react';
import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { DataTable, Column } from '@/Components/DataTable';
import PanelFormModal from './Components/PanelFormModal';
import InverterFormModal from './Components/InverterFormModal';
import BatteryFormModal from './Components/BatteryFormModal';
import ConfirmModal from '@/Components/ConfirmModal';
import { showToast } from '@/Components/Toast';
import { cn } from '@/utils/cn';

const TAB_CONFIG = {
    panels: {
        label: 'Paneles',
        icon: Zap,
        singular: 'Panel',
    },
    inverters: {
        label: 'Inversores',
        icon: Cpu,
        singular: 'Inversor',
    },
    batteries: {
        label: 'Baterías',
        icon: BatteryIcon,
        singular: 'Batería',
    },
} as const;

type TabKey = 'panels' | 'inverters' | 'batteries';

export default function Index({ panels, inverters, batteries }: any) {
    const [activeTab, setActiveTab] = useState<TabKey>('panels');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterValues, setFilterValues] = useState<Record<string, string>>({});

    const [showPanelModal, setShowPanelModal] = useState(false);
    const [showInverterModal, setShowInverterModal] = useState(false);
    const [showBatteryModal, setShowBatteryModal] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);

    const [confirmDelete, setConfirmDelete] = useState<{
        show: boolean;
        id: number | null;
        type: TabKey | null;
    }>({ show: false, id: null, type: null });
    const [deleting, setDeleting] = useState(false);

    const currentData = useMemo(() => {
        switch (activeTab) {
            case 'panels': return panels.data;
            case 'inverters': return inverters.data;
            case 'batteries': return batteries.data;
        }
    }, [activeTab, panels, inverters, batteries]);

    const currentPagination = useMemo(() => {
        switch (activeTab) {
            case 'panels': return panels;
            case 'inverters': return inverters;
            case 'batteries': return batteries;
        }
    }, [activeTab, panels, inverters, batteries]);

    const config = TAB_CONFIG[activeTab];

    const columns: Column<any>[] = useMemo(() => {
        const base: Column<any>[] = [
            {
                key: 'brand_model',
                label: 'Marca / Modelo',
                render: (item) => (
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold uppercase font-outfit text-[var(--solar-gold)]">{item.brand}</span>
                        <span className="text-[var(--text-primary)] font-bold font-outfit">{item.model}</span>
                    </div>
                ),
            },
        ];

        if (activeTab === 'panels') {
            base.push({
                key: 'power',
                label: 'Potencia',
                hideOnMobile: true,
                render: (item) => (
                    <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-amber-400" />
                        <span className="font-medium">{item.power} Wp</span>
                    </div>
                ),
            });
        }

        if (activeTab === 'inverters') {
            base.push(
                {
                    key: 'power',
                    label: 'Potencia',
                    hideOnMobile: true,
                    render: (item) => (
                        <div className="flex items-center gap-2">
                            <Cpu className="h-4 w-4 text-blue-400" />
                            <span className="font-medium">{item.power} kW</span>
                        </div>
                    ),
                },
                {
                    key: 'types',
                    label: 'Sistema / Red',
                    hideOnMobile: true,
                    render: (item) => (
                        <div className="flex gap-2">
                            <span className="px-2 py-0.5 rounded-lg bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase font-outfit">
                                {item.system_type}
                            </span>
                            <span className="px-2 py-0.5 rounded-lg bg-slate-500/10 text-[var(--text-secondary)] text-[10px] font-bold uppercase font-outfit">
                                {item.grid_type}
                            </span>
                        </div>
                    ),
                }
            );
        }

        if (activeTab === 'batteries') {
            base.push(
                {
                    key: 'capacity',
                    label: 'Capacidad / Voltaje',
                    hideOnMobile: true,
                    render: (item) => (
                        <div className="flex items-center gap-2">
                            <BatteryIcon className="h-4 w-4 text-emerald-400" />
                            <span className="font-medium">{item.capacity} Ah / {item.voltage}V</span>
                        </div>
                    ),
                },
                {
                    key: 'type',
                    label: 'Tipo',
                    hideOnMobile: true,
                    render: (item) => (
                        <span className="px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase font-outfit">
                            {item.type}
                        </span>
                    ),
                }
            );
        }

        base.push(
            {
                key: 'price',
                label: 'Precio',
                render: (item) => (
                    <span className="text-[var(--text-primary)] font-bold font-mono font-outfit text-sm">
                        ${parseFloat(item.price).toLocaleString()}
                    </span>
                ),
            },
            {
                key: 'datasheet',
                label: 'Ficha',
                hideOnMobile: true,
                render: (item) => (
                    item.datasheet_url ? (
                        <a
                            href={item.datasheet_url}
                            target="_blank"
                            className="inline-flex p-2 rounded-xl bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-all"
                        >
                            <FileText className="h-5 w-5" />
                        </a>
                    ) : (
                        <AlertCircle className="h-5 w-5 text-[var(--text-secondary)]/20 mx-auto" />
                    )
                ),
            }
        );

        return base;
    }, [activeTab]);

    const filters = useMemo(() => {
        if (activeTab === 'inverters') {
            return [
                {
                    key: 'system_type',
                    label: 'Sistema',
                    options: [
                        { value: 'On-grid', label: 'On-grid' },
                        { value: 'Off-grid', label: 'Off-grid' },
                        { value: 'Híbrido', label: 'Híbrido' },
                    ],
                },
                {
                    key: 'grid_type',
                    label: 'Red',
                    options: [
                        { value: 'monofasico', label: 'Monofásico' },
                        { value: 'bifasico 220', label: 'Bifásico 220' },
                        { value: 'trifasico 220', label: 'Trifásico 220' },
                        { value: 'trifasico 440', label: 'Trifásico 440' },
                    ],
                },
            ];
        }
        if (activeTab === 'batteries') {
            return [
                {
                    key: 'type',
                    label: 'Tipo',
                    options: [
                        { value: 'Litio', label: 'Litio' },
                        { value: 'AGM', label: 'AGM' },
                        { value: 'GEL', label: 'GEL' },
                    ],
                },
            ];
        }
        return [];
    }, [activeTab]);

    const handleSearch = useCallback((value: string) => {
        setSearchTerm(value);
    }, []);

    const handleFilterChange = useCallback((key: string, value: string) => {
        setFilterValues(prev => ({ ...prev, [key]: value }));
    }, []);

    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    useEffect(() => {
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }
        searchTimeoutRef.current = setTimeout(() => {
            router.get(route('supplies.index'), {
                tab: activeTab,
                search: searchTerm,
                ...filterValues,
            }, { preserveState: true });
        }, 300);
        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, [activeTab, searchTerm, filterValues]);

    const handlePerPageChange = useCallback((perPage: number) => {
        router.get(route('supplies.index'), {
            tab: activeTab,
            per_page: perPage,
            search: searchTerm,
            ...filterValues,
        }, { preserveState: true });
    }, [activeTab, searchTerm, filterValues]);

    const handleDelete = useCallback((id: number, type: TabKey) => {
        setConfirmDelete({ show: true, id, type });
    }, []);

    const onConfirmDelete = () => {
        if (confirmDelete.id && confirmDelete.type) {
            setDeleting(true);
            const routeMap: Record<TabKey, string> = {
                panels: 'panels.destroy',
                inverters: 'inverters.destroy',
                batteries: 'batteries.destroy',
            };
            router.delete(route(routeMap[confirmDelete.type], confirmDelete.id), {
                preserveScroll: true,
                onSuccess: () => {
                    setConfirmDelete({ show: false, id: null, type: null });
                    setDeleting(false);
                    showToast('Equipo eliminado.', 'success');
                },
                onError: () => {
                    setDeleting(false);
                },
            });
        }
    };

    const openEdit = useCallback((item: any) => {
        setEditingItem(item);
        if (activeTab === 'panels') setShowPanelModal(true);
        if (activeTab === 'inverters') setShowInverterModal(true);
        if (activeTab === 'batteries') setShowBatteryModal(true);
    }, [activeTab]);

    const openCreate = useCallback(() => {
        setEditingItem(null);
        if (activeTab === 'panels') setShowPanelModal(true);
        if (activeTab === 'inverters') setShowInverterModal(true);
        if (activeTab === 'batteries') setShowBatteryModal(true);
    }, [activeTab]);

    const closeModals = useCallback(() => {
        setShowPanelModal(false);
        setShowInverterModal(false);
        setShowBatteryModal(false);
        setTimeout(() => setEditingItem(null), 200);
    }, []);

    const handleTabChange = useCallback((tab: TabKey) => {
        setActiveTab(tab);
        setFilterValues({});
        setSearchTerm('');
    }, []);

    return (
        <AuthenticatedLayout header="Catálogo de Suministros">
            <Head title="Suministros" />

            <div className="mb-6">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
                    <div className="flex bg-[var(--surface)] border border-[var(--border-ui)] p-1 rounded-2xl overflow-x-auto w-full sm:w-auto hide-scrollbar shadow-sm">
                        {(Object.keys(TAB_CONFIG) as TabKey[]).map((tab) => {
                            const TabIcon = TAB_CONFIG[tab].icon;
                            return (
                                <button
                                    key={tab}
                                    onClick={() => handleTabChange(tab)}
                                    className={cn('px-6 py-2 rounded-xl text-sm font-bold font-outfit transition-all whitespace-nowrap flex items-center gap-2', activeTab === tab
                                        ? 'bg-[var(--solar-gold)] text-slate-900 shadow-sm'
                                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]')}
                                >
                                    <TabIcon className="h-4 w-4" />
                                    {TAB_CONFIG[tab].label}
                                </button>
                            );
                        })}
                    </div>

                    <button
                        onClick={openCreate}
                        className="flex items-center gap-2 bg-[var(--solar-gold)] text-slate-900 font-bold px-5 py-2.5 rounded-xl hover:brightness-110 transition-all shadow-lg"
                    >
                        <Plus className="h-4 w-4" />
                        <span>Nuevo {config.singular}</span>
                    </button>
                </div>

                <DataTable
                    key={activeTab}
                    data={currentData}
                    columns={columns}
                    searchPlaceholder={`Buscar ${config.label.toLowerCase()}...`}
                    emptyMessage={`No se encontraron ${config.label.toLowerCase()}`}
                    onSearch={handleSearch}
                    onFilterChange={handleFilterChange}
                    onPerPageChange={handlePerPageChange}
                    pagination={currentPagination}
                    filters={filters}
                    actions={(item) => (
                        <>
                            <button
                                onClick={() => openEdit(item)}
                                className="inline-flex p-2 rounded-xl hover:bg-blue-500/10 text-[var(--text-secondary)] hover:text-blue-400 transition-all"
                                title="Editar"
                            >
                                <Edit className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => handleDelete(item.id, activeTab)}
                                className="inline-flex p-2 rounded-xl hover:bg-red-500/10 text-[var(--text-secondary)] hover:text-red-400 transition-all"
                                title="Eliminar"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </>
                    )}
                />
            </div>

            <PanelFormModal show={showPanelModal} onClose={closeModals} panel={editingItem} />
            <InverterFormModal show={showInverterModal} onClose={closeModals} inverter={editingItem} />
            <BatteryFormModal show={showBatteryModal} onClose={closeModals} battery={editingItem} />

            <ConfirmModal
                show={confirmDelete.show}
                onClose={() => setConfirmDelete({ ...confirmDelete, show: false })}
                onConfirm={onConfirmDelete}
                title={`Eliminar ${config.singular}`}
                message={`¿Estás seguro de eliminar este ${config.singular.toLowerCase()}? Esta acción no se puede deshacer.`}
                confirmLabel="Eliminar"
                variant="danger"
                processing={deleting}
            />
        </AuthenticatedLayout>
    );
}