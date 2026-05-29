import { useState } from 'react';
import { router, Link, Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { showToast } from '@/Components/Toast';
import {
    Ticket, User, ArrowLeft, MessageSquare, CheckCircle2,
    Clock, XCircle, AlertCircle, Send
} from 'lucide-react';

interface Props {
    ticket: any;
    canManage: boolean;
}

const STATUS_STYLES: Record<string, { bg: string; text: string; icon: any }> = {
    abierto: { bg: 'bg-blue-500/20', text: 'text-blue-400', icon: AlertCircle },
    en_progreso: { bg: 'bg-amber-500/20', text: 'text-amber-400', icon: Clock },
    resuelto: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', icon: CheckCircle2 },
    cerrado: { bg: 'bg-gray-500/20', text: 'text-gray-400', icon: XCircle },
};

const PRIORITY_COLORS: Record<string, string> = {
    critica: 'text-red-400 bg-red-500/10',
    alta: 'text-orange-400 bg-orange-500/10',
    media: 'text-yellow-400 bg-yellow-500/10',
    baja: 'text-green-400 bg-green-500/10',
};

export default function TicketShow({ ticket, canManage }: Props) {
    const [newComment, setNewComment] = useState('');
    const [assignId, setAssignId] = useState('');

    const handleAddComment = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        router.post(route('tickets.comments', ticket.id), {
            comment: newComment,
        }, {
            onSuccess: () => {
                setNewComment('');
                showToast('Comentario agregado.', 'success');
            },
        });
    };

    const handleAssign = () => {
        if (!assignId) return;
        router.patch(route('tickets.assign', ticket.id), {
            assigned_to: assignId,
        }, {
            onSuccess: () => showToast('Ticket asignado.', 'success'),
        });
    };

    const handleResolve = () => {
        const notes = prompt('Notas de resolución:');
        router.patch(route('tickets.resolve', ticket.id), { resolution_notes: notes }, {
            onSuccess: () => showToast('Ticket resuelto.', 'success'),
        });
    };

    const handleClose = () => {
        if (confirm('Cerrar este ticket?')) {
            router.patch(route('tickets.close', ticket.id), {}, {
                onSuccess: () => showToast('Ticket cerrado.', 'success'),
            });
        }
    };

    const st = STATUS_STYLES[ticket.status] || STATUS_STYLES.abierto;
    const StatusIcon = st.icon;

    return (
        <AuthenticatedLayout header={`Ticket ${ticket.code}`}>
            <Head title={`Ticket ${ticket.code}`} />
            <div className="max-w-4xl mx-auto space-y-6">
                <Link href={route('tickets.index')} className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--solar-gold)] transition-colors">
                    <ArrowLeft className="h-4 w-4" /> Volver a tickets
                </Link>

                <div className="glass rounded-[2rem] p-8 border border-[var(--border-ui)]/30">
                    <div className="flex items-start justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <div className={`p-4 rounded-2xl ${st.bg}`}>
                                <StatusIcon className={`h-8 w-8 ${st.text}`} />
                            </div>
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <h1 className="text-2xl font-bold font-outfit text-[var(--text-primary)]">{ticket.title}</h1>
                                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${st.bg} ${st.text}`}>{ticket.status}</span>
                                </div>
                                <p className="text-sm text-[var(--text-secondary)]">{ticket.code}</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            {(ticket.status === 'abierto' || ticket.status === 'en_progreso') && (
                                (canManage || ticket.assigned_to === null) && (
                                    <PrimaryButton onClick={handleResolve} className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4" /> Resolver
                                    </PrimaryButton>
                                )
                            )}
                            {ticket.status === 'resuelto' && canManage && (
                                <PrimaryButton onClick={handleClose} className="flex items-center gap-2">
                                    <XCircle className="h-4 w-4" /> Cerrar
                                </PrimaryButton>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                        <div className="glass rounded-xl p-4 border border-[var(--border-ui)]">
                            <p className="text-xs text-[var(--text-secondary)] mb-1">Categoría</p>
                            <p className="text-sm font-bold text-[var(--text-primary)] capitalize">{ticket.category}</p>
                        </div>
                        <div className="glass rounded-xl p-4 border border-[var(--border-ui)]">
                            <p className="text-xs text-[var(--text-secondary)] mb-1">Prioridad</p>
                            <p className={`text-sm font-bold ${PRIORITY_COLORS[ticket.priority] || ''} inline-block px-2 py-1 rounded-xl capitalize`}>
                                {ticket.priority}
                            </p>
                        </div>
                        <div className="glass rounded-xl p-4 border border-[var(--border-ui)]">
                            <p className="text-xs text-[var(--text-secondary)] mb-1">Asignado</p>
                            {ticket.assignee ? (
                                <div className="flex items-center gap-2">
                                    <div className="h-6 w-6 rounded-full bg-[var(--solar-gold)] flex items-center justify-center text-slate-900 text-xs font-bold">
                                        {ticket.assignee.name.charAt(0)}
                                    </div>
                                    <span className="text-sm text-[var(--text-primary)]">{ticket.assignee.name}</span>
                                </div>
                            ) : (
                                <p className="text-sm text-[var(--text-secondary)]">Sin asignar</p>
                            )}
                        </div>
                        <div className="glass rounded-xl p-4 border border-[var(--border-ui)]">
                            <p className="text-xs text-[var(--text-secondary)] mb-1">Creado por</p>
                            <p className="text-sm font-bold text-[var(--text-primary)]">{ticket.creator?.name}</p>
                        </div>
                    </div>

                    {!ticket.assignee && canManage && (
                        <div className="flex gap-2 mb-8 p-4 rounded-xl border border-amber-500/30 bg-amber-500/5">
                            <input
                                type="text"
                                value={assignId}
                                onChange={(e) => setAssignId(e.target.value)}
                                placeholder="ID del técnico a asignar"
                                className="flex-1 rounded-xl border-[var(--border-ui)] bg-slate-500/5 text-[var(--text-primary)] px-4 py-2 text-sm"
                            />
                            <PrimaryButton onClick={handleAssign} className="text-sm">
                                <User className="h-4 w-4" /> Asignar
                            </PrimaryButton>
                        </div>
                    )}

                    {ticket.description && (
                        <div className="mb-8">
                            <h3 className="text-sm font-bold text-[var(--text-primary)] mb-2">Descripción</h3>
                            <p className="text-sm text-[var(--text-secondary)]">{ticket.description}</p>
                        </div>
                    )}

                    {ticket.resolution_notes && (
                        <div className="mb-8">
                            <h3 className="text-sm font-bold text-[var(--text-primary)] mb-2">Notas de resolución</h3>
                            <p className="text-sm text-[var(--text-secondary)]">{ticket.resolution_notes}</p>
                        </div>
                    )}

                    {ticket.project && (
                        <div className="mb-8">
                            <h3 className="text-sm font-bold text-[var(--text-primary)] mb-2">Proyecto asociado</h3>
                            <Link href={route('projects.show', ticket.project.id)} className="text-sm text-[var(--solar-gold)] hover:brightness-125">
                                {ticket.project.code} - {ticket.project.name}
                            </Link>
                        </div>
                    )}

                    <div className="border-t border-[var(--border-ui)] pt-6">
                        <h3 className="text-sm font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                            <MessageSquare className="h-4 w-4" /> Comentarios ({ticket.comments?.length || 0})
                        </h3>

                        <div className="space-y-4 mb-6">
                            {ticket.comments?.map((c: any) => (
                                <div key={c.id} className="flex gap-3">
                                    <div className="h-8 w-8 rounded-full bg-[var(--solar-gold)] flex items-center justify-center text-slate-900 text-xs font-bold shrink-0">
                                        {c.user?.name?.charAt(0) || '?'}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-sm font-bold text-[var(--text-primary)]">{c.user?.name}</span>
                                            <span className="text-xs text-[var(--text-secondary)]">
                                                {new Date(c.created_at).toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <p className="text-sm text-[var(--text-secondary)]">{c.comment}</p>
                                    </div>
                                </div>
                            ))}
                            {(!ticket.comments || ticket.comments.length === 0) && (
                                <p className="text-sm text-[var(--text-secondary)]">Sin comentarios.</p>
                            )}
                        </div>

                        {ticket.status !== 'cerrado' && (
                            <form onSubmit={handleAddComment} className="flex gap-3">
                                <input
                                    type="text"
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="Escribe un comentario..."
                                    className="flex-1 rounded-xl border-[var(--border-ui)] bg-slate-500/5 text-[var(--text-primary)] px-4 py-3"
                                />
                                <PrimaryButton disabled={!newComment.trim()}>
                                    <Send className="h-4 w-4" />
                                </PrimaryButton>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
