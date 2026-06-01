import { Link, Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { History, ArrowDown, ArrowUp, Repeat, User, ArrowLeft } from 'lucide-react';

interface Movement {
    id: number;
    type: string;
    quantity: number;
    previous_quantity: number;
    new_quantity: number;
    notes: string | null;
    created_at: string;
    user: { id: number; name: string };
}

interface PaginatedData {
    data: Movement[];
    current_page: number;
    last_page: number;
    from: number;
    to: number;
    total: number;
    links: any[];
}

interface Props {
    item: any;
    movements: PaginatedData;
    canManage: boolean;
}

const movementTypeConfig: Record<string, { icon: any; color: string; label: string }> = {
    in: { icon: ArrowDown, color: 'text-emerald-400', label: 'Ingreso' },
    out: { icon: ArrowUp, color: 'text-red-400', label: 'Salida' },
    adjustment: { icon: Repeat, color: 'text-orange-400', label: 'Ajuste' },
    transfer: { icon: Repeat, color: 'text-blue-400', label: 'Transferencia' },
};

export default function InventoryMovements({ item, movements, canManage }: Props) {
    return (
        <AuthenticatedLayout header={`Movimientos - ${item.name}`}>
            <Head title={`Movimientos - ${item.name}`} />
            <div className="max-w-4xl mx-auto space-y-6">
                <Link href={route('inventory.show', item.id)} className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--solar-gold)] transition-colors">
                    <ArrowLeft className="h-4 w-4" /> Volver al detalle
                </Link>

                <div className="glass rounded-[2rem] p-8 border border-[var(--border-ui)]/30">
                    <div className="flex items-center gap-3 mb-6">
                        <History className="h-5 w-5 text-[var(--text-secondary)]" />
                        <h2 className="text-lg font-bold font-outfit text-[var(--text-primary)]">
                            Historial de movimientos · {item.name}
                        </h2>
                        <span className="text-sm text-[var(--text-secondary)]">({movements.total} registros)</span>
                    </div>

                    <div className="space-y-3">
                        {movements.data.map((mov: Movement) => {
                            const config = movementTypeConfig[mov.type] || movementTypeConfig.adjustment;
                            const Icon = config.icon;
                            return (
                                <div key={mov.id} className="glass rounded-xl p-4 border border-[var(--border-ui)] flex items-start gap-4">
                                    <div className={`p-2 rounded-lg bg-slate-500/10 ${config.color}`}>
                                        <Icon className="h-4 w-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-medium text-[var(--text-primary)]">{config.label}</p>
                                            <span className="text-xs text-[var(--text-secondary)]">
                                                {new Date(mov.created_at).toLocaleString('es-CO')}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4 mt-1 text-xs text-[var(--text-secondary)]">
                                            <span>Cantidad: <strong className="text-[var(--text-primary)]">{mov.quantity}</strong></span>
                                            {mov.previous_quantity !== mov.new_quantity && (
                                                <>
                                                    <span>Anterior: {mov.previous_quantity}</span>
                                                    <span>Nuevo: {mov.new_quantity}</span>
                                                </>
                                            )}
                                            {mov.user && (
                                                <span className="flex items-center gap-1">
                                                    <User className="h-3 w-3" /> {mov.user.name}
                                                </span>
                                            )}
                                        </div>
                                        {mov.notes && (
                                            <p className="text-xs text-[var(--text-secondary)] mt-1 italic">{mov.notes}</p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                        {movements.data.length === 0 && (
                            <p className="text-sm text-[var(--text-secondary)] text-center py-8">Sin movimientos registrados.</p>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
