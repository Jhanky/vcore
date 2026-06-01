import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import { showToast } from '@/Components/Toast';

interface SupplierData {
    id: number;
    name: string;
    nit: string | null;
    contact_name: string | null;
    phone: string | null;
    email: string | null;
    address: string | null;
    notes: string | null;
    is_active: boolean;
}

interface Props {
    supplier?: SupplierData | null;
    onClose: () => void;
}

export default function SupplierForm({ supplier, onClose }: Props) {
    const isEditing = !!supplier;
    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: supplier?.name || '',
        nit: supplier?.nit || '',
        contact_name: supplier?.contact_name || '',
        phone: supplier?.phone || '',
        email: supplier?.email || '',
        address: supplier?.address || '',
        notes: supplier?.notes || '',
        is_active: supplier?.is_active ?? true,
    });

    useEffect(() => {
        if (supplier) {
            setData({
                name: supplier.name,
                nit: supplier.nit || '',
                contact_name: supplier.contact_name || '',
                phone: supplier.phone || '',
                email: supplier.email || '',
                address: supplier.address || '',
                notes: supplier.notes || '',
                is_active: supplier.is_active,
            });
        } else {
            reset();
        }
    }, [supplier]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const options = {
            preserveScroll: true,
            onSuccess: () => {
                onClose();
                showToast(isEditing ? 'Proveedor actualizado.' : 'Proveedor creado.', 'success');
            },
        };

        if (isEditing) {
            put(route('suppliers.update', supplier!.id), options);
        } else {
            post(route('suppliers.store'), options);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
            <h3 className="text-lg font-bold font-outfit text-[var(--text-primary)]">
                {isEditing ? 'Editar Proveedor' : 'Nuevo Proveedor'}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                    <InputLabel htmlFor="name" value="Nombre *" />
                    <TextInput
                        id="name"
                        type="text"
                        className="mt-1 block w-full"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                    />
                    <InputError message={errors.name} className="mt-2" />
                </div>

                <div>
                    <InputLabel htmlFor="nit" value="NIT" />
                    <TextInput
                        id="nit"
                        type="text"
                        className="mt-1 block w-full"
                        value={data.nit}
                        onChange={(e) => setData('nit', e.target.value)}
                    />
                    <InputError message={errors.nit} className="mt-2" />
                </div>

                <div>
                    <InputLabel htmlFor="contact_name" value="Contacto" />
                    <TextInput
                        id="contact_name"
                        type="text"
                        className="mt-1 block w-full"
                        value={data.contact_name}
                        onChange={(e) => setData('contact_name', e.target.value)}
                    />
                    <InputError message={errors.contact_name} className="mt-2" />
                </div>

                <div>
                    <InputLabel htmlFor="phone" value="Teléfono" />
                    <TextInput
                        id="phone"
                        type="text"
                        className="mt-1 block w-full"
                        value={data.phone}
                        onChange={(e) => setData('phone', e.target.value)}
                    />
                    <InputError message={errors.phone} className="mt-2" />
                </div>

                <div>
                    <InputLabel htmlFor="email" value="Email" />
                    <TextInput
                        id="email"
                        type="email"
                        className="mt-1 block w-full"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                    />
                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div className="col-span-2">
                    <InputLabel htmlFor="address" value="Dirección" />
                    <TextInput
                        id="address"
                        type="text"
                        className="mt-1 block w-full"
                        value={data.address}
                        onChange={(e) => setData('address', e.target.value)}
                    />
                    <InputError message={errors.address} className="mt-2" />
                </div>

                <div className="col-span-2">
                    <InputLabel htmlFor="notes" value="Notas" />
                    <textarea
                        id="notes"
                        rows={3}
                        className="mt-1 block w-full px-3 py-2 bg-[var(--surface)] border border-[var(--border-ui)] rounded-xl text-sm text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--solar-gold)] resize-none"
                        value={data.notes}
                        onChange={(e) => setData('notes', e.target.value)}
                    />
                    <InputError message={errors.notes} className="mt-2" />
                </div>

                <div className="col-span-2 flex items-center gap-2">
                    <input
                        type="checkbox"
                        id="is_active"
                        className="rounded border-[var(--border-ui)] text-[var(--solar-gold)] focus:ring-[var(--solar-gold)]/20 bg-[var(--surface)]"
                        checked={data.is_active}
                        onChange={(e) => setData('is_active', e.target.checked)}
                    />
                    <label htmlFor="is_active" className="text-sm text-[var(--text-primary)] cursor-pointer font-outfit">
                        Activo
                    </label>
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-ui)]">
                <SecondaryButton type="button" onClick={onClose} disabled={processing}>
                    Cancelar
                </SecondaryButton>
                <PrimaryButton type="submit" disabled={processing} isLoading={processing}>
                    {processing ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear'}
                </PrimaryButton>
            </div>
        </form>
    );
}