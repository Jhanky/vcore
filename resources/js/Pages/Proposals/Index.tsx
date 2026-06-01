import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Search, Calendar, User, ArrowRight, MessageSquare, Clock } from 'lucide-react';
import { useState } from 'react';
import { showToast } from '@/Components/Toast';
import { cn } from '@/utils/cn';
import { formatCurrencySimple } from '@/utils/format';

export default function Index({ proposals, filters }: any) {
    const [search, setSearch] = useState(filters.search || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('proposals.index'), { search }, { preserveState: true });
    };

    const fmt = (v: number) => formatCurrencySimple(v);

    return (
        <AuthenticatedLayout header="Seguimiento de Propuestas">
            <Head title="Propuestas" />

            <div className="space-y-6">
                {/* Header Actions */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <form onSubmit={handleSearch} className="relative flex-1 max-w-md">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-secondary)]" />
                            <input
                                type="text"
                                placeholder="Buscar propuesta o cliente..."
                                className="w-full pl-11 pr-4 py-3 bg-[var(--surface)] border border-[var(--border-ui)] rounded-2xl text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/60 focus:border-[var(--solar-gold)] focus:ring focus:ring-[var(--solar-gold)]/20 transition-all shadow-sm"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </form>
                    </div>
                </div>

                {/* Proposals Grid/List */}
                <div className="grid grid-cols-1 gap-4">
                    {proposals.data.map((proposal: any) => (
                        <motion.div
                            key={proposal.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glass p-6 rounded-[2rem] border border-[var(--border-ui)] hover:border-[var(--solar-gold)]/30 transition-all group"
                        >
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <span className="px-3 py-1 rounded-full bg-[var(--solar-gold)]/10 text-[var(--solar-gold)] text-xs font-bold uppercase tracking-wider">
                                            {proposal.code}
                                        </span>
                                        <span className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
                                            <Calendar className="w-3.5 h-3.5" />
                                            Enviada el {new Date(proposal.issue_date).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-bold text-[var(--text-primary)] font-outfit">
                                        {proposal.project_name}
                                    </h3>
                                    <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--text-secondary)]">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-[var(--surface)] flex items-center justify-center">
                                                <User className="w-3 h-3 text-[var(--solar-gold)]" />
                                            </div>
                                            {proposal.client.name}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-amber-500" />
                                            Vence: {new Date(proposal.expiration_date).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between lg:justify-end gap-8 border-t lg:border-t-0 pt-4 lg:pt-0 border-[var(--border-ui)]">
                                    <div className="text-right">
                                        <p className="text-xs text-[var(--text-secondary)] uppercase tracking-widest font-bold mb-1">Valor Total</p>
                                        <p className="text-2xl font-bold text-[var(--solar-gold)] font-outfit">{fmt(proposal.total_value)}</p>
                                    </div>
                                    
                                    <Link
                                        href={route('quotations.show', proposal.id)}
                                        className="p-4 rounded-2xl bg-[var(--solar-gold)] text-slate-900 hover:brightness-110 transition-all shadow-lg shadow-[var(--solar-gold)]/20"
                                    >
                                        <ArrowRight className="w-6 h-6" />
                                    </Link>
                                </div>
                            </div>

                            {/* Footer follow-up info */}
                            <div className="mt-6 flex items-center gap-4 pt-4 border-t border-[var(--border-ui)]/50">
                                <div className="flex -space-x-2">
                                    {[1, 2].map(i => (
                                        <div key={i} className="w-8 h-8 rounded-full border-2 border-[var(--bg-main)] bg-[var(--surface)] flex items-center justify-center text-[10px] font-bold">
                                            {i === 1 ? 'JC' : 'AM'}
                                        </div>
                                    ))}
                                </div>
                                <p className="text-xs text-[var(--text-secondary)] flex-1">
                                    Último contacto: <span className="text-[var(--text-primary)] font-medium">Llamada de seguimiento (Hace 2 días)</span>
                                </p>
                                <button className="flex items-center gap-2 text-xs font-bold text-[var(--solar-gold)] hover:underline">
                                    <MessageSquare className="w-4 h-4" />
                                    Registrar Actividad
                                </button>
                            </div>
                        </motion.div>
                    ))}

                    {proposals.data.length === 0 && (
                        <div className="glass p-12 rounded-[2rem] text-center border-2 border-dashed border-[var(--border-ui)]">
                            <Clock className="w-12 h-12 text-[var(--text-secondary)] mx-auto mb-4 opacity-20" />
                            <h3 className="text-lg font-bold text-[var(--text-primary)]">Sin propuestas en seguimiento</h3>
                            <p className="text-[var(--text-secondary)] text-sm mt-1">Todas tus cotizaciones enviadas aparecerán aquí para que no pierdas ninguna oportunidad.</p>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
