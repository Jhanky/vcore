export function formatDate(dateString?: string | null, locale = 'es-CO'): string {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString(locale);
}

export function formatDateTime(dateString?: string | null, locale = 'es-CO'): string {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString(locale, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export function formatCurrency(value?: number | null, currency = 'COP'): string {
    if (!value) return '-';
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency }).format(value);
}

export function formatCurrencySimple(value: number, currency = 'COP'): string {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency, minimumFractionDigits: 0 }).format(value || 0);
}

export function getStatusColor(status: string): string {
    const colors: Record<string, string> = {
        completed: 'bg-emerald-500',
        in_progress: 'bg-blue-500',
        delayed: 'bg-amber-500',
        cancelled: 'bg-red-500',
        pending: 'bg-slate-500',
        approved: 'bg-emerald-500',
        in_review: 'bg-amber-500',
        rejected: 'bg-red-500',
    };
    return colors[status] || 'bg-slate-500';
}

export function getPriorityColor(priority?: string | null): string {
    const colors: Record<string, string> = {
        alta: 'bg-red-500/10 text-red-400 border-red-500/20',
        media: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        baja: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    };
    return colors[priority || 'media'] || 'bg-slate-500/10 text-[var(--text-secondary)] border-slate-500/20';
}

export function getUpmeStatusColor(status: string): string {
    const colors: Record<string, string> = {
        pending: 'bg-slate-500/10 text-[var(--text-secondary)] border-slate-500/20',
        in_review: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        approved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        rejected: 'bg-red-500/10 text-red-400 border-red-500/20',
    };
    return colors[status] || 'bg-slate-500/10 text-[var(--text-secondary)] border-slate-500/20';
}
