import { Clock, MessageSquare, ArrowRight, Paperclip } from 'lucide-react';
import { formatDateTime } from '@/utils/format';
import type { StateHistory, Note } from '@/features/projects/types';

interface ProjectHistoryTabProps {
    history: StateHistory[];
    notes: Note[];
}

export default function ProjectHistoryTab({ history, notes }: ProjectHistoryTabProps) {
    const formatDuration = (days?: number) => {
        if (!days) return '';
        if (days === 1) return '1 día';
        return `${days} días`;
    };

    const allItems: any[] = [
        ...history.map(h => ({ ...h, type: 'state_change', date: h.started_at })),
        ...notes.map(n => ({ ...n, type: 'note', date: n.created_at })),
    ].sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
        <div className="glass rounded-[2rem] p-8">
            <h3 className="text-lg font-bold font-outfit text-[var(--text-primary)] mb-6">Historial del Proyecto</h3>

            {allItems.length === 0 ? (
                <p className="text-sm text-[var(--text-secondary)] text-center py-8">
                    No hay historial registrado
                </p>
            ) : (
                <div className="relative">
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-[var(--border-ui)]" />

                    <div className="space-y-6">
                        {allItems.map((item, index) => (
                            <div key={item.type === 'state_change' ? `state-${item.id}` : `note-${item.id}`} className="relative pl-10">
                                <div
                                    className={`absolute left-2 w-4 h-4 rounded-full border-2 border-[var(--bg-content)] ${
                                        item.type === 'state_change'
                                            ? item.to_state?.color ? 'ring-2 ring-offset-1' : 'bg-[var(--text-secondary)]'
                                            : 'bg-[var(--text-secondary)]'
                                    }`}
                                    style={
                                        item.type === 'state_change' && item.to_state?.color
                                            ? { backgroundColor: item.to_state.color, ringColor: item.to_state.color + '40' } as React.CSSProperties
                                            : {}
                                    }
                                />

                                {item.type === 'state_change' ? (
                                    <div className="bg-slate-500/5 rounded-2xl border border-[var(--border-ui)]/50 p-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Clock className="w-4 h-4 text-[var(--text-secondary)]" />
                                            <span className="text-sm font-bold text-[var(--text-primary)]">
                                                Cambio de Estado
                                            </span>
                                            <span className="text-xs text-[var(--text-secondary)]">
                                                {formatDateTime(item.started_at || item.date)}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2 text-sm mb-2">
                                            {item.from_state && (
                                                <>
                                                    <span
                                                        className="px-2 py-0.5 rounded-full text-xs font-bold border"
                                                        style={{
                                                            backgroundColor: item.from_state.color + '15',
                                                            color: item.from_state.color,
                                                            borderColor: item.from_state.color + '40',
                                                        }}
                                                    >
                                                        {item.from_state.name}
                                                    </span>
                                                    <ArrowRight className="w-4 h-4 text-[var(--text-secondary)]" />
                                                </>
                                            )}
                                            <span
                                                className="px-2 py-0.5 rounded-full text-xs font-bold border"
                                                style={{
                                                    backgroundColor: (item.to_state?.color || 'var(--text-secondary)') + '15',
                                                    color: item.to_state?.color || 'var(--text-secondary)',
                                                    borderColor: (item.to_state?.color || 'var(--text-secondary)') + '40',
                                                }}
                                            >
                                                {item.to_state?.name || 'Estado desconocido'}
                                            </span>
                                        </div>

                                        {item.reason && (
                                            <p className="text-sm text-[var(--text-secondary)] mb-1">
                                                <strong className="text-[var(--text-primary)]">Razón:</strong> {item.reason}
                                            </p>
                                        )}

                                        {item.notes && (
                                            <p className="text-sm text-[var(--text-secondary)] mb-1">
                                                <strong className="text-[var(--text-primary)]">Notas:</strong> {item.notes}
                                            </p>
                                        )}

                                        {item.file_path && (
                                            <a
                                                href={route('projects.history.download', [item.project_id, item.id])}
                                                className="inline-flex items-center gap-1 text-sm text-[var(--solar-gold)] hover:underline mt-2"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <Paperclip className="w-4 h-4" />
                                                {item.original_filename || 'Ver evidencia'}
                                            </a>
                                        )}

                                        <div className="flex items-center gap-4 text-xs text-[var(--text-secondary)] mt-2">
                                            {item.changed_by && (
                                                <span>Por: {item.changed_by.name}</span>
                                            )}
                                            {item.duration_days > 0 && (
                                                <span>Duración: {formatDuration(item.duration_days)}</span>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-[var(--solar-gold)]/10 rounded-2xl border border-[var(--solar-gold)]/20 p-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <MessageSquare className="w-4 h-4 text-[var(--solar-gold)]" />
                                            <span className="text-sm font-bold text-[var(--text-primary)]">
                                                Nota
                                            </span>
                                            <span className="text-xs text-[var(--text-secondary)]">
                                                {formatDateTime(item.created_at || item.date)}
                                            </span>
                                        </div>

                                        <p className="text-sm text-[var(--text-secondary)]">{item.content}</p>

                                        {item.file_path && (
                                            <a
                                                href={route('projects.notes.download', [item.project_id, item.id])}
                                                className="inline-flex items-center gap-1 text-sm text-[var(--solar-gold)] hover:underline mt-2"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <Paperclip className="w-4 h-4" />
                                                {item.original_filename || 'Ver evidencia'}
                                            </a>
                                        )}

                                        {item.created_by && (
                                            <p className="text-xs text-[var(--text-secondary)] mt-2">
                                                Por: {item.created_by.name}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
