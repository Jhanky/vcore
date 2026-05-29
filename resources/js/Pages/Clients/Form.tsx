import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import {
    ArrowLeft,
    Save,
    MapPin,
    Zap,
    User,
    Phone,
    Mail,
    DollarSign,
    Plus,
    Trash2,
    ShieldCheck,
    Hash
} from 'lucide-react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import NumberInput from '@/Components/NumberInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import { showToast } from '@/Components/Toast';
import RegistrationModal from '@/Components/RegistrationModal';
import { useState, useEffect, useRef } from 'react';

interface Contact {
    id?: number;
    name: string;
    position: string;
    email: string;
    phone: string;
    is_primary: boolean;
    is_decision_maker: boolean;
}

interface ClientFormProps {
    client?: {
        id: number;
        name: string;
        email: string;
        phone: string;
        nic?: string;
        address: string;
        city: string;
        state: string;
        energy_consumption_kwh: number;
        monthly_bill_amount: number;
        energy_tariff: number;
        available_area_m2: number;
        contacts: Contact[];
        client_types: { id: number; name: string; code: string }[];
    };
    clientTypes?: { id: number; name: string; code: string }[];
}

export default function Form({ client, clientTypes }: ClientFormProps) {
    const isEditing = !!client;

    const [departments, setDepartments] = useState<{ id: number; name: string }[]>([]);
    const [cities, setCities] = useState<{ id: number; name: string }[]>([]);
    const [selectedDeptId, setSelectedDeptId] = useState<string | number>('');

    const [registrationStatus, setRegistrationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [registeredClientId, setRegisteredClientId] = useState<number | null>(null);
    const [errorMessage, setErrorMessage] = useState<string>('');

    const nameRef = useRef<HTMLInputElement>(null);
    const emailRef = useRef<HTMLInputElement>(null);
    const phoneRef = useRef<HTMLInputElement>(null);
    const nicRef = useRef<HTMLInputElement>(null);
    const clientTypeRef = useRef<HTMLSelectElement>(null);
    const addressRef = useRef<HTMLInputElement>(null);
    const stateRef = useRef<HTMLSelectElement>(null);
    const cityRef = useRef<HTMLSelectElement>(null);
    const energyConsumptionRef = useRef<HTMLInputElement>(null);
    const monthlyBillRef = useRef<HTMLInputElement>(null);
    const tariffRef = useRef<HTMLInputElement>(null);
    const areaRef = useRef<HTMLInputElement>(null);

    const fieldRefs = {
        name: nameRef,
        email: emailRef,
        phone: phoneRef,
        nic: nicRef,
        client_type_id: clientTypeRef,
        address: addressRef,
        state: stateRef,
        city: cityRef,
        energy_consumption_kwh: energyConsumptionRef,
        monthly_bill_amount: monthlyBillRef,
        energy_tariff: tariffRef,
        available_area_m2: areaRef,
    };

    const fieldOrder = ['name', 'email', 'phone', 'nic', 'client_type_id', 'address', 'state', 'city', 'energy_consumption_kwh', 'monthly_bill_amount', 'energy_tariff', 'available_area_m2'];

    const handleKeyDown = (e: React.KeyboardEvent, field: string) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const currentIndex = fieldOrder.indexOf(field);
            const nextField = fieldOrder[currentIndex + 1];
            if (nextField && fieldRefs[nextField as keyof typeof fieldRefs]?.current) {
                fieldRefs[nextField as keyof typeof fieldRefs].current?.focus();
            }
        }
    };

    const { data, setData, post, put, processing, errors } = useForm({
        name: client?.name || '',
        email: client?.email || '',
        phone: client?.phone || '',
        nic: client?.nic || '',
        address: client?.address || '',
        city: client?.city || '',
        state: client?.state || '',
        energy_consumption_kwh: client?.energy_consumption_kwh || '',
        monthly_bill_amount: client?.monthly_bill_amount || '',
        energy_tariff: client?.energy_tariff ? Number(client.energy_tariff) : '',
        available_area_m2: client?.available_area_m2 || '',
        contacts: client?.contacts || [] as Contact[],
        client_types: client?.client_types?.map((ct: any) => ct.id) || [],
    });

    useEffect(() => {
        fetchDepartments();
    }, [client]);

    useEffect(() => {
        if (selectedDeptId) {
            fetchCities(selectedDeptId);
        } else {
            setCities([]);
        }
    }, [selectedDeptId]);

    const fetchDepartments = () => {
        fetch('https://api-colombia.com/api/v1/Department')
            .then(res => res.json())
            .then(data => {
                setDepartments(data);
                if (client?.state) {
                    const dept = data.find((d: any) => d.name === client.state);
                    if (dept) setSelectedDeptId(dept.id);
                }
            })
            .catch(err => console.error('Error al obtener departamentos:', err));
    };

    const fetchCities = (deptId: string | number) => {
        fetch(`https://api-colombia.com/api/v1/Department/${deptId}/cities`)
            .then(res => res.json())
            .then(setCities)
            .catch(err => console.error('Error al obtener ciudades:', err));
    };

    const handleDeptChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const id = e.target.value;
        setSelectedDeptId(id);
        const dept = departments.find(d => d.id.toString() === id);
        setData(prev => ({
            ...prev,
            state: dept?.name || '',
            city: ''
        }));
    };

    const addContact = () => {
        setData('contacts', [
            ...data.contacts,
            { name: '', position: '', email: '', phone: '', is_primary: false, is_decision_maker: false }
        ]);
    };

    const removeContact = (index: number) => {
        setData('contacts', data.contacts.filter((_: any, i: number) => i !== index));
    };

    const updateContact = (index: number, field: keyof Contact, value: any) => {
        const newContacts = [...data.contacts];
        newContacts[index] = { ...newContacts[index], [field]: value };
        setData('contacts', newContacts);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEditing) {
            put(route('clients.update', client.id), {
                onSuccess: () => showToast('Cliente actualizado exitosamente', 'success'),
            });
        } else {
            setRegistrationStatus('loading');
            post(route('clients.store'), {
                onSuccess: (page: any) => {
                    const clientId = page.props.createdClient?.id;
                    setRegisteredClientId(clientId || null);
                    setRegistrationStatus('success');
                },
                onError: (errors: any) => {
                    setErrorMessage(Object.values(errors).join(', '));
                    setRegistrationStatus('error');
                },
            });
        }
    };

    return (
        <AuthenticatedLayout header={isEditing ? 'Editar Cliente' : 'Nuevo Cliente'}>
            <Head title={isEditing ? 'Editar Cliente' : 'Nuevo Cliente'} />

            <div className="max-w-4xl mx-auto">
                <div className="mb-6">
                    <Link
                        href={route('clients.index')}
                        className="inline-flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--solar-gold)] transition-colors font-medium"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span>Volver a Clientes</span>
                    </Link>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8 pb-12">

                    {/* Informacion Principal */}
                    <section className="glass p-8 rounded-[2rem]">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[var(--border-ui)]/50">
                            <User className="h-6 w-6 text-[var(--solar-gold)]" />
                            <h2 className="text-xl font-bold text-[var(--text-primary)] font-outfit">
                                Informacion Principal
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <InputLabel htmlFor="name" value="Nombre Completo / Razon Social *" />
                                <TextInput
                                    id="name"
                                    type="text"
                                    className="mt-1 block w-full"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    required
                                    ref={nameRef}
                                    tabIndex={1}
                                    onKeyDown={(e) => handleKeyDown(e, 'name')}
                                />
                                <InputError message={errors.name} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="email" value="Correo Electronico *" />
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                    <TextInput
                                        id="email"
                                        type="email"
                                        className="mt-1 block w-full pl-10"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        required
                                        ref={emailRef}
                                        tabIndex={2}
                                        onKeyDown={(e) => handleKeyDown(e, 'email')}
                                    />
                                </div>
                                <InputError message={errors.email} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="phone" value="Telefono *" />
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                    <TextInput
                                        id="phone"
                                        type="text"
                                        className="mt-1 block w-full pl-10"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                        required
                                        ref={phoneRef}
                                        tabIndex={3}
                                        onKeyDown={(e) => handleKeyDown(e, 'phone')}
                                    />
                                </div>
                                <InputError message={errors.phone} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="nic" value="NIC *" />
                                <div className="relative">
                                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                    <TextInput
                                        id="nic"
                                        type="text"
                                        inputMode="numeric"
                                        className="mt-1 block w-full pl-10"
                                        value={data.nic}
                                        onChange={(e) => setData('nic', e.target.value.replace(/\D/g, ''))}
                                        required
                                        ref={nicRef}
                                        tabIndex={4}
                                        onKeyDown={(e) => handleKeyDown(e, 'nic')}
                                    />
                                </div>
                                <InputError message={errors.nic} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="client_type_id" value="Tipo de Cliente *" />
                                <select
                                    id="client_type_id"
                                    className="mt-1 block w-full rounded-2xl border-[var(--border-ui)] bg-transparent focus:border-[var(--solar-gold)] focus:ring focus:ring-[var(--solar-gold)]/20 text-[var(--text-primary)] [&>option]:bg-[var(--bg-content)]"
                                    value={data.client_types[0] || ''}
                                    onChange={(e) => setData('client_types', e.target.value ? [Number(e.target.value)] : [])}
                                    required
                                    ref={clientTypeRef}
                                    tabIndex={5}
                                    onKeyDown={(e) => handleKeyDown(e, 'client_type_id')}
                                >
                                    <option value="">Seleccione un tipo...</option>
                                    {(clientTypes || []).map((type: { id: number; name: string; code: string }) => (
                                        <option key={type.id} value={type.id}>{type.name}</option>
                                    ))}
                                </select>
                                <InputError message={errors.client_types as string} className="mt-2" />
                            </div>
                        </div>
                    </section>

                    {/* Ubicacion */}
                    <section className="glass p-8 rounded-[2rem]">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[var(--border-ui)]/50">
                            <MapPin className="h-6 w-6 text-[var(--solar-gold)]" />
                            <h2 className="text-xl font-bold text-[var(--text-primary)] font-outfit">
                                Ubicacion
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <InputLabel htmlFor="address" value="Direccion" />
                                <TextInput
                                    id="address"
                                    type="text"
                                    className="mt-1 block w-full"
                                    value={data.address}
                                    onChange={(e) => setData('address', e.target.value)}
                                    ref={addressRef}
                                    tabIndex={6}
                                    onKeyDown={(e) => handleKeyDown(e, 'address')}
                                />
                                <InputError message={errors.address} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="state" value="Departamento *" />
                                <select
                                    id="state"
                                    className="mt-1 block w-full rounded-2xl border-[var(--border-ui)] bg-transparent focus:border-[var(--solar-gold)] focus:ring focus:ring-[var(--solar-gold)]/20 text-[var(--text-primary)] [&>option]:bg-[var(--bg-content)]"
                                    value={selectedDeptId}
                                    onChange={handleDeptChange}
                                    required
                                    ref={stateRef}
                                    tabIndex={7}
                                    onKeyDown={(e) => handleKeyDown(e, 'state')}
                                >
                                    <option value="">Seleccione un departamento...</option>
                                    {departments.map((dept) => (
                                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                                    ))}
                                </select>
                                <InputError message={errors.state} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="city" value="Ciudad *" />
                                <select
                                    id="city"
                                    className="mt-1 block w-full rounded-2xl border-[var(--border-ui)] bg-transparent focus:border-[var(--solar-gold)] focus:ring focus:ring-[var(--solar-gold)]/20 text-[var(--text-primary)] [&>option]:bg-[var(--bg-content)]"
                                    value={data.city}
                                    onChange={(e) => setData('city', e.target.value)}
                                    disabled={!selectedDeptId || cities.length === 0}
                                    required
                                    ref={cityRef}
                                    tabIndex={8}
                                    onKeyDown={(e) => handleKeyDown(e, 'city')}
                                >
                                    <option value="">Seleccione una ciudad...</option>
                                    {cities.map((city) => (
                                        <option key={city.id} value={city.name}>{city.name}</option>
                                    ))}
                                </select>
                                <InputError message={errors.city} className="mt-2" />
                            </div>
                        </div>
                    </section>

                    {/* Personas de Contacto */}
                    <section className="glass p-8 rounded-[2rem]">
                        <div className="flex items-center justify-between mb-6 pb-4 border-b border-[var(--border-ui)]/50">
                            <div className="flex items-center gap-3">
                                <User className="h-6 w-6 text-[var(--solar-gold)]" />
                                <h2 className="text-xl font-bold text-[var(--text-primary)] font-outfit">
                                    Personas de Contacto
                                </h2>
                            </div>
                            <button
                                type="button"
                                onClick={addContact}
                                className="inline-flex items-center gap-2 text-sm font-bold text-[var(--solar-gold)] hover:text-[var(--solar-gold)]/80 transition-colors bg-[var(--solar-gold)]/10 px-4 py-2 rounded-xl"
                            >
                                <Plus className="h-4 w-4" />
                                Agregar Contacto
                            </button>
                        </div>

                        {data.contacts.length === 0 && (
                            <div className="text-center py-8 border-2 border-dashed border-[var(--border-ui)] rounded-3xl">
                                <p className="text-[var(--text-secondary)] italic">
                                    No hay contactos agregados. Haz clic en "Agregar Contacto" para crear uno.
                                </p>
                            </div>
                        )}

                        <div className="space-y-6">
                            {data.contacts.map((contact, index) => (
                                <ContactCard
                                    key={index}
                                    contact={contact}
                                    index={index}
                                    onUpdate={updateContact}
                                    onRemove={removeContact}
                                    error={errors[`contacts.${index}.name` as keyof typeof errors]}
                                />
                            ))}
                        </div>
                    </section>

                    {/* Datos del Proyecto */}
                    <section className="glass p-8 rounded-[2rem]">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[var(--border-ui)]/50">
                            <Zap className="h-6 w-6 text-[var(--solar-gold)]" />
                            <h2 className="text-xl font-bold text-[var(--text-primary)] font-outfit">
                                Datos del Proyecto
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div>
                                <InputLabel htmlFor="energy_consumption_kwh" value="Consumo Mensual (kWh) *" />
                                <NumberInput
                                    id="energy_consumption_kwh"
                                    className="mt-1 block w-full"
                                    value={data.energy_consumption_kwh}
                                    onChange={(val) => setData('energy_consumption_kwh', val)}
                                    integer
                                    required
                                    ref={energyConsumptionRef}
                                    tabIndex={9}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            (e.target as HTMLInputElement).blur();
                                            const nextField = fieldRefs['monthly_bill_amount' as keyof typeof fieldRefs];
                                            nextField?.current?.focus();
                                        }
                                    }}
                                />
                                <InputError message={errors.energy_consumption_kwh} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="monthly_bill_amount" value="Pago Mensual Energia *" />
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                    <NumberInput
                                        id="monthly_bill_amount"
                                        className="mt-1 block w-full pl-10"
                                        value={data.monthly_bill_amount}
                                        onChange={(val) => setData('monthly_bill_amount', val)}
                                        required
                                        ref={monthlyBillRef}
                                        tabIndex={10}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                (e.target as HTMLInputElement).blur();
                                                const nextField = fieldRefs['energy_tariff' as keyof typeof fieldRefs];
                                                nextField?.current?.focus();
                                            }
                                        }}
                                    />
                                </div>
                                <InputError message={errors.monthly_bill_amount} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="energy_tariff" value="Tarifa Energia ($/kWh) *" />
                                <NumberInput
                                    id="energy_tariff"
                                    className="mt-1 block w-full"
                                    value={data.energy_tariff}
                                    onChange={(val) => setData('energy_tariff', val)}
                                    step="0.0001"
                                    required
                                    ref={tariffRef}
                                    tabIndex={11}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            (e.target as HTMLInputElement).blur();
                                            const nextField = fieldRefs['available_area_m2' as keyof typeof fieldRefs];
                                            nextField?.current?.focus();
                                        }
                                    }}
                                />
                                <InputError message={errors.energy_tariff} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="available_area_m2" value="Area Disponible (m2)" />
                                <NumberInput
                                    id="available_area_m2"
                                    className="mt-1 block w-full"
                                    value={data.available_area_m2}
                                    onChange={(val) => setData('available_area_m2', val)}
                                    integer
                                    ref={areaRef}
                                    tabIndex={12}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            (e.target as HTMLInputElement).blur();
                                        }
                                    }}
                                />
                                <InputError message={errors.available_area_m2} className="mt-2" />
                            </div>
                        </div>
                    </section>

                    {/* Botones de Accion */}
                    <div className="flex items-center justify-end gap-4 pt-4">
                        <Link
                            href={route('clients.index')}
                            className="px-6 py-3 rounded-2xl font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-slate-500/10 transition-colors"
                        >
                            Cancelar
                        </Link>
                        <PrimaryButton className="gap-2" disabled={processing}>
                            <Save className="h-5 w-5" />
                            {isEditing ? 'Actualizar Cliente' : 'Guardar Cliente'}
                        </PrimaryButton>
                    </div>
                </form>
            </div>

            <RegistrationModal
                show={registrationStatus !== 'idle'}
                status={registrationStatus}
                clientId={registeredClientId ?? undefined}
                clientName={data.name}
                errorMessage={errorMessage}
                onClose={() => setRegistrationStatus('idle')}
            />
        </AuthenticatedLayout>
    );
}

interface ContactCardProps {
    contact: Contact;
    index: number;
    onUpdate: (index: number, field: keyof Contact, value: any) => void;
    onRemove: (index: number) => void;
    error?: string;
}

function ContactCard({ contact, index, onUpdate, onRemove, error }: ContactCardProps) {
    return (
        <div className="relative p-6 rounded-3xl bg-slate-500/5 border border-[var(--border-ui)]/50 group">
            <button
                type="button"
                onClick={() => onRemove(index)}
                className="absolute -top-2 -right-2 p-2 bg-red-500/10 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100 shadow-lg"
            >
                <Trash2 className="h-4 w-4" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="lg:col-span-2">
                    <InputLabel value="Nombre Completo *" />
                    <TextInput
                        type="text"
                        className="mt-1 block w-full text-sm"
                        value={contact.name}
                        onChange={(e) => onUpdate(index, 'name', e.target.value)}
                        placeholder="Ej: Juan Perez"
                        required
                    />
                </div>

                <div className="lg:col-span-2">
                    <InputLabel value="Cargo / Posicion" />
                    <TextInput
                        type="text"
                        className="mt-1 block w-full text-sm"
                        value={contact.position}
                        onChange={(e) => onUpdate(index, 'position', e.target.value)}
                        placeholder="Ej: Gerente de Operaciones"
                    />
                </div>

                <div>
                    <InputLabel value="Correo Electronico" />
                    <TextInput
                        type="email"
                        className="mt-1 block w-full text-sm"
                        value={contact.email}
                        onChange={(e) => onUpdate(index, 'email', e.target.value)}
                    />
                </div>

                <div>
                    <InputLabel value="Telefono" />
                    <TextInput
                        type="text"
                        className="mt-1 block w-full text-sm"
                        value={contact.phone}
                        onChange={(e) => onUpdate(index, 'phone', e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-6 pt-6">
                    <label className="flex items-center gap-2 cursor-pointer group/check">
                        <div className="relative">
                            <input
                                type="checkbox"
                                className="sr-only"
                                checked={contact.is_decision_maker}
                                onChange={(e) => onUpdate(index, 'is_decision_maker', e.target.checked)}
                            />
                            <div className={`w-10 h-5 rounded-full transition-colors ${contact.is_decision_maker ? 'bg-[var(--solar-gold)]' : 'bg-slate-700'}`} />
                            <div className={`absolute top-1 left-1 w-3 h-3 rounded-full bg-white transition-transform ${contact.is_decision_maker ? 'translate-x-5' : ''}`} />
                        </div>
                        <span className="text-xs font-bold text-[var(--text-secondary)] group-hover/check:text-[var(--text-primary)] transition-colors flex items-center gap-1">
                            <ShieldCheck className={`h-3 w-3 ${contact.is_decision_maker ? 'text-[var(--solar-gold)]' : ''}`} />
                            Toma Decisiones
                        </span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer group/check">
                        <input
                            type="checkbox"
                            className="rounded border-[var(--border-ui)] text-[var(--solar-gold)] focus:ring-[var(--solar-gold)]/20 bg-transparent"
                            checked={contact.is_primary}
                            onChange={(e) => onUpdate(index, 'is_primary', e.target.checked)}
                        />
                        <span className="text-xs font-bold text-[var(--text-secondary)] group-hover/check:text-[var(--text-primary)]">
                            Principal
                        </span>
                    </label>
                </div>
            </div>

            {error && <InputError message={error} className="mt-2" />}
        </div>
    );
}