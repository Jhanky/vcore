import { useState, useEffect } from 'react';
import { router, usePage } from '@inertiajs/react';
import { Package, Sun, Zap, Battery, Plus, Trash2, Upload, ChevronDown, ChevronRight } from 'lucide-react';
import Modal from '@/Components/Modal';
import { showToast } from '@/Components/Toast';

const TYPE_CONFIG: Record<string, { icon: any; label: string; color: string }> = {
    panel: { icon: Sun, label: 'Paneles', color: 'text-amber-400' },
    inverter: { icon: Zap, label: 'Inversores', color: 'text-blue-400' },
    battery: { icon: Battery, label: 'Baterías', color: 'text-emerald-400' },
};

export default function ProjectEquipmentTab({ project, suppliers }: { project: any; suppliers?: any[] }) {
    const hasQuotation = !!project.quotation;
    const equipment = project.equipment || [];
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [showSupplierModal, setShowSupplierModal] = useState(false);
    const [editingEquipment, setEditingEquipment] = useState<any>(null);
    const [selectedSupplier, setSelectedSupplier] = useState<string>('');
    const [batchSerials, setBatchSerials] = useState('');
    const [singleSerial, setSingleSerial] = useState('');
    const [activeSerialEquipment, setActiveSerialEquipment] = useState<number | null>(null);
    const [supplierList, setSupplierList] = useState<any[]>(suppliers || []);

    const [newSupplier, setNewSupplier] = useState({ name: '', nit: '', contact_name: '', phone: '' });
    const [showNewSupplier, setShowNewSupplier] = useState(false);

    const grouped = {
        panel: equipment.filter((e: any) => e.product_type === 'panel'),
        inverter: equipment.filter((e: any) => e.product_type === 'inverter'),
        battery: equipment.filter((e: any) => e.product_type === 'battery'),
    };

    const hasAnyEquipment = Object.values(grouped).some((g: any) => g.length > 0);

    const loadSuppliers = () => {
        router.get(route('suppliers.list'), {}, {
            preserveState: true,
            onSuccess: (page: any) => {
                if (page.props?.suppliers) {
                    setSupplierList(page.props.suppliers);
                }
            },
        });
    };

    useEffect(() => {
        if (suppliers?.length) setSupplierList(suppliers);
    }, [suppliers]);

    const handleImport = () => {
        router.post(route('projects.equipment.import', project.id), {}, {
            preserveScroll: true,
            onSuccess: () => showToast('Equipos importados desde la cotización', 'success'),
            onError: () => showToast('Error al importar equipos', 'error'),
        });
    };

    const handleUpdateSupplier = (equipment: any) => {
        router.put(route('projects.equipment.update', [project.id, equipment.id]), {
            supplier_id: selectedSupplier || null,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setEditingEquipment(null);
                showToast('Proveedor asignado', 'success');
            },
            onError: () => showToast('Error al actualizar', 'error'),
        });
    };

    const handleDeleteEquipment = (equipmentId: number) => {
        if (!confirm('¿Eliminar este equipo del proyecto?')) return;
        router.delete(route('projects.equipment.destroy', [project.id, equipmentId]), {
            preserveScroll: true,
            onError: (errors) => showError(errors),
        });
    };

    const showError = (errors: any) => {
        if (typeof errors === 'string') { showToast(errors, 'error'); return; }
        if (errors?.error) { showToast(errors.error, 'error'); return; }
        showToast('Error al agregar serial(es)', 'error');
    };

    const handleAddSerial = (equipmentId: number) => {
        if (!singleSerial.trim()) return;
        router.post(route('projects.equipment.serials.store', [project.id, equipmentId]), {
            serials: [singleSerial.trim()],
        }, {
            preserveScroll: true,
            onSuccess: () => { setSingleSerial(''); showToast('Serial agregado', 'success'); },
            onError: (errors) => showError(errors),
        });
    };

    const handleAddBatchSerials = (equipmentId: number) => {
        const serials = batchSerials
            .split('\n')
            .map((s: string) => s.trim())
            .filter((s: string) => s.length > 0);
        if (serials.length === 0) return;
        router.post(route('projects.equipment.serials.store', [project.id, equipmentId]), {
            serials,
        }, {
            preserveScroll: true,
            onSuccess: () => { setBatchSerials(''); showToast(`${serials.length} seriales agregados`, 'success'); },
            onError: (errors) => showError(errors),
        });
    };

    const handleDeleteSerial = (equipmentId: number, serialId: number) => {
        router.delete(route('projects.equipment.serials.destroy', [project.id, equipmentId, serialId]), {
            preserveScroll: true,
        });
    };

    const handleCreateSupplier = () => {
        router.post(route('suppliers.store'), newSupplier, {
            preserveScroll: true,
            onSuccess: () => {
                setShowNewSupplier(false);
                setNewSupplier({ name: '', nit: '', contact_name: '', phone: '' });
                loadSuppliers();
                showToast('Proveedor creado', 'success');
            },
            onError: () => showToast('Error al crear proveedor', 'error'),
        });
    };

    return (
        <div className="glass rounded-[2rem] p-8">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <Package className="h-6 w-6 text-[var(--solar-gold)]" />
                    <h2 className="text-xl font-bold font-outfit text-[var(--text-primary)]">Equipos del Proyecto</h2>
                </div>
                {hasQuotation && (
                    <button
                        onClick={handleImport}
                        className="flex items-center gap-2 px-4 py-2 bg-[var(--solar-gold)] text-slate-900 rounded-xl font-bold text-sm hover:brightness-110 transition-all"
                    >
                        <Upload className="h-4 w-4" />
                        Importar de cotización
                    </button>
                )}
            </div>

            {!hasAnyEquipment && (
                <div className="text-center py-12">
                    <Package className="h-12 w-12 mx-auto text-[var(--text-secondary)] mb-4" />
                    <p className="text-[var(--text-secondary)]">No hay equipos registrados para este proyecto</p>
                    {hasQuotation && (
                        <button
                            onClick={handleImport}
                            className="mt-4 px-4 py-2 bg-[var(--solar-gold)] text-slate-900 rounded-xl font-bold text-sm hover:brightness-110 transition-all"
                        >
                            Importar equipos desde la cotización
                        </button>
                    )}
                </div>
            )}

            {Object.entries(grouped).map(([type, items]: [string, any]) => {
                if (items.length === 0) return null;
                const config = TYPE_CONFIG[type];
                const Icon = config.icon;

                return (
                    <div key={type} className="mb-8 last:mb-0">
                        <h3 className="flex items-center gap-2 text-sm font-bold text-[var(--text-primary)] mb-4 uppercase tracking-wide">
                            <Icon className={`h-4 w-4 ${config.color}`} />
                            {config.label}
                            <span className="text-[var(--text-secondary)] font-normal normal-case">({items.length} tipo{items.length !== 1 ? 's' : ''})</span>
                        </h3>

                        <div className="grid grid-cols-1 gap-4">
                            {items.map((item: any) => (
                                <div
                                    key={item.id}
                                    className="bg-slate-500/5 rounded-2xl border border-[var(--border-ui)]/50 overflow-hidden"
                                >
                                    <div className="p-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-bold text-[var(--text-primary)]">{item.brand || '—'}</span>
                                                    <span className="text-sm text-[var(--text-secondary)]">{item.model || ''}</span>
                                                </div>
                                                <div className="flex items-center gap-4 mt-2 text-xs text-[var(--text-secondary)]">
                                                    <span>Cantidad: <strong className="text-[var(--text-primary)]">{item.quantity}</strong></span>

                                                    <span className="flex items-center gap-1">
                                                        Proveedor:
                                                        {item.supplier ? (
                                                            <strong className="text-[var(--solar-gold)]">{item.supplier.name}</strong>
                                                        ) : (
                                                            <span className="text-amber-400">Sin asignar</span>
                                                        )}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => {
                                                        setEditingEquipment(item);
                                                        setSelectedSupplier(item.supplier_id?.toString() || '');
                                                        setShowSupplierModal(true);
                                                    }}
                                                    className="p-2 rounded-lg hover:bg-slate-500/10 text-[var(--text-secondary)] hover:text-[var(--solar-gold)] transition-colors"
                                                    title="Asignar proveedor"
                                                >
                                                    <Package className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteEquipment(item.id)}
                                                    className="p-2 rounded-lg hover:bg-red-500/10 text-[var(--text-secondary)] hover:text-red-400 transition-colors"
                                                    title="Eliminar equipo"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                                                    className="p-2 rounded-lg hover:bg-slate-500/10 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                                                >
                                                    {expandedId === item.id ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 mt-2">
                                            {(item.serials || []).slice(0, 5).map((s: any) => (
                                                <span key={s.id} className="px-2 py-0.5 bg-slate-500/10 rounded-lg text-xs text-[var(--text-secondary)] font-mono">
                                                    {s.serial_number}
                                                </span>
                                            ))}
                                            {(item.serials || []).length > 5 && (
                                                <span className="text-xs text-[var(--text-secondary)]">
                                                    +{item.serials.length - 5} más
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {expandedId === item.id && (
                                        <div className="border-t border-[var(--border-ui)]/50 p-4 bg-slate-500/5">
                                            <h4 className="text-sm font-bold text-[var(--text-primary)] mb-3">
                                                Números de Serie ({item.serials?.length || 0}/{item.quantity})
                                            </h4>

                                            <div className="space-y-2 mb-4">
                                                {(item.serials || []).map((serial: any) => (
                                                    <div key={serial.id} className="flex items-center justify-between bg-slate-500/10 rounded-xl px-3 py-2">
                                                        <span className="text-sm font-mono text-[var(--text-primary)]">{serial.serial_number}</span>
                                                        <button
                                                            onClick={() => handleDeleteSerial(item.id, serial.id)}
                                                            className="p-1 rounded-lg hover:bg-red-500/10 text-[var(--text-secondary)] hover:text-red-400 transition-colors"
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="flex gap-2 mb-3">
                                                <input
                                                    type="text"
                                                    placeholder="Serial individual..."
                                                    value={activeSerialEquipment === item.id ? singleSerial : ''}
                                                    onChange={(e) => {
                                                        setActiveSerialEquipment(item.id);
                                                        setSingleSerial(e.target.value);
                                                    }}
                                                    className="flex-1 px-3 py-2 bg-slate-500/10 border border-[var(--border-ui)] rounded-xl text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--solar-gold)]"
                                                />
                                                <button
                                                    onClick={() => { setActiveSerialEquipment(item.id); handleAddSerial(item.id); }}
                                                    className="px-3 py-2 bg-[var(--solar-gold)] text-slate-900 rounded-xl font-bold text-sm hover:brightness-110 transition-all"
                                                >
                                                    <Plus className="h-4 w-4" />
                                                </button>
                                            </div>

                                            <div>
                                                <textarea
                                                    placeholder="O pega múltiples seriales (uno por línea)..."
                                                    value={activeSerialEquipment === item.id ? batchSerials : ''}
                                                    onChange={(e) => {
                                                        setActiveSerialEquipment(item.id);
                                                        setBatchSerials(e.target.value);
                                                    }}
                                                    rows={3}
                                                    className="w-full px-3 py-2 bg-slate-500/10 border border-[var(--border-ui)] rounded-xl text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--solar-gold)] resize-none"
                                                />
                                                <button
                                                    onClick={() => { setActiveSerialEquipment(item.id); handleAddBatchSerials(item.id); }}
                                                    className="mt-2 px-3 py-1.5 bg-slate-500/20 text-[var(--text-primary)] rounded-xl text-xs font-bold hover:bg-slate-500/30 transition-colors"
                                                >
                                                    Agregar en lote
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}

            <Modal show={showSupplierModal} onClose={() => { setShowSupplierModal(false); setShowNewSupplier(false); }} maxWidth="sm">
                <div className="p-4 sm:p-6">
                    <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4">
                        Asignar Proveedor
                    </h3>

                    {showNewSupplier ? (
                        <div className="space-y-3">
                            <input
                                type="text"
                                placeholder="Nombre del proveedor *"
                                value={newSupplier.name}
                                onChange={e => setNewSupplier({ ...newSupplier, name: e.target.value })}
                                className="w-full px-3 py-2 bg-slate-500/10 border border-[var(--border-ui)] rounded-xl text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--solar-gold)]"
                            />
                            <input
                                type="text"
                                placeholder="NIT"
                                value={newSupplier.nit}
                                onChange={e => setNewSupplier({ ...newSupplier, nit: e.target.value })}
                                className="w-full px-3 py-2 bg-slate-500/10 border border-[var(--border-ui)] rounded-xl text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--solar-gold)]"
                            />
                            <input
                                type="text"
                                placeholder="Nombre de contacto"
                                value={newSupplier.contact_name}
                                onChange={e => setNewSupplier({ ...newSupplier, contact_name: e.target.value })}
                                className="w-full px-3 py-2 bg-slate-500/10 border border-[var(--border-ui)] rounded-xl text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--solar-gold)]"
                            />
                            <input
                                type="text"
                                placeholder="Teléfono"
                                value={newSupplier.phone}
                                onChange={e => setNewSupplier({ ...newSupplier, phone: e.target.value })}
                                className="w-full px-3 py-2 bg-slate-500/10 border border-[var(--border-ui)] rounded-xl text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--solar-gold)]"
                            />
                            <div className="flex gap-2 pt-2">
                                <button
                                    onClick={() => setShowNewSupplier(false)}
                                    className="flex-1 px-3 py-2 rounded-xl text-sm font-medium text-[var(--text-secondary)] hover:bg-slate-500/10 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleCreateSupplier}
                                    className="flex-1 px-3 py-2 bg-[var(--solar-gold)] text-slate-900 rounded-xl font-bold text-sm hover:brightness-110 transition-all"
                                >
                                    Crear Proveedor
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <select
                                value={selectedSupplier}
                                onChange={e => setSelectedSupplier(e.target.value)}
                                className="w-full px-3 py-2 bg-slate-500/10 border border-[var(--border-ui)] rounded-xl text-sm text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--solar-gold)]"
                            >
                                <option value="">Sin proveedor</option>
                                {supplierList.map((s: any) => (
                                    <option key={s.id} value={s.id}>{s.name} {s.nit ? `(${s.nit})` : ''}</option>
                                ))}
                            </select>

                            <button
                                onClick={() => setShowNewSupplier(true)}
                                className="w-full px-3 py-2 rounded-xl text-sm font-medium text-[var(--solar-gold)] hover:bg-[var(--solar-gold)]/10 transition-colors border border-dashed border-[var(--solar-gold)]/30"
                            >
                                + Nuevo Proveedor
                            </button>

                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    onClick={() => setShowSupplierModal(false)}
                                    className="px-4 py-2 rounded-xl text-sm font-medium text-[var(--text-secondary)] hover:bg-slate-500/10 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={() => editingEquipment && handleUpdateSupplier(editingEquipment)}
                                    className="px-4 py-2 bg-[var(--solar-gold)] text-slate-900 rounded-xl font-bold text-sm hover:brightness-110 transition-all"
                                >
                                    Guardar
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </Modal>
        </div>
    );
}
