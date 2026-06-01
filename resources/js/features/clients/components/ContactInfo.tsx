import { Mail, Phone, MapPin, Plug } from 'lucide-react';

interface Contact {
    id: number;
    name: string;
    position: string;
    email: string;
    phone: string;
    is_primary: boolean;
    is_decision_maker: boolean;
}

interface Props {
    email?: string;
    phone?: string;
    nic?: string;
    address: string;
    city: string;
    state: string;
    contacts: Contact[];
}

export default function ContactInfo({
    email,
    phone,
    nic,
    address,
    city,
    state,
    contacts
}: Props) {
    return (
        <section className="glass p-6 rounded-[2rem]">
            <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4 font-outfit flex items-center gap-2">
                <Mail className="h-5 w-5 text-[var(--solar-gold)]" />
                Contacto
            </h3>

            <div className="space-y-4">
                {email && (
                    <a
                        href={`mailto:${email}`}
                        className="flex items-center gap-3 p-3 rounded-xl bg-slate-500/5 border border-[var(--border-ui)]/50 hover:border-[var(--solar-gold)]/30 transition-colors group"
                    >
                        <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                            <Mail className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-xs text-[var(--text-secondary)]">Correo</div>
                            <div className="text-sm font-bold text-[var(--text-primary)] truncate group-hover:text-[var(--solar-gold)] transition-colors">
                                {email}
                            </div>
                        </div>
                    </a>
                )}

                {phone && (
                    <a
                        href={`tel:${phone}`}
                        className="flex items-center gap-3 p-3 rounded-xl bg-slate-500/5 border border-[var(--border-ui)]/50 hover:border-[var(--solar-gold)]/30 transition-colors group"
                    >
                        <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                            <Phone className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                            <div className="text-xs text-[var(--text-secondary)]">Teléfono</div>
                            <div className="text-sm font-bold text-[var(--text-primary)] group-hover:text-[var(--solar-gold)] transition-colors">
                                {phone}
                            </div>
                        </div>
                    </a>
                )}

                {nic && (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-500/5 border border-[var(--border-ui)]/50">
                        <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                            <Plug className="h-5 w-5" />
                        </div>
                        <div>
                            <div className="text-xs text-[var(--text-secondary)]">NIC</div>
                            <div className="text-sm font-bold text-[var(--text-primary)]">{nic}</div>
                        </div>
                    </div>
                )}

                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-500/5 border border-[var(--border-ui)]/50">
                    <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
                        <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                        <div className="text-xs text-[var(--text-secondary)]">Ubicación</div>
                        <div className="text-sm font-bold text-[var(--text-primary)]">
                            {address ? `${address}` : ''}
                            {city || state ? `, ${[city, state].filter(Boolean).join(', ')}` : ''}
                            {!address && !city && !state && 'No registrada'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Personas de Contacto */}
            {contacts && contacts.length > 0 && (
                <div className="mt-6 pt-6 border-t border-[var(--border-ui)]/30">
                    <h4 className="text-sm font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                        <Phone className="h-4 w-4 text-[var(--solar-gold)]" />
                        Personas de Contacto
                    </h4>
                    <div className="space-y-3">
                        {contacts.map((contact) => (
                            <div key={contact.id} className="p-3 rounded-xl bg-slate-500/5 border border-[var(--border-ui)]/50 relative">
                                {contact.is_decision_maker && (
                                    <div className="absolute top-0 right-0 bg-[var(--solar-gold)] text-slate-900 text-[10px] font-bold px-2 py-0.5 rounded-bl-lg flex items-center gap-1">
                                        Decisor
                                    </div>
                                )}
                                <div className="font-bold text-[var(--text-primary)] text-sm mb-1 flex items-center gap-2 pr-16">
                                    {contact.name}
                                    {contact.is_primary && (
                                        <span className="text-[10px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded uppercase">
                                            Principal
                                        </span>
                                    )}
                                </div>
                                {contact.position && (
                                    <div className="text-xs text-[var(--solar-gold)] font-medium mb-2">
                                        {contact.position}
                                    </div>
                                )}
                                <div className="space-y-1">
                                    {contact.email && (
                                        <a
                                            href={`mailto:${contact.email}`}
                                            className="flex items-center gap-2 text-xs text-[var(--text-secondary)] hover:text-[var(--solar-gold)] transition-colors"
                                        >
                                            <Mail className="h-3 w-3" />
                                            {contact.email}
                                        </a>
                                    )}
                                    {contact.phone && (
                                        <a
                                            href={`tel:${contact.phone}`}
                                            className="flex items-center gap-2 text-xs text-[var(--text-secondary)] hover:text-[var(--solar-gold)] transition-colors"
                                        >
                                            <Phone className="h-3 w-3" />
                                            {contact.phone}
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </section>
    );
}
