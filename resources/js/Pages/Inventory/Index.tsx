import { useState, useCallback } from 'react';
import { router, Link, Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { DataTable } from '@/Components/DataTable';
import Modal from '@/Components/Modal';
import InventoryForm from './Form';
import { showToast } from '@/Components/Toast';
import {
    Package, Wrench, Plus, AlertTriangle,
    Warehouse, ExternalLink, Calendar
} from 'lucide-react';

interface InventoryItemData {
    id: number;
    type: string;
    code: string | null;
    name: string;
    quantity: number;
    unit: string;
    min_stock: number | null;
    status: string | null;
    is_low_stock: boolean;
    location_type: string;
    warehouse_location: string | null;
    last_maintenance: string | null;
    project: { id: number; code: string; name: string } | null;
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
}

export default function InventoryIndex({ items, filters, canManage }: Props) {
    const [showForm, setShowForm] = useState(false);
    const [editingItem, setEditingItem] = useState<InventoryItemData | null>(null);
    const [search, setSearch] = useState(filters.search || '');
    const [typeFilter, setTypeFilter] = useState(filters.type || '');

    const handleSearch = useCallback((value: string) => {
        setSearch(value);
        router.get(route('inventory.index'), { ...filters, search: value, per_page: items.per_page }, { preserveState: true, replace: true });
    }, [filters, items.per_page]);

    const handleTypeFilter = (type: string) => {
        setTypeFilter(type);
        router.get(route('inventory.index'), { ...filters, type, per_page: items.per_page }, { preserveState: true, replace: true });
    };

    const handleEdit = (item: InventoryItemData) => {
        setEditingItem(item);
        setShowForm(true);
    };

    const handleDelete = (item: InventoryItemData) => {
        if (confirm(`Eliminar "${item.name}"?`)) {
            router.delete(route('inventory.destroy', item.id), {
                onSuccess: () => showToast('Item eliminado.', 'success'),
            });
        }
    };

    const columns = [
        {
            key: 'type',
            label: 'Tipo',
            render: (item: InventoryItemData) => (
                <div className="flex items-center gap-2">
                    {item.type === 'tool' ? (
                        <Wrench className={`h-5 w-5 ${item.status === 'dado_de_baja' ? 'text-red-400' : item.status === 'en_mantenimiento' ? 'text-orange-400' : 'text-emerald-400'}`} />
                    ) : (
                        <Package className="h-5 w-5 text-blue-400" />
                    )}
                    <span className="text-xs font-medium text-[var(--text-secondary)]">
                        {item.type === 'tool' ? 'Herramienta' : 'Material'}
                    </span>
                </div>
            ),
        },
        {
            key: 'code',
            label: 'Código',
            render: (item: InventoryItemData) => (
                <span className="font-mono text-sm text-[var(--text-secondary)]">
                    {item.code || '-'}
                </span>
            ),
        },
        {
            key: 'name',
            label: 'Nombre',
            render: (item: InventoryItemData) => (
                <Link href={route('inventory.show', item.id)} className="font-bold text-[var(--solar-gold)] hover:brightness-125 transition-all">
                    {item.name}
                </Link>
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
            key: 'status',
            label: 'Estado',
            render: (item: InventoryItemData) => (
                item.type === 'tool' ? (
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                        item.status === 'disponible' ? 'bg-emerald-500/20 text-emerald-400' :
                        item.status === 'en_proyecto' ? 'bg-blue-500/20 text-blue-400' :
                        item.status === 'en_mantenimiento' ? 'bg-orange-500/20 text-orange-400' :
                        item.status === 'dado_de_baja' ? 'bg-red-500/20 text-red-400' :
                        'bg-gray-500/20 text-gray-400'
                    }`}>
                        {item.status || '-'}
                    </span>
                ) : <span className="text-xs text-[var(--text-secondary)]">-</span>
            ),
        },
        {
            key: 'location',
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
        {
            key: 'last_maintenance',
            label: 'Último Mant.',
            render: (item: InventoryItemData) => (
                <div className="flex items-center gap-1 text-sm text-[var(--text-secondary)]">
                    {item.type === 'tool' && item.last_maintenance ? (
                        <><Calendar className="h-3 w-3" />{new Date(item.last_maintenance).toLocaleDateString('es-CO')}</>
                    ) : '-'}
                </div>
            ),
        },
    ];

    return (
        <AuthenticatedLayout header="Inventario">
            <Head title="Inventario" />
            <div className="glass rounded-[2rem] p-6 border border-[var(--border-ui)]/30">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                        <div className="flex rounded-xl border border-[var(--border-ui)] overflow-hidden">
                            <button
                                onClick={() => handleTypeFilter('')}
                                className={`px-4 py-2 text-sm font-medium transition-colors ${!typeFilter ? 'bg-[var(--solar-gold)] text-slate-900' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                            >Todo</button>
                            <button
                                onClick={() => handleTypeFilter('material')}
                                className={`px-4 py-2 text-sm font-medium transition-colors border-x border-[var(--border-ui)] ${typeFilter === 'material' ? 'bg-[var(--solar-gold)] text-slate-900' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                            >Materiales</button>
                            <button
                                onClick={() => handleTypeFilter('tool')}
                                className={`px-4 py-2 text-sm font-medium transition-colors ${typeFilter === 'tool' ? 'bg-[var(--solar-gold)] text-slate-900' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                            >Herramientas</button>
                        </div>
                    </div>
                    {canManage && (
                        <button
                            onClick={() => { setEditingItem(null); setShowForm(true); }}
                            className="flex items-center gap-2 bg-[var(--solar-gold)] text-slate-900 font-bold px-5 py-2.5 rounded-xl hover:brightness-110 transition-all shadow-lg"
                        >
                            <Plus className="h-4 w-4" /> Nuevo Item
                        </button>
                    )}
                </div>

                <DataTable
                    data={items.data}
                    columns={columns}
                    searchPlaceholder="Buscar por código, nombre..."
                    emptyMessage="No hay items en el inventario"
                    pagination={items}
                    onSearch={handleSearch}
                    actions={(item: InventoryItemData) => canManage ? (
                        <div className="flex gap-1">
                            <button onClick={() => handleEdit(item)} className="p-2 rounded-xl hover:bg-[var(--solar-gold)]/10 text-[var(--text-secondary)] hover:text-[var(--solar-gold)] transition-colors" title="Editar">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            </button>
                            <button onClick={() => handleDelete(item)} className="p-2 rounded-xl hover:bg-red-500/10 text-[var(--text-secondary)] hover:text-red-400 transition-colors" title="Eliminar">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                        </div>
                    ) : null}
                />
            </div>

            <Modal show={showForm} onClose={() => setShowForm(false)} maxWidth="2xl">
                <InventoryForm
                    item={editingItem}
                    onClose={() => setShowForm(false)}
                />
            </Modal>
        </AuthenticatedLayout>
    );
}
