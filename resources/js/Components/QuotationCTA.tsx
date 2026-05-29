import { Zap, FileText, Plus } from 'lucide-react';
import { Link } from '@inertiajs/react';

interface Quotation {
    id: number;
    title: string;
    status: string;
    created_at: string;
    total: number;
}

interface Props {
    clientId: number;
    quotations: Quotation[];
    onCreateQuotation: () => void;
}

export default function QuotationCTA({ clientId, quotations, onCreateQuotation }: Props) {
    const hasQuotations = quotations && quotations.length > 0;

    return (
        <section className="glass p-6 rounded-[2rem]">
            <div className="flex items-center justify-between mb-4">
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
                    {quotations.map((quotation) => (
                        <Link
                            key={quotation.id}
                            href={route('quotations.show', quotation.id)}
                            className="flex items-center justify-between p-4 rounded-xl bg-slate-500/5 border border-[var(--border-ui)]/50 hover:border-[var(--solar-gold)]/30 transition-colors group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-[var(--solar-gold)]/10 text-[var(--solar-gold)]">
                                    <FileText className="h-5 w-5" />
                                </div>
                                <div>
                                    <div className="font-bold text-[var(--text-primary)] text-sm group-hover:text-[var(--solar-gold)] transition-colors">
                                        {quotation.title}
                                    </div>
                                    <div className="text-xs text-[var(--text-secondary)]">
                                        {new Date(quotation.created_at).toLocaleDateString('es-ES')}
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="font-bold text-[var(--text-primary)]">
                                    ${quotation.total?.toLocaleString('es-CO') || 0}
                                </div>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${
                                    quotation.status === 'aprobada' ? 'bg-emerald-500/20 text-emerald-400' :
                                    quotation.status === 'rechazada' ? 'bg-red-500/20 text-red-400' :
                                    quotation.status === 'vencida' ? 'bg-amber-500/20 text-amber-400' :
                                    'bg-blue-500/20 text-blue-400'
                                }`}>
                                    {quotation.status}
                                </span>
                            </div>
                        </Link>
                    ))}
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
