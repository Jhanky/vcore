import { Plus, User } from 'lucide-react';

interface ClientType {
    id: number;
    name: string;
    code: string;
}

interface Props {
    name: string;
    clientTypes: ClientType[];
    onCreateQuotation: () => void;
}

export default function ClientHeader({
    name,
    clientTypes,
    onCreateQuotation
}: Props) {
    return (
        <section className="glass p-6 rounded-[2rem] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-[var(--solar-gold)]/10 to-transparent"></div>

            <div className="flex flex-col md:flex-row md:items-center gap-6 relative z-10">
                {/* Avatar */}
                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-[var(--solar-gold)] to-amber-600 mx-auto md:mx-0 flex items-center justify-center text-3xl font-bold text-slate-900 font-outfit shadow-xl shadow-[var(--solar-gold)]/20">
                    {name.charAt(0).toUpperCase()}
                </div>

                {/* Info */}
                <div className="flex-1 text-center md:text-left">
                    <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] font-outfit">
                        {name}
                    </h1>

                    {clientTypes && clientTypes.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2 justify-center md:justify-start">
                            {clientTypes.map((type) => (
                                <span
                                    key={type.id}
                                    className="px-3 py-1 rounded-xl bg-[var(--solar-gold)]/10 text-[var(--solar-gold)] font-bold text-xs flex items-center gap-1"
                                >
                                    <User className="h-3 w-3" />
                                    {type.name}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Acciones Rápidas */}
                <div className="flex items-center gap-3 justify-center md:justify-end">
                    <button
                        onClick={onCreateQuotation}
                        className="inline-flex items-center gap-2 bg-[var(--solar-gold)] text-slate-900 font-bold px-4 py-2 rounded-xl hover:bg-[var(--solar-gold)]/90 transition-colors"
                        title="Crear nueva cotización"
                    >
                        <Plus className="h-4 w-4" />
                        <span className="hidden sm:inline">Cotización</span>
                    </button>
                </div>
            </div>
        </section>
    );
}
