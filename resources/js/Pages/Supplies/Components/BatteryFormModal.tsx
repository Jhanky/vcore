import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { useForm } from '@inertiajs/react';
import { FormEvent, useEffect, useState } from 'react';
import AlertModal from '@/Components/AlertModal';
import { showToast } from '@/Components/Toast';

interface Props {
    show: boolean;
    onClose: () => void;
    battery?: any;
}

export default function BatteryFormModal({ show, onClose, battery }: Props) {
    const isEditing = !!battery;
    const [showAlert, setShowAlert] = useState(false);
    const [isOtherType, setIsOtherType] = useState(false);
    const [customType, setCustomType] = useState('');

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        brand: '',
        model: '',
        capacity: '',
        voltage: '',
        type: 'Litio',
        price: '',
        datasheet: null as File | null,
        is_active: true,
        _method: 'post',
    });

    useEffect(() => {
        if (show) {
            if (battery) {
                const standardTypes = ['Gel', 'Litio'];
                const typeIsOther = !standardTypes.includes(battery.type);
                
                setData({
                    brand: battery.brand,
                    model: battery.model,
                    capacity: battery.capacity,
                    voltage: battery.voltage,
                    type: typeIsOther ? 'Otro' : battery.type,
                    price: battery.price,
                    datasheet: null,
                    is_active: battery.is_active,
                    _method: 'put',
                });
                
                if (typeIsOther) {
                    setIsOtherType(true);
                    setCustomType(battery.type);
                } else {
                    setIsOtherType(false);
                    setCustomType('');
                }
            } else {
                reset();
                setData('_method', 'post');
                setIsOtherType(false);
                setCustomType('');
            }
            clearErrors();
        }
    }, [show, battery]);

    const handleTypeChange = (value: string) => {
        setData('type', value);
        if (value === 'Otro') {
            setIsOtherType(true);
        } else {
            setIsOtherType(false);
            setCustomType('');
        }
    };

    const submit = (e: FormEvent) => {
        e.preventDefault();
        
        const routeName = isEditing ? 'batteries.update' : 'batteries.store';
        const routeParams = isEditing ? { battery: battery.id } : {};

        // Use custom type if "Otro" is selected
        const finalData = {
            ...data,
            type: data.type === 'Otro' ? customType : data.type
        };

        post(route(routeName, routeParams), {
            ...finalData,
            forceFormData: true,
            onSuccess: () => {
                reset();
                onClose();
                showToast(isEditing ? 'Batería actualizada.' : 'Batería creada.', 'success');
            },
        });
    };

    return (
        <Modal show={show} onClose={onClose} maxWidth="xl">
            <div className="p-4 sm:p-6 bg-[var(--surface)] text-[var(--text-primary)]">
                <h2 className="text-xl font-bold font-outfit mb-6 text-[var(--solar-gold)]">
                    {isEditing ? 'Editar Batería' : 'Nueva Batería'}
                </h2>

                <form onSubmit={submit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <InputLabel htmlFor="brand" value="Marca" />
                            <TextInput
                                id="brand"
                                className="mt-1 block w-full"
                                value={data.brand}
                                onChange={(e) => setData('brand', e.target.value)}
                                required
                            />
                            <InputError message={errors.brand} className="mt-2" />
                        </div>
                        <div>
                            <InputLabel htmlFor="model" value="Modelo" />
                            <TextInput
                                id="model"
                                className="mt-1 block w-full"
                                value={data.model}
                                onChange={(e) => setData('model', e.target.value)}
                                required
                            />
                            <InputError message={errors.model} className="mt-2" />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <InputLabel htmlFor="capacity" value="Capacidad (Ah)" />
                            <TextInput
                                id="capacity"
                                type="number"
                                step="0.01"
                                className="mt-1 block w-full"
                                value={data.capacity}
                                onChange={(e) => setData('capacity', e.target.value)}
                                required
                            />
                            <InputError message={errors.capacity} className="mt-2" />
                        </div>
                        <div>
                            <InputLabel htmlFor="voltage" value="Voltaje (V)" />
                            <TextInput
                                id="voltage"
                                type="number"
                                step="0.01"
                                className="mt-1 block w-full"
                                value={data.voltage}
                                onChange={(e) => setData('voltage', e.target.value)}
                                required
                            />
                            <InputError message={errors.voltage} className="mt-2" />
                        </div>
                        <div>
                            <InputLabel htmlFor="type" value="Tipo Química" />
                            <select
                                id="type"
                                className="mt-1 block w-full rounded-2xl border-[var(--border-ui)] bg-transparent focus:border-[var(--solar-gold)] focus:ring focus:ring-[var(--solar-gold)]/20 text-[var(--text-primary)] [&>option]:bg-[var(--bg-content)]"
                                value={data.type}
                                onChange={(e) => handleTypeChange(e.target.value)}
                                required
                            >
                                <option value="Gel">Gel</option>
                                <option value="Litio">Litio</option>
                                <option value="Otro">Otro</option>
                            </select>
                            <InputError message={errors.type} className="mt-2" />
                        </div>
                    </div>

                    {isOtherType && (
                        <div className="animate-fade-in">
                            <InputLabel htmlFor="custom_type" value="Especificar Tipo" />
                            <TextInput
                                id="custom_type"
                                className="mt-1 block w-full"
                                value={customType}
                                onChange={(e) => setCustomType(e.target.value)}
                                placeholder="Ej: AGM, Plomo-Ácido..."
                                required
                            />
                        </div>
                    )}

                    <div>
                        <InputLabel htmlFor="price" value="Precio Unitario ($)" />
                        <TextInput
                            id="price"
                            type="number"
                            step="0.01"
                            className="mt-1 block w-full"
                            value={data.price}
                            onChange={(e) => setData('price', e.target.value)}
                            required
                        />
                        <InputError message={errors.price} className="mt-2" />
                    </div>

                    <div>
                        <InputLabel htmlFor="datasheet" value="Ficha Técnica (PDF)" />
                        <input
                            id="datasheet"
                            type="file"
                            accept=".pdf"
                            className="mt-1 block w-full text-sm text-[var(--text-secondary)]
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-xl file:border-0
                            file:text-sm file:font-semibold
                            file:bg-slate-500/10 file:text-[var(--text-primary)]
                            hover:file:bg-[var(--solar-gold)] hover:file:text-slate-900 transition-colors"
                            onChange={(e) => {
                                const file = e.target.files ? e.target.files[0] : null;
                                if (file && file.type !== 'application/pdf') {
                                    setShowAlert(true);
                                    e.target.value = '';
                                    return;
                                }
                                setData('datasheet', file);
                            }}
                        />
                        <InputError message={errors.datasheet} className="mt-2" />
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton onClick={onClose} disabled={processing} className="border-[var(--border-ui)] text-[var(--text-secondary)]">
                            Cancelar
                        </SecondaryButton>
                        <PrimaryButton disabled={processing} className="bg-[var(--solar-gold)] text-slate-900 hover:brightness-110">
                            {isEditing ? 'Actualizar' : 'Guardar'}
                        </PrimaryButton>
                    </div>
                </form>

                <AlertModal
                    show={showAlert}
                    onClose={() => setShowAlert(false)}
                    variant="error"
                    title="Archivo no permitido"
                    message="Solo se permiten archivos en formato PDF para las fichas técnicas."
                />
            </div>
        </Modal>
    );
}
