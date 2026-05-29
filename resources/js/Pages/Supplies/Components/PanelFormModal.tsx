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
    panel?: any;
}

export default function PanelFormModal({ show, onClose, panel }: Props) {
    const isEditing = !!panel;
    const [showAlert, setShowAlert] = useState(false);

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        brand: '',
        model: '',
        power: '',
        price: '',
        datasheet: null as File | null,
        is_active: true,
        _method: 'post',
    });

    useEffect(() => {
        if (show) {
            if (panel) {
                setData({
                    brand: panel.brand,
                    model: panel.model,
                    power: panel.power,
                    price: panel.price,
                    datasheet: null,
                    is_active: panel.is_active,
                    _method: 'put',
                });
            } else {
                reset();
                setData('_method', 'post');
            }
            clearErrors();
        }
    }, [show, panel]);

    const submit = (e: FormEvent) => {
        e.preventDefault();
        
        const routeName = isEditing ? 'panels.update' : 'panels.store';
        const routeParams = isEditing ? { panel: panel.id } : {};

        post(route(routeName, routeParams), {
            forceFormData: true,
            onSuccess: () => {
                reset();
                onClose();
                showToast(isEditing ? 'Panel actualizado.' : 'Panel creado.', 'success');
            },
        });
    };

    return (
        <Modal show={show} onClose={onClose} maxWidth="xl">
            <div className="p-6 bg-[var(--surface)] text-[var(--text-primary)]">
                <h2 className="text-xl font-bold font-outfit mb-6 text-[var(--solar-gold)]">
                    {isEditing ? 'Editar Panel Solar' : 'Nuevo Panel Solar'}
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

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <InputLabel htmlFor="power" value="Potencia (Wp)" />
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
