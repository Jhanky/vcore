import { Zap, FileText, Plus, CalendarClock, Hourglass, DollarSign } from 'lucide-react';
import { Link } from '@inertiajs/react';

interface Quotation {
    id: number;
    project_name: string;
    status: string;
    created_at: string;
    expiration_date: string;
    total_value: number;
}

interface Props {
    clientId: number;
    quotations: Quotation[];
    onCreateQuotation: () => void;
}

function getDaysRemaining(expirationDate: string): { days: number; expired: boolean } | null {
    if (!expirationDate) return null;
    const now = new Date();
    const exp = new Date(expirationDate);
    const diffTime = exp.getTime() - now.getTime();
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return { days, expired: days < 0 };
}

function formatCOP(value: number): string {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
}

export default function QuotationCTA({ clientId, quotations, onCreateQuotation }: Props) {
    const hasQuotations = quotations && quotations.length > 0;

    return (
        <section className="glass p-6 rounded-[2rem]">
            <div className="flex items-center justify-between mb-5">
                <h3 className="text-xl font-bold text-[var(--text-primary)] font-outfit flex items-center gap-2">
                    <Zap className="h-5 w-5 text-[var(--solar-gold)]" />
                    Cotizaciones y Propuestas
                </h3>
                <button
                    onClick={onCreateQuotation}
                    className="inline-flex items-center gap-2 bg-[var(--solar-gold)]/10 text-[var(--solar-gold)] font-bold px-3 py-1.5 rounded-xl hover:bg-[var(--solar-gold)]/20 transition-colors text-sm border border-[var(--solar-gold)]/30"
                >
                    <Plus className="h-4 w-4" />
                    Nueva
                </button>
            </div>

            {hasQuotations ? (
                <div className="space-y-3">
                    {quotations.map((quotation) => {
                        const daysInfo = getDaysRemaining(quotation.expiration_date);
                        return (
                            <Link
                                key={quotation.id}
                                href={route('quotations.show', quotation.id)}
                                className="block p-4 rounded-xl bg-slate-500/5 border border-[var(--border-ui)]/50 hover:border-[var(--solar-gold)]/40 hover:bg-slate-500/10 transition-all duration-200 group"
                            >
                                {/* Primera fila: nombre + estado */}
                                <div className="flex items-start justify-between gap-3 mb-3">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="p-2 rounded-xl bg-[var(--solar-gold)]/10 text-[var(--solar-gold)] shrink-0">
                                            <FileText className="h-5 w-5" />
                                        </div>
                                        <div className="min-w-0">
                                            <div className="font-bold text-[var(--text-primary)] group-hover:text-[var(--solar-gold)] transition-colors truncate">
                                                {quotation.project_name || 'Cotización'}
                                            </div>
                                            <div className="text-xs text-[var(--text-secondary)] mt-0.5">
                                                Creada: {new Date(quotation.created_at).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' })}
                                            </div>
                                        </div>
                                    </div>
                                    <span className={`text-xs px-2.5 py-1 rounded-full font-bold shrink-0 ${
                                        quotation.status === 'Aprobada' ? 'bg-emerald-500/20 text-emerald-400' :
                                        quotation.status === 'Rechazada' ? 'bg-red-500/20 text-red-400' :
                                        quotation.status === 'Vencida' ? 'bg-amber-500/20 text-amber-400' :
                                        quotation.status === 'Enviada' ? 'bg-blue-500/20 text-blue-400' :
                                        'bg-slate-500/20 text-slate-400'
                                    }`}>
                                        {quotation.status}
                                    </span>
                                </div>

                                {/* Segunda fila: grid de datos */}
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                                        <CalendarClock className="h-3.5 w-3.5 shrink-0" />
                                        <span className="truncate">
                                            Vence: {quotation.expiration_date ? new Date(quotation.expiration_date).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Sin fecha'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs">
                                        <Hourglass className={`h-3.5 w-3.5 shrink-0 ${
                                            daysInfo === null ? 'text-[var(--text-secondary)]' :
                                            daysInfo.expired ? 'text-red-400' :
                                            daysInfo.days <= 5 ? 'text-amber-400' :
                                            'text-emerald-400'
                                        }`} />
                                        <span className={`truncate ${
                                            daysInfo === null ? 'text-[var(--text-secondary)]' :
                                            daysInfo.expired ? 'text-red-400 font-bold' :
                                            daysInfo.days <= 5 ? 'text-amber-400 font-bold' :
                                            'text-emerald-400'
                                        }`}>
                                            {daysInfo === null ? 'Sin vencimiento' :
                                             daysInfo.expired ? `${Math.abs(daysInfo.days)} día(s) vencida` :
                                             `${daysInfo.days} día(s) restante(s)`}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs justify-end">
                                        <DollarSign className="h-3.5 w-3.5 shrink-0 text-[var(--solar-gold)]" />
                                        <span className="font-bold text-[var(--text-primary)] truncate">
                                            {formatCOP(quotation.total_value || 0)}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--solar-gold)]/10 mb-4">
                        <FileText className="h-8 w-8 text-[var(--solar-gold)]" />
                    </div>
                    <p className="text-[var(--text-secondary)] font-medium mb-4">
                        Este cliente aún no tiene cotizaciones.
                    </p>
                    <button
                        onClick={onCreateQuotation}
                        className="inline-flex items-center gap-2 bg-[var(--solar-gold)] text-slate-900 font-bold px-6 py-3 rounded-xl hover:bg-[var(--solar-gold)]/90 transition-colors"
                    >
                        <Plus className="h-5 w-5" />
                        Crear Primera Cotización
                    </button>
                </div>
            )}
        </section>
    );
}
