import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine, Cell } from 'recharts';
import { AlertCircle, Box } from 'lucide-react';
import { useMemo } from 'react';
import { SOLAR, MONTH_NAMES } from '@/utils/solarConstants';
import { calcularAreaInstalacion } from '@/utils/solarAreaCalculator';

function round2(n: number) { return Math.round((n + Number.EPSILON) * 100) / 100; }

interface SystemAnalysisPanelProps {
    panelId: string;
    inverterId: string;
    panelQty: number;
    inverterQty: number;
    powerKwp: string;
    panels: any[];
    inverters: any[];
}

export default function SystemAnalysisPanel({
    panelId, inverterId, panelQty, inverterQty, powerKwp, panels, inverters
}: SystemAnalysisPanelProps) {
    const analysis = useMemo(() => {
        const p: any = panels.find((x: any) => String(x.id) === String(panelId));
        const i: any = inverters.find((x: any) => String(x.id) === String(inverterId));

        if (!p || !i) return null;

        const panelPower = parseFloat(p.power);
        const invPower = parseFloat(i.power);
        if (isNaN(panelPower) || isNaN(invPower)) return null;

        const totalPanelKw = (panelPower * panelQty) / 1000;
        const totalInvKw = invPower * inverterQty;
        if (totalInvKw === 0) return null;

        const ratio = totalPanelKw / totalInvKw;
        const targetKwp = parseFloat(String(powerKwp)) || 0;

        // Breakdown mensual con HSP fijo 4.5 (igual que SavingsEstimator)
        const monthlyProduction = MONTH_NAMES.map((name, idx) => ({
            name,
            hsp: SOLAR.HSP,
            kwh: Math.round(totalPanelKw * SOLAR.HSP * SOLAR.DAYS_PER_MONTH * SOLAR.PR)
        }));
        const annualProduction = monthlyProduction.reduce((sum, m) => sum + m.kwh, 0);
        const prodEst = totalPanelKw * SOLAR.HSP * SOLAR.DAYS_PER_MONTH * SOLAR.PR;

        // Cálculo de área de instalación con dimensiones reales del panel
        const areaCalc = calcularAreaInstalacion(panelQty, panelPower, 'portrait');

        const alerts: { type: 'error' | 'warning' | 'success'; message: string }[] = [];
        if (ratio > 1.5) {
            alerts.push({ type: 'error', message: `Exceso de paneles: Ratio DC/AC de ${ratio.toFixed(2)} puede saturar el inversor (máx recomendado: 1.3)` });
        } else if (ratio > 1.3) {
            alerts.push({ type: 'warning', message: `Ratio DC/AC de ${ratio.toFixed(2)} está en el límite superior (ideal: 1.1-1.3)` });
        }
        if (ratio < 0.8) {
            alerts.push({ type: 'warning', message: `Inversor subdimensionado: Ratio DC/AC de ${ratio.toFixed(2)} (mín recomendado: 0.9)` });
        }
        if (targetKwp > 0 && Math.abs(totalPanelKw - targetKwp) > targetKwp * 0.15) {
            if (totalPanelKw > targetKwp) {
                alerts.push({ type: 'warning', message: `Paneles instalados (${totalPanelKw.toFixed(2)} kWp) superan el objetivo (${targetKwp} kWp) por más del 15%` });
            } else {
                alerts.push({ type: 'warning', message: `Paneles instalados (${totalPanelKw.toFixed(2)} kWp) están por debajo del objetivo (${targetKwp} kWp)` });
            }
        }
        if (alerts.length === 0) {
            alerts.push({ type: 'success', message: 'Configuración óptima: El sistema está bien balanceado' });
        }

        return { ratio, totalPanelKw, prodEst, annualProduction, hsp: SOLAR.HSP, alerts, monthlyProduction, areaCalc };
    }, [panelId, inverterId, panelQty, inverterQty, powerKwp, panels, inverters]);

    if (!analysis) return null;

    const { ratio, totalPanelKw, prodEst, annualProduction, hsp: avgHsp, alerts, monthlyProduction, areaCalc } = analysis;
    const chartData = [{ name: 'Ratio', value: round2(ratio) }];
    let barColor = ratio > 1.3 ? '#ef4444' : ratio < 1.0 ? '#eab308' : '#22c55e';

    return (
        <div className="glass border border-[var(--solar-gold)]/20 rounded-2xl p-5 mt-4 space-y-4">
            <h3 className="font-bold text-[var(--text-primary)]">Análisis del Sistema</h3>

            <div className="space-y-2">
                {alerts.map((alert, idx) => (
                    <div key={idx} className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm ${
                        alert.type === 'error' ? 'bg-red-500/10 border border-red-500/30 text-red-400' :
                        alert.type === 'warning' ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400' :
                        'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                    }`}>
                        {alert.type === 'error' ? <AlertCircle className="w-4 h-4 shrink-0" /> :
                            alert.type === 'warning' ? <AlertCircle className="w-4 h-4 shrink-0" /> :
                            <span className="w-4 h-4 shrink-0">✓</span>}
                        <span>{alert.message}</span>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[var(--surface)] border border-[var(--border-ui)] rounded-xl p-4">
                    <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wider mb-2 font-semibold flex justify-between">
                        <span>DC/AC Ratio</span>
                        <span style={{ color: barColor }}>{ratio.toFixed(2)}</span>
                    </p>
                    <div className="h-16 w-full relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                                <XAxis type="number" domain={[0, 1.5]} ticks={[0.5, 1.0, 1.3, 1.5]} hide />
                                <YAxis dataKey="name" type="category" hide />
                                <Tooltip formatter={(v: any) => v} contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                                <ReferenceLine x={1.0} stroke="#64748b" strokeDasharray="3 3" />
                                <ReferenceLine x={1.3} stroke="#ef4444" strokeDasharray="3 3" />
                                <Bar dataKey="value" barSize={24} radius={[0, 4, 4, 0]}>
                                    <Cell fill={barColor} />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <p className="text-[10px] text-[var(--text-secondary)] mt-1 flex justify-between">
                        <span>Sub</span>
                        <span>Óptimo</span>
                        <span>Sobre</span>
                    </p>
                </div>

                <div className="bg-[var(--surface)] border border-[var(--border-ui)] rounded-xl p-4 flex flex-col justify-center">
                    <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wider mb-1 font-semibold">Producción Mensual</p>
                    <p className="text-2xl font-bold text-[var(--solar-gold)]">{Math.round(prodEst)} <span className="text-sm font-normal text-[var(--text-secondary)]">kWh/mes</span></p>
                    <p className="text-xs text-[var(--text-secondary)] mt-1">Promedio: {avgHsp.toFixed(1)} HSP</p>
                </div>

                <div className="bg-[var(--surface)] border border-[var(--border-ui)] rounded-xl p-4 flex flex-col justify-center">
                    <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wider mb-1 font-semibold">Producción Anual Est.</p>
                    <p className="text-2xl font-bold text-emerald-400">{Math.round(annualProduction)} <span className="text-sm font-normal text-[var(--text-secondary)]">kWh/año</span></p>
                    <p className="text-xs text-[var(--text-secondary)] mt-1">{totalPanelKw.toFixed(2)} kWp instalados</p>
                </div>

                <div className="bg-[var(--surface)] border border-[var(--border-ui)] rounded-xl p-4 flex flex-col justify-center">
                    <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wider mb-1 font-semibold">Área de Instalación</p>
                    <p className="text-2xl font-bold text-purple-400">{areaCalc.areaTotal} <span className="text-sm font-normal text-[var(--text-secondary)]">m²</span></p>
                    <p className="text-xs text-[var(--text-secondary)] mt-1">{areaCalc.filas} × {areaCalc.cols} · {areaCalc.largoTotal} × {areaCalc.anchoTotal} m · {areaCalc.factorOcupacion}% ocupación</p>
                </div>
            </div>

            <div className="bg-[var(--surface)] border border-[var(--border-ui)] rounded-xl p-4">
                <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wider mb-3 font-semibold">Producción Mensual Estimada (kWh)</p>
                <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height={192}>
                        <BarChart data={monthlyProduction} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                            <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={{ stroke: '#334155' }} />
                            <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={{ stroke: '#334155' }} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                                formatter={(value: any) => [`${value} kWh`]}
                            />
                            <Bar dataKey="kwh" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}