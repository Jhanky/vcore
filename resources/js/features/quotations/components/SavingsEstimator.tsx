import { useMemo } from 'react';
import { DollarSign, TrendingUp, Zap } from 'lucide-react';
import { SOLAR, DEFAULT_TARIFF } from '@/utils/solarConstants';

interface SavingsEstimatorProps {
    powerKwp: any;
    panelQty: any;
    panelPower: any;
    consumptionKwh?: number;
    energyTariff?: number;
}

export default function SavingsEstimator({ powerKwp, panelQty, panelPower, consumptionKwh, energyTariff }: SavingsEstimatorProps) {
    const tariff = energyTariff || DEFAULT_TARIFF;

    const stats = useMemo(() => {
        const totalKw = panelQty > 0 && panelPower > 0 ? (panelQty * panelPower) / 1000 : parseFloat(String(powerKwp)) || 0;
        if (totalKw === 0) return null;

        const dailyProduction = totalKw * SOLAR.HSP * SOLAR.PR;
        const monthlyProduction = dailyProduction * SOLAR.DAYS_PER_MONTH;
        const yearlyProduction = dailyProduction * SOLAR.DAYS_PER_YEAR;
        const monthlySavings = monthlyProduction * tariff;
        const yearlySavings = yearlyProduction * tariff;
        const coverage = consumptionKwh && consumptionKwh > 0 ? (monthlyProduction / consumptionKwh) * 100 : null;

        return {
            totalKw,
            dailyProduction: Math.round(dailyProduction),
            monthlyProduction: Math.round(monthlyProduction),
            yearlyProduction: Math.round(yearlyProduction),
            monthlySavings: Math.round(monthlySavings),
            yearlySavings: Math.round(yearlySavings),
            coverage,
        };
    }, [powerKwp, panelQty, panelPower, consumptionKwh, tariff]);

    if (!stats) return null;

    return (
        <div className="glass border border-emerald-500/20 rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-[var(--text-primary)]">Ahorro Estimado</h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {/* Producción Mensual */}
                <div className="bg-[var(--surface)] border border-[var(--border-ui)] rounded-xl p-3">
                    <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] mb-1">
                        <Zap className="w-3 h-3 text-amber-400" />
                        <span>Producción Mensual</span>
                    </div>
                    <p className="text-lg font-bold text-[var(--solar-gold)]">
                        {stats.monthlyProduction.toLocaleString('es-CO')}
                        <span className="text-xs font-normal text-[var(--text-secondary)] ml-1">kWh</span>
                    </p>
                </div>

                {/* Ahorro Mensual */}
                <div className="bg-[var(--surface)] border border-[var(--border-ui)] rounded-xl p-3">
                    <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] mb-1">
                        <DollarSign className="w-3 h-3 text-emerald-400" />
                        <span>Ahorro Mensual</span>
                    </div>
                    <p className="text-lg font-bold text-emerald-400">
                        ${stats.monthlySavings.toLocaleString('es-CO')}
                    </p>
                </div>

                {/* Ahorro Anual */}
                <div className="bg-[var(--surface)] border border-[var(--border-ui)] rounded-xl p-3">
                    <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] mb-1">
                        <TrendingUp className="w-3 h-3 text-blue-400" />
                        <span>Ahorro Anual</span>
                    </div>
                    <p className="text-lg font-bold text-blue-400">
                        ${(stats.yearlySavings / 1000000).toFixed(1)}M
                    </p>
                </div>

                {/* Cobertura */}
                {stats.coverage !== null && (
                    <div className="bg-[var(--surface)] border border-[var(--border-ui)] rounded-xl p-3">
                        <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] mb-1">
                            <TrendingUp className="w-3 h-3 text-purple-400" />
                            <span>Cobertura</span>
                        </div>
                        <p className={`text-lg font-bold ${stats.coverage >= 100 ? 'text-emerald-400' : 'text-amber-400'}`}>
                            {stats.coverage.toFixed(0)}%
                        </p>
                    </div>
                )}
            </div>

            <div className="text-xs text-[var(--text-secondary)] bg-[var(--surface)]/50 rounded-lg px-3 py-2">
                <span className="font-semibold">*</span> Estimación basada en HSP {SOLAR.HSP} (Colombia), PR {(SOLAR.PR * 100).toFixed(0)}%, tarifa ${tariff.toLocaleString('es-CO')}/kWh, {SOLAR.DAYS_PER_MONTH} días/mes
            </div>
        </div>
    );
}
