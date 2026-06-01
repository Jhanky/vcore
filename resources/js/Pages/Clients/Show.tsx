import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Edit } from 'lucide-react';
import ClientHeader from '@/features/clients/components/ClientHeader';
import ContactInfo from '@/features/clients/components/ContactInfo';
import ProjectData from '@/features/projects/components/ProjectData';
import InteractionTimeline from '@/features/clients/components/InteractionTimeline';
import QuotationCTA from '@/features/quotations/components/QuotationCTA';

interface Interaction {
    id: number;
    type: string;
    notes: string;
    interaction_date: string;
}

interface ConnectionPoint {
    id: number;
    operador: string;
    codigo: number;
    matricula: string;
    localizacion: string;
    potencia_nominal: string;
    tens_pri: number;
    tens_sec: string;
    propiedad: string;
    capacidad_disp: string;
    latitud: number;
    longitud: number;
}

interface Contact {
    id: number;
    name: string;
    position: string;
    email: string;
    phone: string;
    is_primary: boolean;
    is_decision_maker: boolean;
}

interface Quotation {
    id: number;
    project_name: string;
    status: string;
    created_at: string;
    expiration_date: string;
    total_value: number;
}

interface Client {
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
    interactions: Interaction[];
    client_types: { id: number; name: string; code: string }[];
    quotations: Quotation[];
    connection_point?: ConnectionPoint;
}

interface Props {
    client: Client;
}

export default function Show({ client }: Props) {
    const { post, processing, reset } = useForm({
        type: 'Nota',
        notes: '',
        interaction_date: new Date().toISOString().slice(0, 16),
    });

    const handleAddInteraction = (data: { type: string; notes: string; interaction_date: string }) => {
        post(route('client-interactions.store', client.id), {
            preserveScroll: true,
            onSuccess: () => reset(),
        });
    };

    const handleCreateQuotation = () => {
        window.location.href = route('quotations.create', { client_id: client.id });
    };

    return (
        <AuthenticatedLayout header={`Cliente: ${client.name}`}>
            <Head title={`Cliente: ${client.name}`} />

            {/* Barra Superior */}
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <Link
                    href={route('clients.index')}
                    className="inline-flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--solar-gold)] transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Volver a Clientes</span>
                </Link>

                <Link
                    href={route('clients.edit', client.id)}
                    className="inline-flex items-center gap-2 bg-slate-500/10 text-[var(--text-primary)] font-bold px-4 py-2 rounded-xl hover:bg-slate-500/20 transition-colors border border-[var(--border-ui)]"
                >
                    <Edit className="h-4 w-4" />
                    <span>Editar Cliente</span>
                </Link>
            </div>

            {/* Header con Avatar y Acciones Rápidas */}
            <ClientHeader
                name={client.name}
                clientTypes={client.client_types || []}
                onCreateQuotation={handleCreateQuotation}
            />

            {/* Grid Principal: 2 columnas en desktop */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">

                {/* Columna Izquierda: Contacto */}
                <div className="space-y-6">
                    <ContactInfo
                        email={client.email}
                        phone={client.phone}
                        nic={client.nic}
                        address={client.address}
                        city={client.city}
                        state={client.state}
                        contacts={client.contacts || []}
                    />
                </div>

                {/* Columna Derecha: Datos Técnicos */}
                <div className="space-y-6">
                    <ProjectData
                        energyConsumptionKwh={client.energy_consumption_kwh}
                        monthlyBillAmount={client.monthly_bill_amount}
                        energyTariff={client.energy_tariff}
                        availableAreaM2={client.available_area_m2}
                        connectionPoint={client.connection_point}
                    />
                </div>
            </div>

            {/* Cotizaciones y Historial - Full width */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                <QuotationCTA
                    clientId={client.id}
                    quotations={client.quotations || []}
                    onCreateQuotation={handleCreateQuotation}
                />

                <InteractionTimeline
                    interactions={client.interactions || []}
                    onAddInteraction={handleAddInteraction}
                />
            </div>
        </AuthenticatedLayout>
    );
}
