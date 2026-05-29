import { usePage } from '@inertiajs/react';
import { Head } from '@inertiajs/react';
import {
    BarChart, Bar, Line, PieChart, Pie, Cell, ComposedChart,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import {
    Sun, Users, Calculator, TrendingUp, FileText,
    DollarSign, Briefcase, Building2, MapPin,
    Wrench, Clock, Ticket, Package,
} from 'lucide-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

const IconMap: Record<string, any> = {
    Sun, Users, Calculator, TrendingUp, FileText,
    DollarSign, Briefcase, Building2, MapPin,
    Wrench, Clock, Ticket, Package,
};

const PIPELINE_COLORS: Record<string, string> = {
    Borrador: '#6B7280',
    Enviada: '#F59E0B',
    Aprobada: '#10B981',
    Rechazada: '#EF4444',
};

const PIE_COLORS = ['#10B981', '#F59E0B', '#3B82F6', '#8B5CF6', '#EC4899', '#14B8A6'];

const formatCurrency = (value: number) => {
    if (!value && value !== 0) return '$0';
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value);
};

const ChartTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="glass px-4 py-3 rounded-xl border border-[var(--border-ui)] shadow-lg">
            <p className="text-sm font-bold text-[var(--text-primary)] mb-1">{label}</p>
            {payload.map((entry: any, idx: number) => (
                <p key={idx} className="text-xs" style={{ color: entry.color }}>
                    {entry.name}: {entry.name === 'Valor' || entry.dataKey === 'value' ? formatCurrency(entry.value) : entry.value}
                </p>
            ))}
        </div>
    );
};

interface DashboardProps {
    stats: any[];
    recentActivity: any[];
    pipeline?: { name: string; count: number }[];
    monthlyTrend?: { month: string; count: number; value: number }[];
    clientsByType?: { type: string; count: number }[];
    clientsByCity?: { city: string; count: number }[];
    upcomingMaintenances?: any[];
    openTickets?: any[];
}

export default function Dashboard({ stats, recentActivity, pipeline, monthlyTrend, clientsByType, clientsByCity, upcomingMaintenances, openTickets }: DashboardProps) {
    const { auth } = usePage().props as any;
    const user = auth?.user;
    const isComercial = user?.roles?.includes('comercial') && !user?.roles?.includes('admin') && !user?.roles?.includes('gerente');
    const isTecnico = user?.roles?.includes('tecnico') && !user?.roles?.includes('admin') && !user?.roles?.includes('gerente');

    return (
        <AuthenticatedLayout header="Panel de Control">
            <Head title="Dashboard" />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                {stats.map((stat: any, i: number) => {
                    const Icon = IconMap[stat.icon] || Sun;
                    const displayValue = stat.label === 'Valor Cotizado' ? formatCurrency(stat.value) : stat.value;
                    return (
                        <div key={i} className="glass p-5 rounded-[2rem] border border-[var(--border-ui)]/50 hover:border-[var(--solar-gold)]/30 transition-all">
                            <div className="flex items-center justify-between mb-3">
                                <div className={`p-2.5 rounded-xl bg-slate-500/10 ${stat.color}`}>
                                    <Icon className="h-5 w-5" />
                                </div>
                            </div>
                            <p className="text-2xl font-bold font-outfit text-[var(--text-primary)]">{displayValue}</p>
                            <p className="text-xs text-[var(--text-secondary)] mt-1">{stat.label}</p>
                        </div>
                    );
                })}
            </div>

            {isTecnico && upcomingMaintenances && openTickets ? (
                <>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        <div className="glass rounded-[2rem] p-6 border border-[var(--border-ui)]/50">
                            <h3 className="text-lg font-bold font-outfit text-[var(--text-primary)] mb-6 flex items-center gap-2">
                                <Wrench className="h-5 w-5 text-[var(--solar-gold)]" />
                                Mantenimientos Programados (7 días)
                            </h3>
                            <div className="space-y-3">
                                {upcomingMaintenances.length > 0 ? upcomingMaintenances.map((m: any) => (
                                    <div key={m.id} className="flex items-center justify-between p-3 rounded-xl border border-[var(--border-ui)] bg-slate-500/5">
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-bold text-[var(--text-primary)] truncate">{m.code} - {m.title}</p>
                                            <p className="text-xs text-[var(--text-secondary)]">
                                                {m.project && <span>{m.project} · </span>}
                                                {new Date(m.scheduled_date).toLocaleDateString('es-CO')}
                                            </p>
                                        </div>
                                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                                            m.priority === 'critica' ? 'bg-red-500/20 text-red-400' :
                                            m.priority === 'alta' ? 'bg-orange-500/20 text-orange-400' :
                                            m.priority === 'media' ? 'bg-yellow-500/20 text-yellow-400' :
                                            'bg-green-500/20 text-green-400'
                                        }`}>
                                            {m.priority}
                                        </span>
                                    </div>
                                )) : (
                                    <p className="text-center text-sm text-[var(--text-secondary)] py-8">
                                        No hay mantenimientos programados para los próximos 7 días.
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="glass rounded-[2rem] p-6 border border-[var(--border-ui)]/50">
                            <h3 className="text-lg font-bold font-outfit text-[var(--text-primary)] mb-6 flex items-center gap-2">
                                <Ticket className="h-5 w-5 text-[var(--solar-gold)]" />
                                Tickets Abiertos
                            </h3>
                            <div className="space-y-3">
                                {openTickets.length > 0 ? openTickets.map((t: any) => (
                                    <div key={t.id} className="flex items-center justify-between p-3 rounded-xl border border-[var(--border-ui)] bg-slate-500/5">
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-bold text-[var(--text-primary)] truncate">{t.code} - {t.title}</p>
                                            <p className="text-xs text-[var(--text-secondary)]">
                                                {t.project && <span>{t.project} · </span>}
                                                {t.category}
                                            </p>
                                        </div>
                                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                                            t.priority === 'critica' ? 'bg-red-500/20 text-red-400' :
                                            t.priority === 'alta' ? 'bg-orange-500/20 text-orange-400' :
                                            t.priority === 'media' ? 'bg-yellow-500/20 text-yellow-400' :
                                            'bg-green-500/20 text-green-400'
                                        }`}>
                                            {t.priority}
                                        </span>
                                    </div>
                                )) : (
                                    <p className="text-center text-sm text-[var(--text-secondary)] py-8">
                                        No hay tickets abiertos asignados.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            ) : isComercial && pipeline && monthlyTrend && clientsByType && clientsByCity ? (
                <>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        <div className="glass rounded-[2rem] p-6 border border-[var(--border-ui)]/50">
                            <h3 className="text-lg font-bold font-outfit text-[var(--text-primary)] mb-6">Tendencia Mensual</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <ComposedChart data={monthlyTrend}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-ui)" opacity={0.3} />
                                    <XAxis dataKey="month" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                                    <YAxis yAxisId="left" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                                    <YAxis yAxisId="right" orientation="right" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                                    <Tooltip content={<ChartTooltip />} />
                                    <Legend />
                                    <Bar yAxisId="left" dataKey="count" name="Cotizaciones" fill="#10B981" radius={[4, 4, 0, 0]} />
                                    <Line yAxisId="right" dataKey="value" name="Valor" stroke="#F59E0B" strokeWidth={2} dot={{ fill: '#F59E0B' }} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="glass rounded-[2rem] p-6 border border-[var(--border-ui)]/50">
                            <h3 className="text-lg font-bold font-outfit text-[var(--text-primary)] mb-6">Clientes por Tipo</h3>
                            {clientsByType.length > 0 ? (
                                <div className="flex flex-col md:flex-row items-center gap-6">
                                    <ResponsiveContainer width="100%" height={250}>
                                        <PieChart>
                                            <Pie data={clientsByType} dataKey="count" nameKey="type" cx="50%" cy="50%" outerRadius={100} innerRadius={60} paddingAngle={2}>
                                                {clientsByType.map((_: any, idx: number) => (
                                                    <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="space-y-2 w-full md:w-auto">
                                        {clientsByType.map((item: any, idx: number) => (
                                            <div key={idx} className="flex items-center gap-2 text-sm">
                                                <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }} />
                                                <span className="text-[var(--text-secondary)]">{item.type}</span>
                                                <span className="font-bold text-[var(--text-primary)]">{item.count}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <p className="text-center text-sm text-[var(--text-secondary)] py-10">Sin datos de clientes por tipo</p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        <div className="glass rounded-[2rem] p-6 border border-[var(--border-ui)]/50">
                            <h3 className="text-lg font-bold font-outfit text-[var(--text-primary)] mb-6">Embudo de Ventas</h3>
                            {pipeline.some((p: any) => p.count > 0) ? (
                                <ResponsiveContainer width="100%" height={280}>
                                    <BarChart data={pipeline} layout="vertical">
                                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-ui)" opacity={0.3} />
                                        <XAxis type="number" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                                        <YAxis dataKey="name" type="category" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                                        <Tooltip />
                                        <Bar dataKey="count" name="Cotizaciones" radius={[0, 4, 4, 0]}>
                                            {pipeline.map((entry: any, idx: number) => (
                                                <Cell key={idx} fill={PIPELINE_COLORS[entry.name] || '#6B7280'} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <p className="text-center text-sm text-[var(--text-secondary)] py-10">Sin cotizaciones registradas</p>
                            )}
                        </div>

                        <div className="glass rounded-[2rem] p-6 border border-[var(--border-ui)]/50">
                            <h3 className="text-lg font-bold font-outfit text-[var(--text-primary)] mb-6">Actividades Recientes</h3>
                            <div className="space-y-4">
                                {recentActivity.map((item: any) => (
                                    <div key={item.id} className="flex gap-3 items-start">
                                        <div className="h-9 w-9 rounded-full bg-[var(--solar-gold)]/10 flex items-center justify-center shrink-0">
                                            <FileText className="h-4 w-4 text-[var(--solar-gold)]" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-bold text-[var(--text-primary)] truncate">{item.title}</p>
                                            <p className="text-xs text-[var(--text-secondary)] truncate">{item.description}</p>
                                            <p className="text-[10px] text-[var(--text-secondary)]/60 mt-0.5">{item.time}</p>
                                        </div>
                                    </div>
                                ))}
                                {recentActivity.length === 0 && (
                                    <p className="text-center text-sm text-[var(--text-secondary)] py-8">No hay actividad reciente.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 mb-8">
                        <div className="glass rounded-[2rem] p-6 border border-[var(--border-ui)]/50">
                            <h3 className="text-lg font-bold font-outfit text-[var(--text-primary)] mb-6">Clientes por Ciudad</h3>
                            {clientsByCity.length > 0 ? (
                                <ResponsiveContainer width="100%" height={Math.max(200, clientsByCity.length * 40)}>
                                    <BarChart data={clientsByCity} layout="vertical">
                                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-ui)" opacity={0.3} />
                                        <XAxis type="number" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                                        <YAxis dataKey="city" type="category" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                                        <Tooltip />
                                        <Bar dataKey="count" name="Clientes" fill="#3B82F6" radius={[0, 4, 4, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <p className="text-center text-sm text-[var(--text-secondary)] py-10">Sin datos de ciudades</p>
                            )}
                        </div>
                    </div>
                </>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 glass p-8 rounded-[2rem] min-h-[400px] border border-[var(--border-ui)]/50">
                        <h3 className="text-xl font-bold font-outfit text-[var(--text-primary)] mb-4">Rendimiento y Seguimiento</h3>
                        <div className="flex items-center justify-center h-64 border-2 border-dashed border-[var(--border-ui)] rounded-2xl">
                            <p className="text-[var(--text-secondary)] font-medium italic">Gráfico de monitoreo y ventas (Próximamente)</p>
                        </div>
                    </div>

                    <div className="glass p-8 rounded-[2rem] border border-[var(--border-ui)]/50">
                        <h3 className="text-xl font-bold font-outfit text-[var(--text-primary)] mb-4">Actividades Recientes</h3>
                        <div className="space-y-6">
                            {recentActivity.map((item: any) => (
                                <div key={item.id} className="flex gap-4">
                                    <div className="h-10 w-10 rounded-full bg-slate-500/10 flex items-center justify-center shrink-0">
                                        <FileText className="h-5 w-5 text-[var(--solar-gold)]" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-[var(--text-primary)]">{item.title}</p>
                                        <p className="text-xs text-[var(--text-secondary)]">{item.description}</p>
                                        <p className="text-[10px] text-[var(--text-secondary)]/60 mt-0.5">{item.time}</p>
                                    </div>
                                </div>
                            ))}
                            {recentActivity.length === 0 && (
                                <p className="text-center text-sm text-[var(--text-secondary)] py-10">No hay actividad reciente.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}