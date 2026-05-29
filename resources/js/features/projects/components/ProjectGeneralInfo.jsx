import { MapPin, Calendar, DollarSign, User, Building, Wrench } from 'lucide-react';

export default function ProjectGeneralInfo({ project }) {
    const formatCurrency = (value) => {
        if (!value) return '-';
        return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(value);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('es-CO');
    };

    const getPriorityColor = (priority) => {
        const colors = {
            alta: 'bg-red-500/10 text-red-400 border-red-500/20',
            media: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
            baja: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        };
        return colors[priority] || 'bg-slate-500/10 text-[var(--text-secondary)] border-slate-500/20';
    };

    return (
        <div className="glass rounded-[2rem] p-8">
            <div className="flex items-start justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold font-outfit text-[var(--text-primary)]">{project.name}</h2>
                    <p className="text-sm text-[var(--text-secondary)] mt-1">{project.code}</p>
                </div>
                <span
                    className="px-3 py-1 rounded-full text-sm font-bold border"
                    style={{
                        backgroundColor: project.current_state.color + '15',
                        color: project.current_state.color,
                        borderColor: project.current_state.color + '40',
                    }}
                >
                    {project.current_state.name}
                </span>
            </div>

            {project.description && (
                <p className="text-[var(--text-secondary)] mb-6">{project.description}</p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-slate-500/10 text-[var(--text-secondary)]">
                        <Building className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="text-xs text-[var(--text-secondary)] uppercase tracking-wide mb-1">Cliente</div>
                        <div className="text-sm font-bold text-[var(--text-primary)]">{project.client?.name || '-'}</div>
                        {project.client?.email && (
                            <div className="text-xs text-[var(--text-secondary)]">{project.client.email}</div>
                        )}
                    </div>
                </div>

                <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-slate-500/10 text-[var(--text-secondary)]">
                        <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="text-xs text-[var(--text-secondary)] uppercase tracking-wide mb-1">Dirección de Instalación</div>
                        <div className="text-sm font-bold text-[var(--text-primary)]">
                            {project.installation_address || '-'}
                        </div>
                        {project.coordinates && (
                            <div className="text-xs text-[var(--text-secondary)]">{project.coordinates}</div>
                        )}
                    </div>
                </div>

                <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-slate-500/10 text-[var(--text-secondary)]">
                        <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="text-xs text-[var(--text-secondary)] uppercase tracking-wide mb-1">Fechas</div>
                        <div className="text-sm font-bold text-[var(--text-primary)]">
                            Inicio: {formatDate(project.start_date)}
                        </div>
                        <div className="text-xs text-[var(--text-secondary)]">
                            Fin estimado: {formatDate(project.estimated_end_date)}
                        </div>
                        {project.actual_end_date && (
                            <div className="text-xs text-[var(--text-secondary)]">
                                Fin real: {formatDate(project.actual_end_date)}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-slate-500/10 text-[var(--text-secondary)]">
                        <DollarSign className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="text-xs text-[var(--text-secondary)] uppercase tracking-wide mb-1">Valores</div>
                        <div className="text-sm font-bold text-[var(--text-primary)]">
                            {formatCurrency(project.contracted_value_cop)}
                        </div>
                        <div className="text-xs text-[var(--text-secondary)]">
                            Costo total: {formatCurrency(project.total_cost_cop)}
                        </div>
                    </div>
                </div>

                <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-slate-500/10 text-[var(--text-secondary)]">
                        <User className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="text-xs text-[var(--text-secondary)] uppercase tracking-wide mb-1">Equipo</div>
                        <div className="text-sm font-bold text-[var(--text-primary)]">
                            Gerente: {project.project_manager?.name || '-'}
                        </div>
                        <div className="text-xs text-[var(--text-secondary)]">
                            Líder Técnico: {project.technical_leader?.name || '-'}
                        </div>
                    </div>
                </div>

                <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-slate-500/10 text-[var(--text-secondary)]">
                        <Wrench className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="text-xs text-[var(--text-secondary)] uppercase tracking-wide mb-1">Prioridad</div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border capitalize ${getPriorityColor(project.priority)}`}>
                            {project.priority || 'media'}
                        </span>
                    </div>
                </div>
            </div>

            {project.quotation && (
                <div className="mt-6 pt-6 border-t border-[var(--border-ui)]/50">
                    <h4 className="text-sm font-bold text-[var(--text-primary)] mb-3">Cotización Asociada</h4>
                    <div className="bg-slate-500/5 rounded-2xl border border-[var(--border-ui)]/50 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm font-bold text-[var(--text-primary)]">
                                    {project.quotation.code}
                                </div>
                                <div className="text-xs text-[var(--text-secondary)]">
                                    {project.quotation.project_name}
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm font-bold text-[var(--text-primary)]">
                                    {formatCurrency(project.quotation.total_value)}
                                </div>
                                <div className="text-xs text-[var(--text-secondary)]">
                                    {project.quotation.power_kwp} kWp
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {project.notes && (
                <div className="mt-6 pt-6 border-t border-[var(--border-ui)]/50">
                    <h4 className="text-sm font-bold text-[var(--text-primary)] mb-3">Notas</h4>
                    <p className="text-sm text-[var(--text-secondary)] whitespace-pre-wrap">{project.notes}</p>
                </div>
            )}

            <div className="mt-6 pt-6 border-t border-[var(--border-ui)]/50">
                <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
                    <span>Creado: {formatDate(project.created_at)}</span>
                    <span>Última actualización: {formatDate(project.updated_at)}</span>
                </div>
            </div>
        </div>
    );
}
