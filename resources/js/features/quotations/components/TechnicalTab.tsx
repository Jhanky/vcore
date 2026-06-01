import { useState } from 'react';
import { Zap, Sun, Cpu, Activity, TrendingUp, Box, Wallet, FileText, Battery, X, ExternalLink, HelpCircle, Info } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { formatCurrencySimple } from '@/utils/format';

function fmt(v: number) {
    return formatCurrencySimple(v);
}

interface TechnicalTabProps {
    localData: any;
    overdimensioning: any;
    specs: any;
    catalogPanels?: any[];
    catalogInverters?: any[];
    catalogBatteries?: any[];
}

export default function TechnicalTab({ localData, overdimensioning, specs, catalogPanels, catalogInverters, catalogBatteries }: TechnicalTabProps) {
    const [techSheetModal, setTechSheetModal] = useState<{
        open: boolean;
        product: any;
        catalogData: any;
    }>({ open: false, product: null, catalogData: null });

    // Multiplicadores de producción mensual para Colombia
    // Meses soleados (Ene, Feb, Dic) tienen mayor irradiación; meses lluviosos (May-Oct) menor
    const monthlyMultipliers = [1.1, 1.05, 0.95, 0.85, 0.75, 0.8, 0.9, 0.95, 0.85, 0.75, 0.9, 1.05];
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const monthlyProduction = specs?.monthlyProduction || 0;

    const monthlyData = monthNames.map((month, index) => ({
        month,
        production: Math.round(monthlyProduction * monthlyMultipliers[index]),
    }));

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
                    <span className="group relative">
                        <span>CF: <strong className="text-[var(--text-primary)]">{((specs?.yearlyProduction || 0) / ((localData?.power_kwp || 1) * 8760) * 100).toFixed(1)}%</strong></span>
                        <HelpCircle className="inline-block w-3 h-3 ml-1 text-[var(--text-secondary)]/50 cursor-help" />
                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-[10px] leading-tight bg-[var(--bg-content)] border border-[var(--border-ui)] rounded-lg shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                            Factor de Capacidad = Producción anual / (Potencia × 8760 h)
                        </span>
                    </span>
                </div>
            </div>

            {/* Gráfica de Producción Mensual */}
            <div className="glass rounded-2xl p-6 space-y-4">
                <h3 className="font-bold flex items-center gap-2 text-[var(--text-primary)]">
                    <TrendingUp className="w-5 h-5 text-[var(--solar-gold)]" />
                    Producción Estimada Mensual
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={monthlyData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-ui)" />
                        <XAxis dataKey="month" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                        <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                        <Tooltip
                            contentStyle={{
                                background: 'var(--bg-content)',
                                border: '1px solid var(--border-ui)',
                                borderRadius: '0.5rem',
                            }}
                            formatter={(value) => [`${Number(value).toLocaleString('es-CO')} kWh`, 'Producción']}
                        />
                        <Bar dataKey="production" fill="var(--solar-gold)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Datos Técnicos de Productos */}
            {localData?.products?.length > 0 && (
                <div className="glass rounded-2xl p-6 space-y-4">
                    <h3 className="font-bold flex items-center gap-2 text-[var(--text-primary)]">
                        <FileText className="w-5 h-5 text-[var(--solar-gold)]" />
                        Datos Técnicos de Productos
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {localData.products.map((p: any) => (
                            <div key={p.id} className="bg-[var(--surface)] border border-[var(--border-ui)] rounded-xl p-4 space-y-2">
                                <div className="flex items-center gap-2 border-b border-[var(--border-ui)] pb-2">
                                    {p.product_type === 'panel' && <Sun className="w-4 h-4 text-amber-400" />}
                                    {p.product_type === 'inverter' && <Cpu className="w-4 h-4 text-blue-400" />}
                                    {p.product_type === 'battery' && <Battery className="w-4 h-4 text-emerald-400" />}
                                    <span className="text-xs font-semibold uppercase">{p.product_type}</span>
                                </div>
                                <p className="font-bold text-[var(--text-primary)]">{p.snapshot_brand}</p>
                                <p className="text-sm text-[var(--text-secondary)]">{p.snapshot_model}</p>
                                <div className="pt-2 space-y-1 text-xs">
                                    {(() => {
                                        const specs = p.snapshot_specs || {};
                                        const fields: { label: string; value: any }[] = [];

                                        if (p.product_type === 'panel') {
                                            fields.push({ label: 'Potencia', value: specs.power ? `${specs.power}W` : null });
                                            if (specs.efficiency) fields.push({ label: 'Eficiencia', value: `${specs.efficiency}%` });
                                            if (specs.dimensions) fields.push({ label: 'Dimensiones', value: specs.dimensions });
                                            if (specs.weight) fields.push({ label: 'Peso', value: specs.weight });
                                            if (specs.cell_type) fields.push({ label: 'Tipo celda', value: specs.cell_type });
                                            if (specs.warranty) fields.push({ label: 'Garantía', value: specs.warranty });
                                        } else if (p.product_type === 'inverter') {
                                            fields.push({ label: 'Potencia', value: specs.power ? `${specs.power}kW` : null });
                                            if (specs.efficiency) fields.push({ label: 'Eficiencia', value: `${specs.efficiency}%` });
                                            if (specs.grid_type) fields.push({ label: 'Tipo red', value: specs.grid_type });
                                            if (specs.system_type) fields.push({ label: 'Sistema', value: specs.system_type });
                                            if (specs.warranty) fields.push({ label: 'Garantía', value: specs.warranty });
                                        } else if (p.product_type === 'battery') {
                                            fields.push({ label: 'Capacidad', value: specs.capacity ? `${specs.capacity}Ah` : null });
                                            if (specs.voltage) fields.push({ label: 'Voltaje', value: `${specs.voltage}V` });
                                            if (specs.chemistry) fields.push({ label: 'Tipo', value: specs.chemistry });
                                            if (specs.life_cycles) fields.push({ label: 'Ciclos', value: specs.life_cycles });
                                            if (specs.warranty) fields.push({ label: 'Garantía', value: specs.warranty });
                                        }

                                        const visibleFields = fields.filter(f => f.value);
                                        if (visibleFields.length <= 1) {
                                            return <p className="text-[11px] text-[var(--text-secondary)]/60 italic text-center py-2">Sin datos adicionales disponibles</p>;
                                        }

                                        return visibleFields.map((f, i) => (
                                            <div key={i} className="flex justify-between">
                                                <span>{f.label}:</span>
                                                <span className="font-semibold">{f.value}</span>
                                            </div>
                                        ));
                                    })()}
                                </div>
                                {(() => {
                                    const catalogMap: any = { panel: catalogPanels, inverter: catalogInverters, battery: catalogBatteries };
                                    const catalogProduct = catalogMap[p.product_type]?.find((c: any) => c.id === p.product_id);
                                    const hasDatasheet = catalogProduct?.datasheet_url || catalogProduct?.datasheet;
                                    if (!hasDatasheet) return null;
                                    return (
                                        <button
                                            onClick={() => {
                                                setTechSheetModal({ open: true, product: p, catalogData: catalogProduct });
                                            }}
                                            className="mt-3 w-full px-3 py-1.5 text-xs font-semibold rounded-lg bg-[var(--solar-gold)]/10 text-[var(--solar-gold)] border border-[var(--solar-gold)]/30 hover:bg-[var(--solar-gold)]/20 transition-all"
                                        >
                                            <FileText className="w-3 h-3 inline mr-1" />
                                            Ver Ficha Técnica
                                        </button>
                                    );
                                })()}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Modal de Ficha Técnica */}
            {techSheetModal.open && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="glass rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-[var(--border-ui)]">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold flex items-center gap-2">
                                <FileText className="w-5 h-5 text-[var(--solar-gold)]" />
                                Ficha Técnica
                            </h3>
                            <button onClick={() => setTechSheetModal({ open: false, product: null, catalogData: null })}
                                className="p-1 hover:bg-[var(--surface)] rounded-lg transition-colors">
                                <X className="w-5 h-5 text-[var(--text-secondary)]" />
                            </button>
                        </div>

                        {techSheetModal.catalogData ? (
                            <div className="space-y-4">
                                <div className="flex items-start gap-4 border-b border-[var(--border-ui)] pb-4">
                                    <div>
                                        <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wider">Marca</p>
                                        <p className="font-bold text-[var(--text-primary)]">{techSheetModal.catalogData.brand}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wider">Modelo</p>
                                        <p className="font-bold text-[var(--text-primary)]">{techSheetModal.catalogData.model}</p>
                                    </div>
                                    {techSheetModal.catalogData?.datasheet_url || techSheetModal.catalogData?.datasheet ? (
                                        <div className="ml-auto">
                                            <a
                                                href={techSheetModal.catalogData.datasheet_url || techSheetModal.catalogData.datasheet}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 transition-all"
                                            >
                                                <FileText className="w-4 h-4" />
                                                Descargar Ficha PDF
                                            </a>
                                        </div>
                                    ) : techSheetModal.catalogData?.brand && techSheetModal.catalogData?.model ? (
                                        <div className="ml-auto">
                                            <a
                                                href={`https://www.google.com/search?q=${encodeURIComponent(techSheetModal.catalogData.brand + ' ' + techSheetModal.catalogData.model + ' datasheet pdf')}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/30 hover:bg-blue-500/20 transition-all"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                                Buscar en Google
                                            </a>
                                        </div>
                                    ) : null}
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {Object.entries(techSheetModal.catalogData)
                                        .filter(([key]) => !['id', 'created_at', 'updated_at', 'brand', 'model', 'price', 'image_url', 'datasheet_url', 'datasheet', 'deleted_at'].includes(key))
                                        .map(([key, value]) => {
                                            if (value === null || value === undefined || value === '') return null;
                                            const labels: Record<string, string> = {
                                                power: 'Potencia', capacity: 'Capacidad', voltage: 'Voltaje',
                                                efficiency: 'Eficiencia', warranty: 'Garantía', weight: 'Peso',
                                                dimensions: 'Dimensiones', cell_type: 'Tipo celda',
                                                grid_type: 'Tipo red', system_type: 'Sistema',
                                                chemistry: 'Química', life_cycles: 'Ciclos de vida',
                                                price: 'Precio', brand: 'Marca', model: 'Modelo',
                                                datasheet_url: 'Ficha técnica',
                                            };
                                            return (
                                                <div key={key} className="bg-[var(--surface)] rounded-lg p-3">
                                                    <p className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider">{labels[key] || key.replace(/_/g, ' ')}</p>
                                                    <p className="text-sm font-semibold text-[var(--text-primary)]">{String(value)}</p>
                                                </div>
                                            );
                                    })}
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm text-[var(--text-secondary)]">No hay información de catálogo disponible para este producto.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}