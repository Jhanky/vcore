import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Building, FileText, CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';

export default function ProjectUpmeTab({ project, upmeDetail }) {
    const { data, setData, put, processing } = useForm({
        upme_registration_number: upmeDetail?.upme_registration_number || '',
        registration_date: upmeDetail?.registration_date || '',
        generation_capacity_kw: upmeDetail?.generation_capacity_kw || '',
        system_type: upmeDetail?.system_type || '',
        connection_type: upmeDetail?.connection_type || '',
        grid_integration_date: upmeDetail?.grid_integration_date || '',
        status: upmeDetail?.status || 'pending',
        notes: upmeDetail?.notes || '',
    });

    const getStatusIcon = (status) => {
        switch (status) {
            case 'approved':
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'in_review':
                return <Clock className="w-5 h-5 text-yellow-500" />;
            case 'rejected':
                return <XCircle className="w-5 h-5 text-red-500" />;
            default:
                return <AlertCircle className="w-5 h-5 text-gray-400" />;
        }
    };

    const getStatusLabel = (status) => {
        const labels = {
            pending: 'Pendiente',
            in_review: 'En Revisión',
            approved: 'Aprobado',
            rejected: 'Rechazado',
        };
        return labels[status] || status;
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: 'bg-slate-500/10 text-[var(--text-secondary)] border-slate-500/20',
            in_review: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
            approved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
            rejected: 'bg-red-500/10 text-red-400 border-red-500/20',
        };
        return colors[status] || 'bg-slate-500/10 text-[var(--text-secondary)] border-slate-500/20';
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('projects.upme.update', project.id));
    };

    return (
        <div className="glass rounded-[2rem] p-8">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold font-outfit text-[var(--text-primary)] flex items-center gap-2">
                    <Building className="w-5 h-5 text-[var(--solar-gold)]" />
                    Registro UPME
                </h3>
                <span className={`px-3 py-1 rounded-full text-sm font-bold border flex items-center gap-1 ${getStatusColor(data.status)}`}>
                    {getStatusIcon(data.status)}
                    {getStatusLabel(data.status)}
                </span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-[var(--text-secondary)] mb-2">
                            Número de Registro UPME
                        </label>
                        <input
                            type="text"
                            value={data.upme_registration_number}
                            onChange={(e) => setData('upme_registration_number', e.target.value)}
                            className="w-full rounded-xl border-[var(--border-ui)] bg-[var(--surface)] focus:border-[var(--solar-gold)] focus:ring focus:ring-[var(--solar-gold)]/20 text-[var(--text-primary)]"
                            placeholder="Ej: UPME-2026-001"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-[var(--text-secondary)] mb-2">
                            Fecha de Registro
                        </label>
                        <input
                            type="date"
                            value={data.registration_date}
                            onChange={(e) => setData('registration_date', e.target.value)}
                            className="w-full rounded-xl border-[var(--border-ui)] bg-[var(--surface)] focus:border-[var(--solar-gold)] focus:ring focus:ring-[var(--solar-gold)]/20 text-[var(--text-primary)]"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-[var(--text-secondary)] mb-2">
                            Capacidad de Generación (kW)
                        </label>
                        <input
                            type="number"
                            step="0.001"
                            value={data.generation_capacity_kw}
                            onChange={(e) => setData('generation_capacity_kw', e.target.value)}
                            className="w-full rounded-xl border-[var(--border-ui)] bg-[var(--surface)] focus:border-[var(--solar-gold)] focus:ring focus:ring-[var(--solar-gold)]/20 text-[var(--text-primary)]"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-[var(--text-secondary)] mb-2">
                            Tipo de Sistema
                        </label>
                        <input
                            type="text"
                            value={data.system_type}
                            onChange={(e) => setData('system_type', e.target.value)}
                            className="w-full rounded-xl border-[var(--border-ui)] bg-[var(--surface)] focus:border-[var(--solar-gold)] focus:ring focus:ring-[var(--solar-gold)]/20 text-[var(--text-primary)]"
                            placeholder="Ej: On-grid, Off-grid, Híbrido"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-[var(--text-secondary)] mb-2">
                            Tipo de Conexión
                        </label>
                        <input
                            type="text"
                            value={data.connection_type}
                            onChange={(e) => setData('connection_type', e.target.value)}
                            className="w-full rounded-xl border-[var(--border-ui)] bg-[var(--surface)] focus:border-[var(--solar-gold)] focus:ring focus:ring-[var(--solar-gold)]/20 text-[var(--text-primary)]"
                            placeholder="Ej: Monofásico, Trifásico"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-[var(--text-secondary)] mb-2">
                            Fecha de Integración a Red
                        </label>
                        <input
                            type="date"
                            value={data.grid_integration_date}
                            onChange={(e) => setData('grid_integration_date', e.target.value)}
                            className="w-full rounded-xl border-[var(--border-ui)] bg-[var(--surface)] focus:border-[var(--solar-gold)] focus:ring focus:ring-[var(--solar-gold)]/20 text-[var(--text-primary)]"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-[var(--text-secondary)] mb-2">
                            Estado del Registro
                        </label>
                        <select
                            value={data.status}
                            onChange={(e) => setData('status', e.target.value)}
                            className="w-full rounded-xl border-[var(--border-ui)] bg-[var(--surface)] focus:border-[var(--solar-gold)] focus:ring focus:ring-[var(--solar-gold)]/20 text-[var(--text-primary)]"
                        >
                            <option value="pending">Pendiente</option>
                            <option value="in_review">En Revisión</option>
                            <option value="approved">Aprobado</option>
                            <option value="rejected">Rechazado</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-[var(--text-secondary)] mb-2">
                        Notas
                    </label>
                    <textarea
                        value={data.notes}
                        onChange={(e) => setData('notes', e.target.value)}
                        className="w-full rounded-xl border-[var(--border-ui)] bg-[var(--surface)] focus:border-[var(--solar-gold)] focus:ring focus:ring-[var(--solar-gold)]/20 text-[var(--text-primary)]"
                        rows={3}
                        placeholder="Notas adicionales sobre el registro UPME..."
                    />
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={processing}
                        className="bg-[var(--solar-gold)] text-slate-900 py-3 px-6 rounded-xl font-bold hover:brightness-110 disabled:opacity-50 transition-all"
                    >
                        {processing ? 'Guardando...' : 'Guardar Datos UPME'}
                    </button>
                </div>
            </form>

            <div className="mt-8 border-t border-[var(--border-ui)]/50 pt-6">
                <h4 className="text-sm font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[var(--solar-gold)]" />
                    Documentación
                </h4>
                <p className="text-sm text-[var(--text-secondary)] text-center py-4">
                    La documentación relacionada con el registro UPME aparecerá aquí.
                </p>
            </div>
        </div>
    );
}
