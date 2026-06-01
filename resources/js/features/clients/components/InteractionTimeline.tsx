import { useState } from 'react';
import { Phone, Mail, MapPin, MessageSquare, Plus } from 'lucide-react';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import { useForm } from '@inertiajs/react';

interface Interaction {
    id: number;
    type: string;
    notes: string;
    interaction_date: string;
}

interface Props {
    interactions: Interaction[];
    onAddInteraction: (data: { type: string; notes: string; interaction_date: string }) => void;
}

export default function InteractionTimeline({ interactions, onAddInteraction }: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { data, setData, post, processing, reset } = useForm({
        type: 'Nota',
        notes: '',
        interaction_date: new Date().toISOString().slice(0, 16),
    });

    const submitInteraction = (e: React.FormEvent) => {
        e.preventDefault();
        onAddInteraction(data);
        setIsModalOpen(false);
        reset();
    };

    const getInteractionIcon = (type: string) => {
        switch (type) {
            case 'Llamada': return <Phone className="h-4 w-4" />;
            case 'Correo': return <Mail className="h-4 w-4" />;
            case 'Visita': return <MapPin className="h-4 w-4" />;
            default: return <MessageSquare className="h-4 w-4" />;
        }
    };

    return (
        <section className="glass p-6 rounded-[2rem]">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-[var(--text-primary)] font-outfit flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-[var(--solar-gold)]" />
                    Historial de Interacciones
                </h3>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="inline-flex items-center gap-2 bg-[var(--solar-gold)]/10 text-[var(--solar-gold)] font-bold px-4 py-2 rounded-xl hover:bg-[var(--solar-gold)]/20 transition-colors border border-[var(--solar-gold)]/30"
                >
                    <Plus className="h-4 w-4" />
                    <span>Nueva Interacción</span>
                </button>
            </div>

            {/* Timeline */}
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-[var(--border-ui)] before:to-transparent">

                {interactions && interactions.length > 0 ? (
                    interactions.map((interaction) => (
                        <div key={interaction.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-slate-900 bg-[var(--solar-gold)] text-slate-900 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                                {getInteractionIcon(interaction.type)}
                            </div>

                            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl border border-[var(--border-ui)]/50 bg-slate-500/5 shadow-sm">
                                <div className="flex items-center justify-between mb-1">
                                    <div className="font-bold text-[var(--text-primary)] text-sm">
                                        {interaction.type}
                                    </div>
                                    <time className="text-xs font-medium text-[var(--text-secondary)]">
                                        {new Date(interaction.interaction_date).toLocaleString('es-ES', {
                                            day: 'numeric',
                                            month: 'short',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </time>
                                </div>
                                <div className="text-sm text-[var(--text-secondary)]">
                                    {interaction.notes}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-8 text-[var(--text-secondary)] italic relative z-10">
                        No hay interacciones registradas aún.
                    </div>
                )}
            </div>

            {/* Modal */}
            <Modal
                show={isModalOpen}
                maxWidth="lg"
                onClose={() => setIsModalOpen(false)}
            >
                <div className="p-4 sm:p-6 bg-[var(--bg-primary)]">
                    <h3 className="text-xl font-bold text-[var(--text-primary)] mb-4 font-outfit flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-[var(--solar-gold)]" />
                        Nueva Interacción
                    </h3>

                    <form onSubmit={submitInteraction}>
                        <div className="flex flex-wrap gap-4 mb-4">
                            <select
                                className="rounded-xl border-[var(--border-ui)] bg-[var(--bg-content)] text-sm focus:border-[var(--solar-gold)] focus:ring focus:ring-[var(--solar-gold)]/20 text-[var(--text-primary)] [&>option]:bg-[var(--bg-content)]"
                                value={data.type}
                                onChange={e => setData('type', e.target.value)}
                            >
                                <option value="Nota">Nota</option>
                                <option value="Llamada">Llamada</option>
                                <option value="Correo">Correo</option>
                                <option value="Visita">Visita</option>
                            </select>

                            <input
                                type="datetime-local"
                                className="rounded-xl border-[var(--border-ui)] bg-[var(--bg-content)] text-sm focus:border-[var(--solar-gold)] focus:ring focus:ring-[var(--solar-gold)]/20 text-[var(--text-primary)]"
                                value={data.interaction_date}
                                onChange={e => setData('interaction_date', e.target.value)}
                            />
                        </div>

                        <textarea
                            className="w-full rounded-2xl border-[var(--border-ui)] bg-[var(--bg-content)] text-sm focus:border-[var(--solar-gold)] focus:ring focus:ring-[var(--solar-gold)]/20 text-[var(--text-primary)] resize-none mb-4"
                            rows={4}
                            placeholder={`Agregar detalles de la ${data.type.toLowerCase()}...`}
                            value={data.notes}
                            onChange={e => setData('notes', e.target.value)}
                            required
                        />

                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                            >
                                Cancelar
                            </button>
                            <PrimaryButton disabled={processing} className="py-2 px-4 rounded-xl text-xs gap-1">
                                <Plus className="h-3 w-3" />
                                Agregar
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </Modal>
        </section>
    );
}
