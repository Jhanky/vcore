import { useState, useRef } from 'react';
import { router, Link, Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { showToast } from '@/Components/Toast';
import {
    Ticket, User, ArrowLeft, MessageSquare, CheckCircle2,
    Clock, XCircle, AlertCircle, Send, Paperclip, FileText,
    Image, Video, Download, Upload
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

const mimeIcon = (mimeType: string | null) => {
    if (!mimeType) return <FileText className="h-5 w-5 text-blue-400" />;
    if (mimeType.startsWith('image/')) return <Image className="h-5 w-5 text-emerald-400" />;
    if (mimeType.startsWith('video/')) return <Video className="h-5 w-5 text-purple-400" />;
    return <FileText className="h-5 w-5 text-blue-400" />;
};

const formatSize = (bytes: number | null) => {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

function AttachmentThumb({ att }: { att: any }) {
    const [viewerOpen, setViewerOpen] = useState(false);

    if (att.mime_type?.startsWith('image/')) {
        return (
            <>
                <button
                    type="button"
                    onClick={() => setViewerOpen(true)}
                    className="group relative block h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-[var(--border-ui)] hover:border-[var(--solar-gold)]/50 transition-colors"
                >
                    <img
                        src={att.url}
                        alt={att.original_filename}
                        className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Image className="h-4 w-4 text-white" />
                    </div>
                </button>
                {viewerOpen && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
                        onClick={() => setViewerOpen(false)}
                    >
                        <img
                            src={att.url}
                            alt={att.original_filename}
                            className="max-h-[90vh] max-w-[90vw] rounded-2xl object-contain"
                        />
                        <button
                            type="button"
                            onClick={() => setViewerOpen(false)}
                            className="absolute top-4 right-4 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 transition-colors"
                        >
                            <XCircle className="h-6 w-6" />
                        </button>
                    </div>
                )}
            </>
        );
    }

    if (att.mime_type?.startsWith('video/')) {
        return (
            <div className="shrink-0">
                <video
                    src={att.url}
                    controls
                    preload="metadata"
                    className="h-32 w-56 rounded-xl border border-[var(--border-ui)] object-cover"
                >
                    <a
                        href={att.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-[var(--solar-gold)]"
                    >
                        Ver video
                    </a>
                </video>
                <a
                    href={route('tickets.attachments.download', att.id)}
                    className="mt-1 flex items-center gap-1 text-xs text-[var(--text-secondary)] hover:text-[var(--solar-gold)] transition-colors"
                >
                    <Download className="h-3 w-3" /> Descargar
                </a>
            </div>
        );
    }

    if (att.mime_type === 'application/pdf') {
        return (
            <a
                href={att.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-20 w-20 shrink-0 flex-col items-center justify-center gap-1 rounded-xl border border-[var(--border-ui)] bg-red-500/5 hover:bg-red-500/10 transition-colors"
            >
                <FileText className="h-6 w-6 text-red-400" />
                <span className="text-[10px] text-[var(--text-secondary)]">PDF</span>
            </a>
        );
    }

    return (
        <a
            href={route('tickets.attachments.download', att.id)}
            className="flex h-20 w-20 shrink-0 flex-col items-center justify-center gap-1 rounded-xl border border-[var(--border-ui)] bg-slate-500/5 hover:bg-[var(--solar-gold)]/10 transition-colors"
        >
            {mimeIcon(att.mime_type)}
            <span className="text-[10px] text-[var(--text-secondary)] truncate px-1 max-w-full">
                {att.original_filename?.split('.').pop()?.toUpperCase()}
            </span>
        </a>
    );
}

export default function TicketShow({ ticket, canManage }: Props) {
    const [newComment, setNewComment] = useState('');
    const [commentFiles, setCommentFiles] = useState<File[]>([]);
    const [assignId, setAssignId] = useState('');
    const commentFileRef = useRef<HTMLInputElement>(null);

    const handleAddComment = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        const formData = new FormData();
        formData.append('comment', newComment);
        commentFiles.forEach((f) => formData.append('files[]', f));

        router.post(route('tickets.comments', ticket.id), formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            onSuccess: () => {
                setNewComment('');
                setCommentFiles([]);
                showToast('Comentario agregado.', 'success');
            },
        });
    };

    const handleCommentFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        setCommentFiles((prev) => [...prev, ...files]);
        if (commentFileRef.current) commentFileRef.current.value = '';
    };

    const removeCommentFile = (index: number) => {
        setCommentFiles((prev) => prev.filter((_, i) => i !== index));
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

                    {ticket.attachments?.length > 0 && (
                        <div className="mb-8">
                            <h3 className="text-sm font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                                <Paperclip className="h-4 w-4" /> Adjuntos ({ticket.attachments.length})
                            </h3>
                            <div className="flex flex-wrap gap-3">
                                {ticket.attachments.map((att: any) => (
                                    <AttachmentThumb key={att.id} att={att} />
                                ))}
                            </div>
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
                                        <p className="text-sm text-[var(--text-secondary)] whitespace-pre-wrap">{c.comment}</p>
                                        {c.attachments?.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {c.attachments.map((att: any) => (
                                                    <AttachmentThumb key={att.id} att={att} />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {(!ticket.comments || ticket.comments.length === 0) && (
                                <p className="text-sm text-[var(--text-secondary)]">Sin comentarios.</p>
                            )}
                        </div>

                        {ticket.status !== 'cerrado' && (
                            <form onSubmit={handleAddComment} className="space-y-3">
                                <div className="flex gap-3">
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
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => commentFileRef.current?.click()}
                                        className="flex items-center gap-2 rounded-xl border border-[var(--border-ui)] bg-slate-500/5 px-3 py-2 text-xs text-[var(--text-secondary)] hover:text-[var(--solar-gold)] hover:border-[var(--solar-gold)]/50 transition-colors"
                                    >
                                        <Upload className="h-3.5 w-3.5" />
                                        Adjuntar evidencias
                                    </button>
                                    <input
                                        ref={commentFileRef}
                                        type="file"
                                        multiple
                                        accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx"
                                        onChange={handleCommentFileSelect}
                                        className="hidden"
                                    />

                                    {commentFiles.length > 0 && (
                                        <span className="text-xs text-[var(--text-secondary)]">
                                            {commentFiles.length} archivo(s) seleccionado(s)
                                        </span>
                                    )}
                                </div>

                                {commentFiles.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {commentFiles.map((file, i) => (
                                            <div
                                                key={i}
                                                className="flex items-center gap-2 rounded-xl border border-[var(--border-ui)] bg-slate-500/5 px-3 py-1.5"
                                            >
                                                {mimeIcon(file.type)}
                                                <span className="text-xs text-[var(--text-primary)] truncate max-w-[120px]">
                                                    {file.name}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => removeCommentFile(i)}
                                                    className="text-[var(--text-secondary)] hover:text-red-400 transition-colors"
                                                >
                                                    <XCircle className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
