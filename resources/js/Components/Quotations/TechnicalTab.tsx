import { Zap, Sun, Cpu, Activity, TrendingUp, Box, Wallet } from 'lucide-react';

// Función para formatear valores en COP
function fmt(v: number) {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(v || 0);
}

interface TechnicalTabProps {
    localData: any;
    overdimensioning: any;
    specs: any;
}

export default function TechnicalTab({ localData, overdimensioning, specs }: TechnicalTabProps) {
    return (
        <div className="space-y-6">
            {/* Especificaciones Técnicas */}
            <div className="glass rounded-2xl p-6 space-y-4">
                <h3 className="font-bold flex items-center gap-2 text-[var(--text-primary)]">
                    <Zap className="w-5 h-5 text-[var(--solar-gold)]" /> Especificaciones Técnicas
                    {localData?.system_type === 'On-grid' && (
                        <span className="ml-2 px-2 py-0.5 text-xs font-bold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">On-grid</span>
                    )}
                    {localData?.system_type === 'Off-grid' && (
                        <span className="ml-2 px-2 py-0.5 text-xs font-bold rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">Off-grid</span>
                    )}
                    {localData?.system_type === 'Híbrido' && (
                        <span className="ml-2 px-2 py-0.5 text-xs font-bold rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">Híbrido</span>
                    )}
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-[var(--surface)] rounded-xl p-4 border border-[var(--border-ui)]">
                        <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] uppercase tracking-wider mb-1">
                            <Zap className="w-4 h-4" /> Potencia
                        </div>
                        <p className="text-2xl font-bold text-[var(--solar-gold)]">{localData?.power_kwp}</p>
                        <p className="text-xs text-[var(--text-secondary)]">kWp instalada</p>
                    </div>
                    <div className="bg-[var(--surface)] rounded-xl p-4 border border-[var(--border-ui)]">
                        <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] uppercase tracking-wider mb-1">
                            <Sun className="w-4 h-4 text-amber-400" /> Paneles
                        </div>
                        <p className="text-2xl font-bold text-[var(--text-primary)]">{specs?.panelCount || 0}</p>
                        <p className="text-xs text-[var(--text-secondary)]">{specs?.avgPanelPower || 500}W c/u</p>
                    </div>
                    <div className="bg-[var(--surface)] rounded-xl p-4 border border-[var(--border-ui)]">
                        <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] uppercase tracking-wider mb-1">
                            <Cpu className="w-4 h-4 text-blue-400" /> Inversores
                        </div>
                        <p className="text-2xl font-bold text-[var(--text-primary)]">{overdimensioning?.inverterPower?.toFixed(1) || '0.0'}</p>
                        <p className="text-xs text-[var(--text-secondary)]">kW total</p>
                    </div>
                    <div className="bg-[var(--surface)] rounded-xl p-4 border border-[var(--border-ui)]">
                        <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] uppercase tracking-wider mb-1">
                            <Activity className="w-4 h-4" /> Ratio
                        </div>
                        <p className={`text-2xl font-bold ${
                            overdimensioning?.isWarning ? 'text-red-400' :
                            overdimensioning?.isLow ? 'text-blue-400' : 'text-emerald-400'
                        }`}>{overdimensioning?.ratio?.toFixed(2) || '0.00'}x</p>
                        <p className="text-xs text-[var(--text-secondary)]">
                            {overdimensioning?.ratio === 0 ? 'Sin datos' :
                            overdimensioning?.isWarning ? 'Sobredimensionado' :
                            overdimensioning?.isLow ? 'Subdimensionado' : 'Óptimo'}
                        </p>
                    </div>
                </div>

                {/* Barra visual del ratio */}
                <div className="space-y-2">
                    <div className="flex justify-between text-xs text-[var(--text-secondary)]">
                        <span>Ratio de dimensionamiento</span>
                        <span className="font-semibold">{overdimensioning?.ratio?.toFixed(2) || '0.00'}x</span>
                    </div>
                    <div className="h-3 bg-[var(--surface)] rounded-full overflow-hidden flex">
                        <div
                            className={`h-full transition-all ${
                                overdimensioning?.ratio === 0 ? 'bg-slate-500 w-0' :
                                overdimensioning?.ratio > 1.3 ? 'bg-red-500' :
                                overdimensioning?.ratio > 1.0 ? 'bg-amber-500' :
                                'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.min((overdimensioning?.ratio || 0) * 50, 100)}%` }}
                        />
                    </div>
                    <div className="flex justify-between text-[10px] text-[var(--text-secondary)]">
                        <span>0x</span>
                        <span className="text-emerald-400">1.0x (óptimo)</span>
                        <span className="text-amber-400">1.3x</span>
                        <span className="text-red-400">1.5x+</span>
                    </div>
                </div>

                {/* Producción estimada y área */}
                <div className="grid grid-cols-2 md:grid-cols-6 gap-3 pt-4 border-t border-[var(--border-ui)]">
                    <div className="flex items-center gap-2 p-2 bg-[var(--surface)] rounded-xl border border-[var(--border-ui)]">
                        <TrendingUp className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        <div className="min-w-0">
                            <p className="text-[10px] text-[var(--text-secondary)] truncate">Producción diaria</p>
                            <p className="text-sm font-bold text-[var(--text-primary)] truncate">{(specs?.dailyProduction || 0).toFixed(1)} kWh</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-[var(--surface)] rounded-xl border border-[var(--border-ui)]">
                        <TrendingUp className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        <div className="min-w-0">
                            <p className="text-[10px] text-[var(--text-secondary)] truncate">Producción mensual</p>
                            <p className="text-sm font-bold text-[var(--text-primary)] truncate">{(specs?.monthlyProduction || 0).toFixed(0)} kWh</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-[var(--surface)] rounded-xl border border-[var(--border-ui)]">
                        <TrendingUp className="w-4 h-4 text-blue-400 flex-shrink-0" />
                        <div className="min-w-0">
                            <p className="text-[10px] text-[var(--text-secondary)] truncate">Producción anual</p>
                            <p className="text-sm font-bold text-[var(--text-primary)] truncate">{(specs?.yearlyProduction || 0).toLocaleString('es-CO')} kWh</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-[var(--surface)] rounded-xl border border-[var(--border-ui)]">
                        <Box className="w-4 h-4 text-purple-400 flex-shrink-0" />
                        <div className="min-w-0">
                            <p className="text-[10px] text-[var(--text-secondary)] truncate">Área</p>
                            <p className="text-sm font-bold text-[var(--text-primary)] truncate">{specs?.areaM2 || 0} m²</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-[var(--surface)] rounded-xl border border-[var(--solar-gold)]/30">
                        <Wallet className="w-4 h-4 text-[var(--solar-gold)] flex-shrink-0" />
                        <div className="min-w-0">
                            <p className="text-[10px] text-[var(--text-secondary)] truncate">Ahorro mensual</p>
                            <p className="text-sm font-bold text-[var(--solar-gold)] truncate">{fmt(specs?.monthlySavings || 0)}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-[var(--surface)] rounded-xl border border-[var(--solar-gold)]/30">
                        <Wallet className="w-4 h-4 text-[var(--solar-gold)] flex-shrink-0" />
                        <div className="min-w-0">
                            <p className="text-[10px] text-[var(--text-secondary)] truncate">Ahorro anual</p>
                            <p className="text-sm font-bold text-[var(--solar-gold)] truncate">{fmt(specs?.yearlySavings || 0)}</p>
                        </div>
                    </div>
                </div>

                {/* Factores usados */}
                <div className="text-xs text-[var(--text-secondary)] flex flex-wrap gap-3 pt-2 border-t border-[var(--border-ui)]">
                    <span>HSP: <strong className="text-[var(--text-primary)]">{specs?.colHsp || 4.5} h/día</strong></span>
                    <span>PR: <strong className="text-[var(--text-primary)]">{((specs?.colPr || 0.80) * 100).toFixed(0)}%</strong></span>
                    <span>Tarifa: <strong className="text-[var(--text-primary)]">{fmt(specs?.energyTariff || 1000)}/kWh</strong></span>
                    <span>CF: <strong className="text-[var(--text-primary)]">{((specs?.yearlyProduction || 0) / ((localData?.power_kwp || 1) * 8760) * 100).toFixed(1)}%</strong></span>
                </div>
            </div>
        </div>
    );
}