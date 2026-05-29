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
    inverter?: any;
}

export default function InverterFormModal({ show, onClose, inverter }: Props) {
    const isEditing = !!inverter;
    const [showAlert, setShowAlert] = useState(false);

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        brand: '',
        model: '',
        power: '',
        system_type: 'On-grid',
        grid_type: 'monofasico',
        price: '',
        datasheet: null as File | null,
        is_active: true,
        _method: 'post',
    });

    useEffect(() => {
        if (show) {
            if (inverter) {
                setData({
                    brand: inverter.brand,
                    model: inverter.model,
                    power: inverter.power,
                    system_type: inverter.system_type,
                    grid_type: inverter.grid_type,
                    price: inverter.price,
                    datasheet: null,
                    is_active: inverter.is_active,
                    _method: 'put',
                });
            } else {
                reset();
                setData('_method', 'post');
            }
            clearErrors();
        }
    }, [show, inverter]);

    const submit = (e: FormEvent) => {
        e.preventDefault();
        
        const routeName = isEditing ? 'inverters.update' : 'inverters.store';
        const routeParams = isEditing ? { inverter: inverter.id } : {};

        post(route(routeName, routeParams), {
            forceFormData: true,
            onSuccess: () => {
                reset();
                onClose();
                showToast(isEditing ? 'Inversor actualizado.' : 'Inversor creado.', 'success');
            },
        });
    };

    return (
        <Modal show={show} onClose={onClose} maxWidth="xl">
            <div className="p-6 bg-[var(--surface)] text-[var(--text-primary)]">
                <h2 className="text-xl font-bold font-outfit mb-6 text-[var(--solar-gold)]">
                    {isEditing ? 'Editar Inversor' : 'Nuevo Inversor'}
                </h2>

                <form onSubmit={submit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
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
                            <InputLabel htmlFor="power" value="Potencia (kW)" />
                            <TextInput
                                id="power"
                                type="number"
                                step="0.01"
                                className="mt-1 block w-full"
                                value={data.power}
                                onChange={(e) => setData('power', e.target.value)}
                                required
                            />
                            <InputError message={errors.power} className="mt-2" />
                        </div>
                        <div>
                            <InputLabel htmlFor="system_type" value="Tipo de Sistema" />
                            <select
                                id="system_type"
                                className="mt-1 block w-full rounded-2xl border-[var(--border-ui)] bg-transparent focus:border-[var(--solar-gold)] focus:ring focus:ring-[var(--solar-gold)]/20 text-[var(--text-primary)] [&>option]:bg-[var(--bg-content)]"
                                value={data.system_type}
                                onChange={(e) => setData('system_type', e.target.value)}
                                required
                            >
                                <option value="On-grid">On-grid</option>
                                <option value="Off-grid">Off-grid</option>
                                <option value="Híbrido">Híbrido</option>
                            </select>
                            <InputError message={errors.system_type} className="mt-2" />
                        </div>
                        <div>
                            <InputLabel htmlFor="grid_type" value="Tipo de Red" />
                            <select
                                id="grid_type"
                                className="mt-1 block w-full rounded-2xl border-[var(--border-ui)] bg-transparent focus:border-[var(--solar-gold)] focus:ring focus:ring-[var(--solar-gold)]/20 text-[var(--text-primary)] [&>option]:bg-[var(--bg-content)]"
                                value={data.grid_type}
                                onChange={(e) => setData('grid_type', e.target.value)}
                                required
                            >
                                <option value="monofasico">Monofásico</option>
                                <option value="bifasico 220">Bifásico 220</option>
                                <option value="trifasico 220">Trifásico 220</option>
                                <option value="trifasico 440">Trifásico 440</option>
                            </select>
                            <InputError message={errors.grid_type} className="mt-2" />
                        </div>
                    </div>

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
                            accept=".pdf,application/pdf"
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
