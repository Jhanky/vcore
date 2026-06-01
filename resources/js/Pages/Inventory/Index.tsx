import { useState, useCallback } from 'react';
import { router, Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { showToast } from '@/Components/Toast';
import { Search, Package, Plus, Trash2, Pencil, Wrench, AlertTriangle, ExternalLink, Warehouse, Calendar } from 'lucide-react';
import { DataTable } from '@/Components/DataTable';
import Modal from '@/Components/Modal';
import ConfirmModal from '@/Components/ConfirmModal';
import { formatCurrencySimple as formatCurrency } from '@/utils/format';
import { cn } from '@/utils/cn';
import InventoryForm from './Form';

interface InventoryItemData {
    id: number;
    name: string;
    code: string;
    brand: string;
    model: string;
    serial_number: string | null;
    quantity: number;
    unit: string;
    purchase_cost: number | null;
    status: string;
    type: string;
    category: string;
    supplier: string | null;
    location_type: string;
    warehouse_location: string | null;
    project: { id: number; code: string } | null;
    is_low_stock: boolean;
    last_maintenance: string | null;
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
    items: PaginatedData;
    filters: Record<string, any>;
    canManage: boolean;
    projects: any[];
}

export default function InventoryIndex({ items, filters, canManage, projects }: Props) {
    const [showForm, setShowForm] = useState(false);
    const [editingItem, setEditingItem] = useState<InventoryItemData | null>(null);
    const [search, setSearch] = useState(filters.search || '');
    const activeTab = filters.type || 'material';

    const [deleteTarget, setDeleteTarget] = useState<{ show: boolean; item: InventoryItemData | null }>({ show: false, item: null });
    const [deleting, setDeleting] = useState(false);

    const switchTab = (tab: string) => {
        router.get(route('inventory.index'), { ...filters, type: tab, search: undefined, per_page: items.per_page }, { preserveState: true, replace: true });
    };

    const handleSearch = useCallback((value: string) => {
        setSearch(value);
        router.get(route('inventory.index'), { ...filters, type: activeTab, search: value, per_page: items.per_page }, { preserveState: true, replace: true });
    }, [filters, activeTab, items.per_page]);

    const handleFilterChange = useCallback((key: string, value: string) => {
        router.get(route('inventory.index'), { ...filters, type: activeTab, [key]: value || undefined, per_page: items.per_page }, { preserveState: true, replace: true });
    }, [filters, activeTab, items.per_page]);

    const handleEdit = (item: InventoryItemData) => {
        setEditingItem(item);
        setShowForm(true);
    };

    const handleDelete = (item: InventoryItemData) => {
        setDeleteTarget({ show: true, item });
    };

    const confirmDelete = () => {
        if (deleteTarget.item) {
            setDeleting(true);
            router.delete(route('inventory.destroy', deleteTarget.item.id), {
                onSuccess: () => {
                    setDeleteTarget({ show: false, item: null });
                    setDeleting(false);
                    showToast('Item eliminado.', 'success');
                },
                onError: () => setDeleting(false),
            });
        }
    };

    const handleNewItem = () => {
        setEditingItem(null);
        setShowForm(true);
    };

    const columns = activeTab === 'tool' ? [
        {
            key: 'type',
            label: 'Tipo',
            render: (item: InventoryItemData) => (
                <div className="flex items-center gap-2">
                    <Wrench className={cn('h-5 w-5', item.status === 'dado_de_baja' ? 'text-red-400' : item.status === 'en_mantenimiento' ? 'text-orange-400' : 'text-emerald-400')} />
                    <span className="text-xs font-medium text-[var(--text-secondary)]">Herramienta</span>
                </div>
            ),
        },
        {
            key: 'code',
            label: 'Código',
            hideOnMobile: true,
            render: (item: InventoryItemData) => (
                <span className="font-mono text-sm text-[var(--text-secondary)]">{item.code || '-'}</span>
            ),
        },
        {
            key: 'name',
            label: 'Nombre',
            render: (item: InventoryItemData) => (
                <Link href={route('inventory.show', item.id)} className="font-bold text-[var(--solar-gold)] hover:brightness-125 transition-all">{item.name}</Link>
            ),
        },
        {
            key: 'brand',
            label: 'Marca',
            hideOnMobile: true,
            render: (item: InventoryItemData) => (
                <span className="text-sm text-[var(--text-secondary)]">{item.brand || '-'}</span>
            ),
        },
        {
            key: 'model',
            hideOnMobile: true,
            label: 'Modelo',
            render: (item: InventoryItemData) => (
                <span className="text-sm text-[var(--text-secondary)]">{item.model || '-'}</span>
            ),
        },
        {
            key: 'serial_number',
            label: 'Serial',
            hideOnMobile: true,
            render: (item: InventoryItemData) => (
                <span className="text-xs font-mono text-[var(--text-secondary)]">{item.serial_number || '-'}</span>
            ),
        },
        {
            key: 'quantity',
            label: 'Cantidad',
            render: (item: InventoryItemData) => (
                <div className="flex items-center gap-2">
                    <span className={`font-bold ${item.is_low_stock ? 'text-red-400' : 'text-[var(--text-primary)]'}`}>
                        {item.quantity} {item.unit}
                    </span>
                    {item.is_low_stock && <AlertTriangle className="h-4 w-4 text-red-400" />}
                </div>
            ),
        },
        {
            key: 'purchase_cost',
            label: 'Costo',
            hideOnMobile: true,
            render: (item: InventoryItemData) => (
                <span className="text-sm text-[var(--text-secondary)]">{item.purchase_cost ? formatCurrency(item.purchase_cost) + ' / ' + item.unit : '-'}</span>
            ),
        },
        {
            key: 'status',
            label: 'Estado',
            render: (item: InventoryItemData) => (
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                    item.status === 'disponible' ? 'bg-emerald-500/20 text-emerald-400' :
                    item.status === 'en_proyecto' ? 'bg-blue-500/20 text-blue-400' :
                    item.status === 'en_mantenimiento' ? 'bg-orange-500/20 text-orange-400' :
                    item.status === 'dado_de_baja' ? 'bg-red-500/20 text-red-400' :
                    'bg-gray-500/20 text-gray-400'
                }`}>
                    {item.status || '-'}
                </span>
            ),
        },
        {
            key: 'last_maintenance',
            label: 'Último Mant.',
            hideOnMobile: true,
            render: (item: InventoryItemData) => (
                <div className="flex items-center gap-1 text-sm text-[var(--text-secondary)]">
                    {item.last_maintenance ? <><Calendar className="h-3 w-3" />{new Date(item.last_maintenance).toLocaleDateString('es-CO')}</> : '-'}
                </div>
            ),
        },
        {
            key: 'location',
            hideOnMobile: true,
            label: 'Ubicación',
            render: (item: InventoryItemData) => (
                <div className="flex items-center gap-1 text-sm">
                    {item.location_type === 'project' ? (
                        <><ExternalLink className="h-3 w-3 text-blue-400" /><span className="text-blue-400">{item.project?.code || 'Proyecto'}</span></>
                    ) : (
                        <><Warehouse className="h-3 w-3 text-[var(--text-secondary)]" /><span className="text-[var(--text-secondary)]">{item.warehouse_location || 'Bodega'}</span></>
                    )}
                </div>
            ),
        },
    ] : [
        {
            key: 'type',
            label: 'Tipo',
            render: (item: InventoryItemData) => (
                <div className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-blue-400" />
                    <span className="text-xs font-medium text-[var(--text-secondary)]">Material</span>
                </div>
            ),
        },
        {
            key: 'code',
            label: 'Código',
            hideOnMobile: true,
            render: (item: InventoryItemData) => (
                <span className="font-mono text-sm text-[var(--text-secondary)]">{item.code || '-'}</span>
            ),
        },
        {
            key: 'name',
            label: 'Nombre',
            render: (item: InventoryItemData) => (
                <Link href={route('inventory.show', item.id)} className="font-bold text-[var(--solar-gold)] hover:brightness-125 transition-all">{item.name}</Link>
            ),
        },
        {
            key: 'category',
            label: 'Categoría',
            hideOnMobile: true,
            render: (item: InventoryItemData) => {
                const labels: Record<string, string> = {
                    cable: 'Cable', panel: 'Panel', inversor: 'Inversor',
                    bateria: 'Batería', estructura: 'Estructura', proteccion: 'Protección',
                    conector: 'Conector', tuberia: 'Tubería', otro: 'Otro',
                };
                return <span className="text-sm text-[var(--text-secondary)]">{item.category ? labels[item.category] || item.category : '-'}</span>;
            },
        },
        {
            key: 'brand',
            label: 'Marca',
            hideOnMobile: true,
            render: (item: InventoryItemData) => (
                <span className="text-sm text-[var(--text-secondary)]">{item.brand || '-'}</span>
            ),
        },
        {
            key: 'supplier',
            label: 'Proveedor',
            hideOnMobile: true,
            render: (item: InventoryItemData) => (
                <span className="text-sm text-[var(--text-secondary)]">{item.supplier || '-'}</span>
            ),
        },
        {
            key: 'quantity',
            label: 'Cantidad',
            render: (item: InventoryItemData) => (
                <div className="flex items-center gap-2">
                    <span className={`font-bold ${item.is_low_stock ? 'text-red-400' : 'text-[var(--text-primary)]'}`}>
                        {item.quantity} {item.unit}
                    </span>
                    {item.is_low_stock && <AlertTriangle className="h-4 w-4 text-red-400" />}
                </div>
            ),
        },
        {
            key: 'purchase_cost',
            label: 'Costo',
            hideOnMobile: true,
            render: (item: InventoryItemData) => (
                <span className="text-sm text-[var(--text-secondary)]">{item.purchase_cost ? formatCurrency(item.purchase_cost) + ' / ' + item.unit : '-'}</span>
            ),
        },
        {
            key: 'status',
            label: 'Estado',
            render: (item: InventoryItemData) => (
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                    item.status === 'disponible' ? 'bg-emerald-500/20 text-emerald-400' :
                    item.status === 'en_proyecto' ? 'bg-blue-500/20 text-blue-400' :
                    item.status === 'agotado' ? 'bg-red-500/20 text-red-400' :
                    item.status === 'descontinuado' ? 'bg-gray-500/20 text-gray-400' :
                    'bg-gray-500/20 text-gray-400'
                }`}>
                    {item.status || '-'}
                </span>
            ),
        },
        {
            key: 'location',
            label: 'Ubicación',
            hideOnMobile: true,
            render: (item: InventoryItemData) => (
                <div className="flex items-center gap-1 text-sm">
                    {item.location_type === 'project' ? (
                        <><ExternalLink className="h-3 w-3 text-blue-400" /><span className="text-blue-400">{item.project?.code || 'Proyecto'}</span></>
                    ) : (
                        <><Warehouse className="h-3 w-3 text-[var(--text-secondary)]" /><span className="text-[var(--text-secondary)]">{item.warehouse_location || 'Bodega'}</span></>
                    )}
                </div>
            ),
        },
    ];

    const statusOptions = activeTab === 'tool'
        ? [
            { value: 'disponible', label: 'Disponible' },
            { value: 'en_proyecto', label: 'En Proyecto' },
            { value: 'en_mantenimiento', label: 'En Mantenimiento' },
            { value: 'dado_de_baja', label: 'Dado de Baja' },
        ]
        : [
            { value: 'disponible', label: 'Disponible' },
            { value: 'en_proyecto', label: 'En Proyecto' },
            { value: 'agotado', label: 'Agotado' },
            { value: 'descontinuado', label: 'Descontinuado' },
        ];

    return (
        <AuthenticatedLayout header="Inventario">
            <Head title="Inventario" />

            <div className="mb-6">
                <div className="overflow-x-auto hide-scrollbar">
                    <div className="flex gap-1 glass rounded-2xl p-1.5 border border-[var(--border-ui)]/30 inline-flex">
                    <button
                        onClick={() => switchTab('material')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${
                            activeTab === 'material'
                                ? 'bg-[var(--solar-gold)] text-slate-900 shadow-lg'
                                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                        }`}
                    >
                        <Package className="h-4 w-4" />
                        Materiales
                    </button>
                    <button
                        onClick={() => switchTab('tool')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${
                            activeTab === 'tool'
                                ? 'bg-[var(--solar-gold)] text-slate-900 shadow-lg'
                                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                        }`}
                    >
                        <Wrench className="h-4 w-4" />
                        Herramientas
                    </button>
                    </div>
                </div>
            </div>

            <DataTable
                    data={items.data}
                    columns={columns}
                    searchPlaceholder="Buscar por código, nombre..."
                    emptyMessage={activeTab === 'tool' ? 'No hay herramientas en el inventario' : 'No hay materiales en el inventario'}
                    pagination={items}
                    onSearch={handleSearch}
                    onFilterChange={handleFilterChange}
                    filters={[{
                        key: 'status',
                        label: 'Estado',
                        options: statusOptions,
                    }, {
                        key: 'location_type',
                        label: 'Ubicación',
                        options: [
                            { value: 'warehouse', label: 'Bodega' },
                            { value: 'project', label: 'Proyecto' },
                        ],
                    }, ...(activeTab === 'material' ? [{
                        key: 'category',
                        label: 'Categoría',
                        options: [
                            { value: 'cable', label: 'Cable' },
                            { value: 'panel', label: 'Panel' },
                            { value: 'inversor', label: 'Inversor' },
                            { value: 'bateria', label: 'Batería' },
                            { value: 'estructura', label: 'Estructura' },
                            { value: 'proteccion', label: 'Protección' },
                            { value: 'conector', label: 'Conector' },
                            { value: 'tuberia', label: 'Tubería' },
                            { value: 'otro', label: 'Otro' },
                        ],
                    }] : [])]}
                    actions={(item: InventoryItemData) => canManage ? (
                        <div className="flex gap-1">
                            <button onClick={() => handleEdit(item)} className="inline-flex p-2 rounded-xl hover:bg-blue-500/10 text-[var(--text-secondary)] hover:text-blue-400 transition-all" title="Editar">
                                <Pencil className="h-4 w-4" />
                            </button>
                            <button onClick={() => handleDelete(item)} className="inline-flex p-2 rounded-xl hover:bg-red-500/10 text-[var(--text-secondary)] hover:text-red-400 transition-all" title="Eliminar">
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    ) : null}
                    headerAction={canManage && (
                        <button
                            onClick={handleNewItem}
                            className="flex items-center gap-2 bg-[var(--solar-gold)] text-slate-900 font-bold px-5 py-2.5 rounded-xl hover:brightness-110 transition-all shadow-lg"
                        >
                            <Plus className="h-4 w-4" />
                            <span>Nuevo {activeTab === 'tool' ? 'Herramienta' : 'Material'}</span>
                        </button>
                    )}
                />

            <Modal show={showForm} onClose={() => setShowForm(false)} maxWidth="2xl">
                <InventoryForm
                    item={editingItem}
                    projects={projects}
                    defaultType={!editingItem ? activeTab : undefined}
                    onClose={() => setShowForm(false)}
                />
            </Modal>

            <ConfirmModal
                show={deleteTarget.show}
                onClose={() => setDeleteTarget({ show: false, item: null })}
                onConfirm={confirmDelete}
                title="Eliminar Item"
                message={`¿Estás seguro de eliminar "${deleteTarget.item?.name}"? Esta acción no se puede deshacer.`}
                confirmLabel="Eliminar"
                variant="danger"
                processing={deleting}
            />
        </AuthenticatedLayout>
    );
}
