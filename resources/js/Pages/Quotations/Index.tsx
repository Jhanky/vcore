import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import {
    Plus, FileText, Eye, Trash2,
    CheckCircle, DollarSign, Zap
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { useState, useCallback } from 'react';
import { DataTable, Column } from '@/Components/DataTable';
import ConfirmModal from '@/Components/ConfirmModal';
import { showToast } from '@/Components/Toast';
import { formatCurrencySimple } from '@/utils/format';

const STATUS_COLORS: Record<string, string> = {
    'Borrador'  : 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    'Enviada'   : 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    'Aprobada'  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    'Rechazada' : 'bg-red-500/10 text-red-400 border-red-500/20',
    'Vencida'   : 'bg-amber-500/10 text-amber-400 border-amber-500/20',
};

function formatCOP(value: number) {
    if (!value) return '$0';
    return formatCurrencySimple(value);
}

export default function Index({ quotations, statistics, filters }: any) {
    const [search, setSearch] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');

    const [confirmDelete, setConfirmDelete] = useState<{
        show: boolean;
        id: number | null;
        code: string;
    }>({
        show: false,
        id: null,
        code: ''
    });
    const [deleting, setDeleting] = useState(false);

    const handleFilter = useCallback((s?: string, st?: string) => {
        router.get(route('quotations.index'), {
            search: s ?? search,
            status: st ?? statusFilter,
            per_page: quotations.per_page,
        }, { preserveState: true, replace: true });
    }, [search, statusFilter, quotations.per_page]);

    const handlePerPageChange = useCallback((perPage: number) => {
        router.get(route('quotations.index'), {
            search,
            status: statusFilter,
            per_page: perPage,
        }, { preserveState: true });
    }, [search, statusFilter]);

    const handleDelete = (id: number, code: string) => {
        setConfirmDelete({ show: true, id, code });
    };

    const onConfirmDelete = () => {
        if (confirmDelete.id) {
            setDeleting(true);
            router.delete(route('quotations.destroy', confirmDelete.id), {
                preserveScroll: true,
                onSuccess: () => {
                    setConfirmDelete({ show: false, id: null, code: '' });
                    setDeleting(false);
                    showToast('Cotización eliminada.', 'success');
                },
                onError: () => {
                    setDeleting(false);
                },
            });
        }
    };

    const columns: Column<any>[] = [
        {
            key: 'code',
            label: 'Código',
            render: (q) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--solar-gold)]/20 to-[var(--solar-gold)]/5 border border-[var(--solar-gold)]/20 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-[var(--solar-gold)]" />
                    </div>
                    <div>
                        <div className="font-bold text-[var(--text-primary)] font-outfit">{q.code}</div>
                        <div className="text-xs text-[var(--text-secondary)]">
                            {q.issue_date ? new Date(q.issue_date + 'T00:00:00').toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }) : '–'}
                        </div>
                    </div>
                </div>
            ),
        },
        {
            key: 'client',
            label: 'Cliente',
            render: (q) => (
                <div>
                    <div className="font-semibold text-[var(--text-primary)]">{q.client?.name ?? '–'}</div>
                    <div className="text-xs text-[var(--text-secondary)]">{q.client?.email}</div>
                </div>
            ),
        },
        {
            key: 'project_name',
            label: 'Proyecto',
        },
        {
            key: 'power_kwp',
            label: 'kWp',
            render: (q) => (
                <span className="font-mono text-[var(--text-primary)]">{q.power_kwp} kWp</span>
            ),
            className: 'text-right',
        },
        {
            key: 'total_value',
            label: 'Total',
            render: (q) => (
                <span className="font-bold text-[var(--solar-gold)] font-outfit">{formatCOP(q.total_value)}</span>
            ),
            className: 'text-right',
        },
        {
            key: 'status',
            label: 'Estado',
            render: (q) => (
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${STATUS_COLORS[q.status] ?? STATUS_COLORS['Borrador']}`}>
                    {q.status}
                </span>
            ),
        },
    ];

    return (
        <AuthenticatedLayout header="Cotizaciones">
            <Head title="Cotizaciones" />

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
                {[
                    { label: 'Total Cotizaciones', value: statistics.total, icon: FileText, color: 'text-blue-400', bg: 'from-blue-500/20 to-blue-500/5', border: 'border-blue-500/20' },
                    { label: 'Aprobadas',           value: statistics.accepted, icon: CheckCircle, color: 'text-emerald-400', bg: 'from-emerald-500/20 to-emerald-500/5', border: 'border-emerald-500/20' },
                    { label: 'Valor Total',         value: formatCOP(statistics.total_value), icon: DollarSign, color: 'text-[var(--solar-gold)]', bg: 'from-[var(--solar-gold)]/20 to-[var(--solar-gold)]/5', border: 'border-[var(--solar-gold)]/20' },
                    { label: 'Potencia Total',      value: `${(Number(statistics.total_kwp) || 0).toFixed(1)} kWp`, icon: Zap, color: 'text-violet-400', bg: 'from-violet-500/20 to-violet-500/5', border: 'border-violet-500/20' },
                ].map(({ label, value, icon: Icon, color, bg, border }) => (
                    <div key={label} className={`glass rounded-2xl p-5 border ${border} flex items-center gap-4`}>
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${bg} border ${border} flex items-center justify-center flex-shrink-0`}>
                            <Icon className={`w-6 h-6 ${color}`} />
                        </div>
                        <div>
                            <p className="text-xs font-outfit text-[var(--text-secondary)] uppercase tracking-wider">{label}</p>
                            <p className={`text-xl font-bold font-outfit ${color}`}>{value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <DataTable
                data={quotations.data}
                columns={columns}
                searchPlaceholder="Buscar cotización o cliente..."
                emptyMessage="No hay cotizaciones"
                pagination={quotations}
                onSearch={(s) => setSearch(s)}
                onPerPageChange={handlePerPageChange}
                filters={[{
                    key: 'status',
                    label: 'Estado',
                    options: [
                        { value: 'Borrador', label: 'Borrador' },
                        { value: 'Enviada', label: 'Enviada' },
                        { value: 'Aprobada', label: 'Aprobada' },
                        { value: 'Rechazada', label: 'Rechazada' },
                        { value: 'Vencida', label: 'Vencida' },
                    ],
                }]}
                actions={(q) => (
                    <>
                        <Link
                            href={route('quotations.show', q.id)}
                            className="inline-flex p-2 rounded-xl hover:bg-[var(--solar-gold)]/10 text-[var(--text-secondary)] hover:text-[var(--solar-gold)] transition-all"
                            title="Ver / Editar"
                        >
                            <Eye className="h-4 w-4" />
                        </Link>
                        <button
                            onClick={() => handleDelete(q.id, q.code)}
                            className="inline-flex p-2 rounded-xl hover:bg-red-500/10 text-[var(--text-secondary)] hover:text-red-400 transition-all"
                            title="Eliminar"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </>
                )}
                headerAction={
                    <Link
                        href={route('quotations.create')}
                        className="flex items-center gap-2 bg-[var(--solar-gold)] text-slate-900 font-bold px-5 py-2.5 rounded-xl hover:brightness-110 transition-all shadow-lg"
                    >
                        <Plus className="h-4 w-4" />
                        <span>Nueva Cotización</span>
                    </Link>
                }
            />

            <ConfirmModal
                show={confirmDelete.show}
                onClose={() => setConfirmDelete({ ...confirmDelete, show: false })}
                onConfirm={onConfirmDelete}
                title="Eliminar Cotización"
                message={`¿Estás seguro de eliminar la cotización ${confirmDelete.code}? Esta acción no se puede deshacer.`}
                confirmLabel="Eliminar"
                variant="danger"
                processing={deleting}
            />
        </AuthenticatedLayout>
    );
}