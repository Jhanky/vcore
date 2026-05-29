import { useState } from 'react';
import { Flag, Check, Clock, AlertTriangle, X } from 'lucide-react';

export default function ProjectMilestonesTimeline({ project, milestones: initialMilestones, milestoneTypes = [], onComplete, readOnly = false }) {
    const [showForm, setShowForm] = useState(false);
    const [newMilestone, setNewMilestone] = useState({
        title: '',
        description: '',
        planned_date: '',
        milestone_type_id: '',
    });

    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed':
                return <Check className="w-4 h-4 text-white" />;
            case 'in_progress':
                return <Clock className="w-4 h-4 text-white" />;
            case 'delayed':
                return <AlertTriangle className="w-4 h-4 text-white" />;
            case 'cancelled':
                return <X className="w-4 h-4 text-white" />;
            default:
                return <Flag className="w-4 h-4 text-white" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed':
                return 'bg-emerald-500';
            case 'in_progress':
                return 'bg-blue-500';
            case 'delayed':
                return 'bg-amber-500';
            case 'cancelled':
                return 'bg-red-500';
            default:
                return 'bg-slate-500';
        }
    };

    const getMilestoneStyle = (milestone) => {
        if (milestone.milestone_type?.color) {
            return {
                backgroundColor: milestone.milestone_type.color + '10',
                borderColor: milestone.milestone_type.color + '30',
            };
        }
        return {
            backgroundColor: 'var(--surface)',
            borderColor: 'var(--border-ui)',
        };
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('es-CO');
    };

    const isOverdue = (milestone) => {
        return milestone.planned_date &&
            new Date(milestone.planned_date) < new Date() &&
            !['completed', 'cancelled'].includes(milestone.status);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
    };

    return (
        <div className="glass rounded-[2rem] p-8">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold font-outfit text-[var(--text-primary)]">Hitos del Proyecto</h3>
                {!readOnly && (
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="text-sm text-[var(--solar-gold)] hover:underline font-bold"
                    >
                        {showForm ? 'Cancelar' : '+ Agregar Hito'}
                    </button>
                )}
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="mb-6 p-4 bg-slate-500/5 rounded-2xl border border-[var(--border-ui)]/50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs text-[var(--text-secondary)] uppercase tracking-wide mb-1">
                                Título
                            </label>
                            <input
                                type="text"
                                value={newMilestone.title}
                                onChange={(e) => setNewMilestone({ ...newMilestone, title: e.target.value })}
                                className="w-full rounded-xl border-[var(--border-ui)] bg-[var(--surface)] text-sm focus:border-[var(--solar-gold)] focus:ring focus:ring-[var(--solar-gold)]/20 text-[var(--text-primary)]"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-[var(--text-secondary)] uppercase tracking-wide mb-1">
                                Tipo
                            </label>
                            <select
                                value={newMilestone.milestone_type_id}
                                onChange={(e) => setNewMilestone({ ...newMilestone, milestone_type_id: e.target.value })}
                                className="w-full rounded-xl border-[var(--border-ui)] bg-[var(--surface)] text-sm focus:border-[var(--solar-gold)] focus:ring focus:ring-[var(--solar-gold)]/20 text-[var(--text-primary)]"
                            >
                                <option value="">Seleccionar tipo</option>
                                {milestoneTypes.map((type) => (
                                    <option key={type.id} value={type.id}>
                                        {type.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs text-[var(--text-secondary)] uppercase tracking-wide mb-1">
                                Fecha Planeada
                            </label>
                            <input
                                type="date"
                                value={newMilestone.planned_date}
                                onChange={(e) => setNewMilestone({ ...newMilestone, planned_date: e.target.value })}
                                className="w-full rounded-xl border-[var(--border-ui)] bg-[var(--surface)] text-sm focus:border-[var(--solar-gold)] focus:ring focus:ring-[var(--solar-gold)]/20 text-[var(--text-primary)]"
                            />
                        </div>
                    </div>
                    <div className="mt-4">
                        <label className="block text-xs text-[var(--text-secondary)] uppercase tracking-wide mb-1">
                            Descripción
                        </label>
                        <textarea
                            value={newMilestone.description}
                            onChange={(e) => setNewMilestone({ ...newMilestone, description: e.target.value })}
                            className="w-full rounded-xl border-[var(--border-ui)] bg-[var(--surface)] text-sm focus:border-[var(--solar-gold)] focus:ring focus:ring-[var(--solar-gold)]/20 text-[var(--text-primary)]"
                            rows={2}
                        />
                    </div>
                    <div className="mt-4 flex justify-end">
                        <button
                            type="submit"
                            className="bg-[var(--solar-gold)] text-slate-900 py-2 px-4 rounded-xl text-sm font-bold hover:brightness-110 transition-all"
                        >
                            Crear Hito
                        </button>
                    </div>
                </form>
            )}

            {project.milestones && project.milestones.length > 0 ? (
                <div className="relative">
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-[var(--border-ui)]" />

                    <div className="space-y-4">
                        {project.milestones.map((milestone) => (
                            <div
                                key={milestone.id}
                                className={`relative pl-10 p-4 rounded-2xl border ${isOverdue(milestone) ? 'border-amber-500/30 bg-amber-500/10' : ''}`}
                                style={getMilestoneStyle(milestone)}
                            >
                                <div className={`absolute left-2 w-4 h-4 rounded-full flex items-center justify-center ${getStatusColor(milestone.status)}`}>
                                    {getStatusIcon(milestone.status)}
                                </div>

                                <div className="flex items-start justify-between">
                                    <div>
                                        <div className="font-bold text-[var(--text-primary)]">{milestone.title}</div>
                                        {milestone.description && (
                                            <div className="text-sm text-[var(--text-secondary)] mt-1">{milestone.description}</div>
                                        )}
                                        <div className="flex items-center gap-4 mt-2 text-xs text-[var(--text-secondary)]">
                                            <span>
                                                Planeado: {formatDate(milestone.planned_date)}
                                            </span>
                                            {milestone.actual_date && (
                                                <span className="text-emerald-400">
                                                    Completado: {formatDate(milestone.actual_date)}
                                                </span>
                                            )}
                                            {milestone.responsible && (
                                                <span>
                                                    Responsable: {milestone.responsible.name}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {!readOnly && milestone.status === 'pending' && !milestone.requires_verification && (
                                            <button
                                                onClick={() => onComplete && onComplete(milestone.id)}
                                                className="text-xs bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20 font-bold hover:bg-emerald-500/20 transition-colors"
                                            >
                                                Completar
                                            </button>
                                        )}
                                        {isOverdue(milestone) && (
                                            <span className="text-xs text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 font-bold">
                                                Atrasado
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <p className="text-sm text-[var(--text-secondary)] text-center py-8">
                    No hay hitos registrados
                </p>
            )}
        </div>
    );
}
