import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { showToast } from '@/Components/Toast';

interface Props {
    item?: any;
    onClose: () => void;
}

export default function InventoryForm({ item, onClose }: Props) {
    const isEditing = !!item;

    const { data, setData, post, put, processing, errors, reset } = useForm({
        type: item?.type || 'material',
        code: item?.code || '',
        name: item?.name || '',
        description: item?.description || '',
        unit: item?.unit || 'unidad',
        quantity: item?.quantity ?? 0,
        min_stock: item?.min_stock ?? '',
        status: item?.status || '',
        last_maintenance: item?.last_maintenance || '',
        location_type: item?.location_type || 'warehouse',
        project_id: item?.project_id || '',
        warehouse_location: item?.warehouse_location || '',
        notes: item?.notes || '',
    });

    useEffect(() => {
        if (item) reset();
    }, [item]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEditing) {
            put(route('inventory.update', item.id), {
                onSuccess: () => {
                    showToast('Item actualizado.', 'success');
                    onClose();
                },
            });
        } else {
            post(route('inventory.store'), {
                onSuccess: () => {
                    showToast('Item creado.', 'success');
                    onClose();
                    reset();
                },
            });
        }
    };

    return (
        <div className="p-6">
            <h2 className="text-xl font-bold font-outfit text-[var(--text-primary)] mb-6">
                {isEditing ? 'Editar Item' : 'Nuevo Item'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <InputLabel value="Tipo" />
                        <select
                            value={data.type}
                            onChange={(e) => setData('type', e.target.value)}
                            className="w-full rounded-xl border-[var(--border-ui)] bg-transparent text-[var(--text-primary)] px-4 py-3 [&>option]:bg-[var(--bg-content)]"
                        >
                            <option value="material">Material</option>
                            <option value="tool">Herramienta</option>
                        </select>
                        <InputError message={errors.type} />
                    </div>

                    <div>
                        <InputLabel value="Código interno" />
                        <input
                            type="text"
                            value={data.code}
                            onChange={(e) => setData('code', e.target.value)}
                            className="w-full rounded-xl border-[var(--border-ui)] bg-slate-500/5 text-[var(--text-primary)] px-4 py-3"
                            placeholder="Ej: TOR-001"
                        />
                        <InputError message={errors.code} />
                    </div>

                    <div className="md:col-span-2">
                        <InputLabel value="Nombre" />
                        <input
                            type="text"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            className="w-full rounded-xl border-[var(--border-ui)] bg-slate-500/5 text-[var(--text-primary)] px-4 py-3"
                            placeholder="Nombre del item"
                            required
                        />
                        <InputError message={errors.name} />
                    </div>

                    <div className="md:col-span-2">
                        <InputLabel value="Descripción" />
                        <textarea
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            className="w-full rounded-xl border-[var(--border-ui)] bg-slate-500/5 text-[var(--text-primary)] px-4 py-3"
                            rows={3}
                        />
                        <InputError message={errors.description} />
                    </div>

                    <div>
                        <InputLabel value="Unidad de medida" />
                        <select
                            value={data.unit}
                            onChange={(e) => setData('unit', e.target.value)}
                            className="w-full rounded-xl border-[var(--border-ui)] bg-transparent text-[var(--text-primary)] px-4 py-3 [&>option]:bg-[var(--bg-content)]"
                        >
                            <option value="unidad">Unidad</option>
                            <option value="metro">Metro</option>
                            <option value="caja">Caja</option>
                            <option value="paquete">Paquete</option>
                            <option value="kg">Kilogramo</option>
                            <option value="litro">Litro</option>
                        </select>
                    </div>

                    <div>
                        <InputLabel value="Cantidad" />
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={data.quantity}
                            onChange={(e) => setData('quantity', e.target.value)}
                            className="w-full rounded-xl border-[var(--border-ui)] bg-slate-500/5 text-[var(--text-primary)] px-4 py-3"
                            required
                        />
                        <InputError message={errors.quantity} />
                    </div>

                    <div>
                        <InputLabel value="Stock mínimo" />
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={data.min_stock}
                            onChange={(e) => setData('min_stock', e.target.value)}
                            className="w-full rounded-xl border-[var(--border-ui)] bg-slate-500/5 text-[var(--text-primary)] px-4 py-3"
                            placeholder="Opcional"
                        />
                    </div>

                    {data.type === 'tool' && (
                        <>
                            <div>
                                <InputLabel value="Estado" />
                                <select
                                    value={data.status}
                                    onChange={(e) => setData('status', e.target.value)}
                                    className="w-full rounded-xl border-[var(--border-ui)] bg-transparent text-[var(--text-primary)] px-4 py-3 [&>option]:bg-[var(--bg-content)]"
                                >
                                    <option value="disponible">Disponible</option>
                                    <option value="en_proyecto">En Proyecto</option>
                                    <option value="en_mantenimiento">En Mantenimiento</option>
                                    <option value="dado_de_baja">Dado de Baja</option>
                                </select>
                            </div>

                            <div>
                                <InputLabel value="Último mantenimiento" />
                                <input
                                    type="date"
                                    value={data.last_maintenance}
                                    onChange={(e) => setData('last_maintenance', e.target.value)}
                                    className="w-full rounded-xl border-[var(--border-ui)] bg-slate-500/5 text-[var(--text-primary)] px-4 py-3"
                                />
                            </div>
                        </>
                    )}

                    <div>
                        <InputLabel value="Tipo de ubicación" />
                        <select
                            value={data.location_type}
                            onChange={(e) => setData('location_type', e.target.value)}
                            className="w-full rounded-xl border-[var(--border-ui)] bg-transparent text-[var(--text-primary)] px-4 py-3 [&>option]:bg-[var(--bg-content)]"
                        >
                            <option value="warehouse">Bodega</option>
                            <option value="project">En Proyecto</option>
                        </select>
                    </div>

                    {data.location_type === 'project' ? (
                        <div>
                            <InputLabel value="Proyecto" />
                            <input
                                type="text"
                                value={data.project_id}
                                onChange={(e) => setData('project_id', e.target.value)}
                                className="w-full rounded-xl border-[var(--border-ui)] bg-slate-500/5 text-[var(--text-primary)] px-4 py-3"
                                placeholder="ID del proyecto"
                            />
                        </div>
                    ) : (
                        <div>
                            <InputLabel value="Ubicación en bodega" />
                            <input
                                type="text"
                                value={data.warehouse_location}
                                onChange={(e) => setData('warehouse_location', e.target.value)}
                                className="w-full rounded-xl border-[var(--border-ui)] bg-slate-500/5 text-[var(--text-primary)] px-4 py-3"
                                placeholder="Ej: Estante A3"
                            />
                        </div>
                    )}

                    <div className="md:col-span-2">
                        <InputLabel value="Notas" />
                        <textarea
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                            className="w-full rounded-xl border-[var(--border-ui)] bg-slate-500/5 text-[var(--text-primary)] px-4 py-3"
                            rows={2}
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-ui)]">
                    <SecondaryButton type="button" onClick={onClose} disabled={processing}>
                        Cancelar
                    </SecondaryButton>
                    <PrimaryButton disabled={processing}>
                        {isEditing ? 'Actualizar' : 'Crear Item'}
                    </PrimaryButton>
                </div>
            </form>
        </div>
    );
}
