import { router, Link, Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { showToast } from '@/Components/Toast';
import {
    Wrench, Calendar, Users, ArrowLeft, CheckCircle2,
    Clock, XCircle, AlertCircle
} from 'lucide-react';

interface Props {
    maintenance: any;
    canManage: boolean;
    isAssigned: boolean;
}

const STATUS_STYLES: Record<string, { bg: string; text: string; icon: any }> = {
    programado: { bg: 'bg-blue-500/20', text: 'text-blue-400', icon: Clock },
    en_progreso: { bg: 'bg-amber-500/20', text: 'text-amber-400', icon: AlertCircle },
    completado: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', icon: CheckCircle2 },
    cancelado: { bg: 'bg-red-500/20', text: 'text-red-400', icon: XCircle },
};

const PRIORITY_COLORS: Record<string, string> = {
    critica: 'text-red-400 bg-red-500/10',
    alta: 'text-orange-400 bg-orange-500/10',
    media: 'text-yellow-400 bg-yellow-500/10',
    baja: 'text-green-400 bg-green-500/10',
};

export default function MaintenanceShow({ maintenance, canManage, isAssigned }: Props) {
    const handleStart = () => {
        router.patch(route('maintenances.start', maintenance.id), {}, {
            onSuccess: () => showToast('Mantenimiento iniciado.', 'success'),
        });
    };

    const handleComplete = () => {
        const notes = prompt('Notas de finalización:');
        router.patch(route('maintenances.complete', maintenance.id), { completion_notes: notes }, {
            onSuccess: () => showToast('Mantenimiento completado.', 'success'),
        });
    };

    const handleCancel = () => {
        if (confirm('Cancelar este mantenimiento?')) {
            const notes = prompt('Motivo de cancelación:');
            router.patch(route('maintenances.cancel', maintenance.id), { completion_notes: notes }, {
                onSuccess: () => showToast('Mantenimiento cancelado.', 'success'),
            });
        }
    };

    const st = STATUS_STYLES[maintenance.status] || STATUS_STYLES.programado;
    const StatusIcon = st.icon;

    return (
        <AuthenticatedLayout header={`Mantenimiento ${maintenance.code}`}>
            <Head title={`Mantenimiento ${maintenance.code}`} />
            <div className="max-w-4xl mx-auto space-y-6">
                <Link href={route('maintenances.index')} className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--solar-gold)] transition-colors">
                    <ArrowLeft className="h-4 w-4" /> Volver a mantenimientos
                </Link>

                <div className="glass rounded-[2rem] p-8 border border-[var(--border-ui)]/30">
                    <div className="flex items-start justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <div className={`p-4 rounded-2xl ${st.bg}`}>
                                <StatusIcon className={`h-8 w-8 ${st.text}`} />
                            </div>
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <h1 className="text-2xl font-bold font-outfit text-[var(--text-primary)]">{maintenance.title}</h1>
                                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${st.bg} ${st.text}`}>{maintenance.status}</span>
                                </div>
                                <p className="text-sm text-[var(--text-secondary)]">{maintenance.code}</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            {(maintenance.status === 'programado' && (isAssigned || canManage)) && (
                                <PrimaryButton onClick={handleStart} className="flex items-center gap-2">
                                    <Clock className="h-4 w-4" /> Iniciar
                                </PrimaryButton>
                            )}
                            {(maintenance.status === 'en_progreso' && (isAssigned || canManage)) && (
                                <PrimaryButton onClick={handleComplete} className="flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4" /> Completar
                                </PrimaryButton>
                            )}
                            {(maintenance.status !== 'completado' && maintenance.status !== 'cancelado' && canManage) && (
                                <SecondaryButton onClick={handleCancel} className="flex items-center gap-2 text-red-400">
                                    <XCircle className="h-4 w-4" /> Cancelar
                                </SecondaryButton>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                        <div className="glass rounded-xl p-4 border border-[var(--border-ui)]">
                            <p className="text-xs text-[var(--text-secondary)] mb-1">Tipo</p>
                            <p className={`text-sm font-bold ${maintenance.type === 'preventivo' ? 'text-blue-400' : 'text-orange-400'}`}>
                                {maintenance.type === 'preventivo' ? 'Preventivo' : 'Correctivo'}
                            </p>
                        </div>
                        <div className="glass rounded-xl p-4 border border-[var(--border-ui)]">
                            <p className="text-xs text-[var(--text-secondary)] mb-1">Prioridad</p>
                            <p className={`text-sm font-bold ${PRIORITY_COLORS[maintenance.priority] || ''} inline-block px-2 py-1 rounded-xl`}>
                                {maintenance.priority}
                            </p>
                        </div>
                        <div className="glass rounded-xl p-4 border border-[var(--border-ui)]">
                            <p className="text-xs text-[var(--text-secondary)] mb-1">Fecha programada</p>
                            <p className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-1">
                                <Calendar className="h-4 w-4 text-[var(--text-secondary)]" />
                                {new Date(maintenance.scheduled_date).toLocaleDateString('es-CO')}
                            </p>
                        </div>
                        <div className="glass rounded-xl p-4 border border-[var(--border-ui)]">
                            <p className="text-xs text-[var(--text-secondary)] mb-1">Horas estimadas</p>
                            <p className="text-sm font-bold text-[var(--text-primary)]">
                                {maintenance.estimated_hours ? `${maintenance.estimated_hours}h` : '-'}
                            </p>
                        </div>
                    </div>

                    {maintenance.description && (
                        <div className="mb-8">
                            <h3 className="text-sm font-bold text-[var(--text-primary)] mb-2">Descripción</h3>
                            <p className="text-sm text-[var(--text-secondary)]">{maintenance.description}</p>
                        </div>
                    )}

                    {maintenance.completion_notes && (
                        <div className="mb-8">
                            <h3 className="text-sm font-bold text-[var(--text-primary)] mb-2">Notas de finalización</h3>
                            <p className="text-sm text-[var(--text-secondary)]">{maintenance.completion_notes}</p>
                        </div>
                    )}

                    {maintenance.project && (
                        <div className="mb-8">
                            <h3 className="text-sm font-bold text-[var(--text-primary)] mb-2">Proyecto asociado</h3>
                            <Link href={route('projects.show', maintenance.project.id)} className="text-sm text-[var(--solar-gold)] hover:brightness-125">
                                {maintenance.project.code} - {maintenance.project.name}
                            </Link>
                        </div>
                    )}

                    <div>
                        <h3 className="text-sm font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                            <Users className="h-4 w-4" /> Técnicos asignados
                        </h3>
                        <div className="space-y-2">
                            {maintenance.technicians?.map((t: any) => (
                                <div key={t.id} className="flex items-center justify-between p-3 rounded-xl border border-[var(--border-ui)] bg-slate-500/5">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-[var(--solar-gold)] flex items-center justify-center text-slate-900 text-xs font-bold">
                                            {t.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-[var(--text-primary)]">{t.name}</p>
                                            <p className="text-xs text-[var(--text-secondary)]">{t.pivot?.role === 'lider' ? 'Líder' : 'Apoyo'}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {(!maintenance.technicians || maintenance.technicians.length === 0) && (
                                <p className="text-sm text-[var(--text-secondary)]">Sin técnicos asignados.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
