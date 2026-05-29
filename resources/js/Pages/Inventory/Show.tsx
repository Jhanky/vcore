import { useState } from 'react';
import { router, Link, Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { showToast } from '@/Components/Toast';
import {
    Package, Wrench, MapPin, Calendar, AlertTriangle,
    Warehouse, ExternalLink, ArrowLeft
} from 'lucide-react';

interface Props {
    item: any;
    canManage: boolean;
}

export default function InventoryShow({ item, canManage }: Props) {
    const [editingStock, setEditingStock] = useState(false);
    const [newQuantity, setNewQuantity] = useState(item.quantity);
    const [editingLocation, setEditingLocation] = useState(false);
    const [newLocationType, setNewLocationType] = useState(item.location_type);
    const [newWarehouseLocation, setNewWarehouseLocation] = useState(item.warehouse_location || '');
    const [newProjectId, setNewProjectId] = useState(item.project_id || '');

    const handleAdjustStock = () => {
        router.patch(route('inventory.adjust-stock', item.id), {
            quantity: newQuantity,
        }, {
            onSuccess: () => {
                showToast('Stock actualizado.', 'success');
                setEditingStock(false);
            },
        });
    };

    const handleChangeLocation = () => {
        router.patch(route('inventory.change-location', item.id), {
            location_type: newLocationType,
            warehouse_location: newWarehouseLocation,
            project_id: newProjectId || null,
        }, {
            onSuccess: () => {
                showToast('Ubicación actualizada.', 'success');
                setEditingLocation(false);
            },
        });
    };

    return (
        <AuthenticatedLayout header={`Inventario - ${item.name}`}>
            <Head title={`Inventario - ${item.name}`} />
            <div className="max-w-4xl mx-auto space-y-6">
                <Link href={route('inventory.index')} className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--solar-gold)] transition-colors">
                    <ArrowLeft className="h-4 w-4" /> Volver al inventario
                </Link>

                <div className="glass rounded-[2rem] p-8 border border-[var(--border-ui)]/30">
                    <div className="flex items-start justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <div className={`p-4 rounded-2xl ${item.type === 'tool' ? 'bg-emerald-500/10' : 'bg-blue-500/10'}`}>
                                {item.type === 'tool' ? (
                                    <Wrench className={`h-8 w-8 ${item.status === 'dado_de_baja' ? 'text-red-400' : 'text-emerald-400'}`} />
                                ) : (
                                    <Package className="h-8 w-8 text-blue-400" />
                                )}
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold font-outfit text-[var(--text-primary)]">{item.name}</h1>
                                <p className="text-sm text-[var(--text-secondary)]">
                                    {item.type === 'tool' ? 'Herramienta' : 'Material'}
                                    {item.code && ` · Código: ${item.code}`}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="glass rounded-xl p-4 border border-[var(--border-ui)]">
                            <p className="text-xs text-[var(--text-secondary)] mb-1">Cantidad</p>
                            <p className={`text-2xl font-bold font-outfit ${item.is_low_stock ? 'text-red-400' : 'text-[var(--text-primary)]'}`}>
                                {item.quantity} {item.unit}
                            </p>
                            {item.is_low_stock && (
                                <p className="text-xs text-red-400 flex items-center gap-1 mt-1">
                                    <AlertTriangle className="h-3 w-3" /> Stock bajo (mín: {item.min_stock})
                                </p>
                            )}
                            {canManage && !editingStock && (
                                <button onClick={() => setEditingStock(true)} className="text-xs text-[var(--solar-gold)] hover:underline mt-2">
                                    Ajustar stock
                                </button>
                            )}
                            {editingStock && (
                                <div className="flex gap-2 mt-2">
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={newQuantity}
                                        onChange={(e) => setNewQuantity(Number(e.target.value))}
                                        className="w-24 rounded-lg border-[var(--border-ui)] bg-slate-500/5 text-[var(--text-primary)] px-2 py-1 text-sm"
                                    />
                                    <PrimaryButton onClick={handleAdjustStock} className="text-xs py-1 px-3">Guardar</PrimaryButton>
                                    <SecondaryButton onClick={() => setEditingStock(false)} className="text-xs py-1 px-3">Cancelar</SecondaryButton>
                                </div>
                            )}
                        </div>

                        <div className="glass rounded-xl p-4 border border-[var(--border-ui)]">
                            <p className="text-xs text-[var(--text-secondary)] mb-1">Ubicación</p>
                            <div className="flex items-center gap-2">
                                {item.location_type === 'project' ? (
                                    <><ExternalLink className="h-4 w-4 text-blue-400" /><span className="text-sm font-medium text-blue-400">{item.project?.code || 'En proyecto'}</span></>
                                ) : (
                                    <><Warehouse className="h-4 w-4 text-[var(--text-secondary)]" /><span className="text-sm text-[var(--text-primary)]">{item.warehouse_location || 'Bodega'}</span></>
                                )}
                            </div>
                            {canManage && !editingLocation && (
                                <button onClick={() => setEditingLocation(true)} className="text-xs text-[var(--solar-gold)] hover:underline mt-2">
                                    Cambiar ubicación
                                </button>
                            )}
                        </div>

                        {item.type === 'tool' && (
                            <div className="glass rounded-xl p-4 border border-[var(--border-ui)]">
                                <p className="text-xs text-[var(--text-secondary)] mb-1">Estado</p>
                                <span className={`text-sm font-bold px-2 py-1 rounded-full ${
                                    item.status === 'disponible' ? 'bg-emerald-500/20 text-emerald-400' :
                                    item.status === 'en_proyecto' ? 'bg-blue-500/20 text-blue-400' :
                                    item.status === 'en_mantenimiento' ? 'bg-orange-500/20 text-orange-400' :
                                    item.status === 'dado_de_baja' ? 'bg-red-500/20 text-red-400' :
                                    'bg-gray-500/20 text-gray-400'
                                }`}>{item.status}</span>
                                {item.last_maintenance && (
                                    <p className="text-xs text-[var(--text-secondary)] flex items-center gap-1 mt-2">
                                        <Calendar className="h-3 w-3" /> Último mant.: {new Date(item.last_maintenance).toLocaleDateString('es-CO')}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    {editingLocation && (
                        <div className="glass rounded-xl p-4 border border-[var(--border-ui)] mb-6">
                            <h4 className="text-sm font-bold text-[var(--text-primary)] mb-3">Cambiar ubicación</h4>
                            <div className="flex flex-wrap gap-3">
                                <select
                                    value={newLocationType}
                                    onChange={(e) => setNewLocationType(e.target.value)}
                                    className="rounded-xl border-[var(--border-ui)] bg-slate-500/5 text-[var(--text-primary)] px-3 py-2 text-sm"
                                >
                                    <option value="warehouse">Bodega</option>
                                    <option value="project">En Proyecto</option>
                                </select>
                                {newLocationType === 'warehouse' ? (
                                    <input
                                        type="text"
                                        value={newWarehouseLocation}
                                        onChange={(e) => setNewWarehouseLocation(e.target.value)}
                                        placeholder="Ubicación en bodega"
                                        className="rounded-xl border-[var(--border-ui)] bg-slate-500/5 text-[var(--text-primary)] px-3 py-2 text-sm"
                                    />
                                ) : (
                                    <input
                                        type="text"
                                        value={newProjectId}
                                        onChange={(e) => setNewProjectId(e.target.value)}
                                        placeholder="ID del proyecto"
                                        className="rounded-xl border-[var(--border-ui)] bg-slate-500/5 text-[var(--text-primary)] px-3 py-2 text-sm"
                                    />
                                )}
                                <PrimaryButton onClick={handleChangeLocation} className="text-sm py-2">Guardar</PrimaryButton>
                                <SecondaryButton onClick={() => setEditingLocation(false)} className="text-sm py-2">Cancelar</SecondaryButton>
                            </div>
                        </div>
                    )}

                    {item.description && (
                        <div className="mb-6">
                            <h3 className="text-sm font-bold text-[var(--text-primary)] mb-2">Descripción</h3>
                            <p className="text-sm text-[var(--text-secondary)]">{item.description}</p>
                        </div>
                    )}

                    {item.notes && (
                        <div>
                            <h3 className="text-sm font-bold text-[var(--text-primary)] mb-2">Notas</h3>
                            <p className="text-sm text-[var(--text-secondary)]">{item.notes}</p>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
