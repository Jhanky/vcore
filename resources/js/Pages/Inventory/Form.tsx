import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { showToast } from '@/Components/Toast';

interface Props {
    item?: any;
    projects?: any[];
    defaultType?: string;
    onClose: () => void;
}

export default function InventoryForm({ item, projects, defaultType, onClose }: Props) {
    const isEditing = !!item;
    const initialType = item?.type || defaultType || 'material';

    const { data, setData, post, put, processing, errors, reset } = useForm({
        type: initialType,
        code: item?.code || '',
        brand: item?.brand || '',
        model: item?.model || '',
        serial_number: item?.serial_number || '',
        maintenance_interval_days: item?.maintenance_interval_days ?? '',
        supplier: item?.supplier || '',
        category: item?.category || '',
        name: item?.name || '',
        description: item?.description || '',
        unit: item?.unit || 'unidad',
        quantity: item?.quantity ?? 0,
        min_stock: item?.min_stock ?? '',
        purchase_cost: item?.purchase_cost ?? '',
        status: item?.status || '',
        last_maintenance: item?.last_maintenance || '',
        location_type: item?.location_type || 'warehouse',
        project_id: item?.project_id || '',
        warehouse_location: item?.warehouse_location || '',
        notes: item?.notes || '',
    });

    const resetForm = () => {
        reset();
    };

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
                    resetForm();
                },
            });
        }
    };

    const isTool = data.type === 'tool';

    const toolStatuses = [
        { value: '', label: 'Seleccionar...' },
        { value: 'disponible', label: 'Disponible' },
        { value: 'en_proyecto', label: 'En Proyecto' },
        { value: 'en_mantenimiento', label: 'En Mantenimiento' },
        { value: 'dado_de_baja', label: 'Dado de Baja' },
    ];

    const materialStatuses = [
        { value: '', label: 'Seleccionar...' },
        { value: 'disponible', label: 'Disponible' },
        { value: 'en_proyecto', label: 'En Proyecto' },
        { value: 'agotado', label: 'Agotado' },
        { value: 'descontinuado', label: 'Descontinuado' },
    ];

    const materialCategories = [
        { value: '', label: 'Seleccionar...' },
        { value: 'cable', label: 'Cable' },
        { value: 'panel', label: 'Panel Solar' },
        { value: 'inversor', label: 'Inversor' },
        { value: 'bateria', label: 'Batería' },
        { value: 'estructura', label: 'Estructura' },
        { value: 'proteccion', label: 'Protección' },
        { value: 'conector', label: 'Conector' },
        { value: 'tuberia', label: 'Tubería' },
        { value: 'otro', label: 'Otro' },
    ];

    return (
        <div className="p-4 sm:p-6">
            <h2 className="text-xl font-bold font-outfit text-[var(--text-primary)] mb-6">
                {isEditing ? 'Editar Item' : `Nuevo ${isTool ? 'Herramienta' : 'Material'}`}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <InputLabel value="Tipo" />
                        <select
                            value={data.type}
                            onChange={(e) => { setData('type', e.target.value); setData('status', ''); }}
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
                        <InputLabel value="Marca" />
                        <input
                            type="text"
                            value={data.brand}
                            onChange={(e) => setData('brand', e.target.value)}
                            className="w-full rounded-xl border-[var(--border-ui)] bg-slate-500/5 text-[var(--text-primary)] px-4 py-3"
                            placeholder="Ej: DeWalt, Kaiser"
                        />
                        <InputError message={errors.brand} />
                    </div>

                    {isTool ? (
                        <>
                            <div>
                                <InputLabel value="Modelo" />
                                <input
                                    type="text"
                                    value={data.model}
                                    onChange={(e) => setData('model', e.target.value)}
                                    className="w-full rounded-xl border-[var(--border-ui)] bg-slate-500/5 text-[var(--text-primary)] px-4 py-3"
                                    placeholder="Ej: DCD796"
                                />
                                <InputError message={errors.model} />
                            </div>
                            <div>
                                <InputLabel value="Número de serie" />
                                <input
                                    type="text"
                                    value={data.serial_number}
                                    onChange={(e) => setData('serial_number', e.target.value)}
                                    className="w-full rounded-xl border-[var(--border-ui)] bg-slate-500/5 text-[var(--text-primary)] px-4 py-3"
                                    placeholder="Serial del equipo"
                                />
                                <InputError message={errors.serial_number} />
                            </div>
                            <div>
                                <InputLabel value="Intervalo mantenimiento (días)" />
                                <input
                                    type="number"
                                    min="1"
                                    value={data.maintenance_interval_days}
                                    onChange={(e) => setData('maintenance_interval_days', e.target.value)}
                                    className="w-full rounded-xl border-[var(--border-ui)] bg-slate-500/5 text-[var(--text-primary)] px-4 py-3"
                                    placeholder="Ej: 90"
                                />
                                <InputError message={errors.maintenance_interval_days} />
                            </div>
                        </>
                    ) : (
                        <>
                            <div>
                                <InputLabel value="Proveedor" />
                                <input
                                    type="text"
                                    value={data.supplier}
                                    onChange={(e) => setData('supplier', e.target.value)}
                                    className="w-full rounded-xl border-[var(--border-ui)] bg-slate-500/5 text-[var(--text-primary)] px-4 py-3"
                                    placeholder="Nombre del proveedor"
                                />
                                <InputError message={errors.supplier} />
                            </div>
                            <div>
                                <InputLabel value="Categoría" />
                                <select
                                    value={data.category}
                                    onChange={(e) => setData('category', e.target.value)}
                                    className="w-full rounded-xl border-[var(--border-ui)] bg-transparent text-[var(--text-primary)] px-4 py-3 [&>option]:bg-[var(--bg-content)]"
                                >
                                    {materialCategories.map((opt) => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                                <InputError message={errors.category} />
                            </div>
                        </>
                    )}

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

                    <div>
                        <InputLabel value="Costo unitario ($)" />
                        <input
                            type="number"
                            step="100"
                            min="0"
                            value={data.purchase_cost}
                            onChange={(e) => setData('purchase_cost', e.target.value)}
                            className="w-full rounded-xl border-[var(--border-ui)] bg-slate-500/5 text-[var(--text-primary)] px-4 py-3"
                            placeholder="COP"
                        />
                    </div>

                    <div>
                        <InputLabel value="Estado" />
                        <select
                            value={data.status}
                            onChange={(e) => setData('status', e.target.value)}
                            className="w-full rounded-xl border-[var(--border-ui)] bg-transparent text-[var(--text-primary)] px-4 py-3 [&>option]:bg-[var(--bg-content)]"
                        >
                            {(isTool ? toolStatuses : materialStatuses).map((opt) => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                        <InputError message={errors.status} />
                    </div>

                    {isTool && (
                        <div>
                            <InputLabel value="Último mantenimiento" />
                            <input
                                type="date"
                                value={data.last_maintenance}
                                onChange={(e) => setData('last_maintenance', e.target.value)}
                                className="w-full rounded-xl border-[var(--border-ui)] bg-slate-500/5 text-[var(--text-primary)] px-4 py-3"
                            />
                        </div>
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
                            <select
                                value={data.project_id}
                                onChange={(e) => setData('project_id', e.target.value)}
                                className="w-full rounded-xl border-[var(--border-ui)] bg-transparent text-[var(--text-primary)] px-4 py-3 [&>option]:bg-[var(--bg-content)]"
                            >
                                <option value="">Seleccionar proyecto...</option>
                                {projects?.map((p: any) => (
                                    <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
                                ))}
                            </select>
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
