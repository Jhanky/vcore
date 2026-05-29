import { useState } from 'react';
import { Zap, DollarSign, Maximize2, Plug, MapPin, ChevronDown } from 'lucide-react';

interface ConnectionPoint {
    id: number;
    operador: string;
    codigo: number;
    matricula: string;
    localizacion: string;
    potencia_nominal: string;
    tens_pri: number;
    tens_sec: string;
    propiedad: string;
    capacidad_disp: string;
    latitud: number;
    longitud: number;
}

interface Props {
    energyConsumptionKwh: number;
    monthlyBillAmount: number;
    energyTariff: number;
    availableAreaM2: number;
    connectionPoint?: ConnectionPoint;
}

export default function ProjectData({
    energyConsumptionKwh,
    monthlyBillAmount,
    energyTariff,
    availableAreaM2,
    connectionPoint
}: Props) {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <section className="glass p-6 rounded-[2rem]">
            <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4 font-outfit flex items-center gap-2">
                <Zap className="h-5 w-5 text-[var(--solar-gold)]" />
                Datos del Proyecto
            </h3>

            <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-500/5 border border-[var(--border-ui)]/50">
                    <div className="flex items-center gap-3 text-[var(--text-secondary)]">
                        <Zap className="h-5 w-5 text-[var(--solar-gold)]" />
                        <span className="text-sm">Consumo Mensual</span>
                    </div>
                    <span className="font-bold text-[var(--text-primary)]">
                        {energyConsumptionKwh || 0} kWh
                    </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-500/5 border border-[var(--border-ui)]/50">
                    <div className="flex items-center gap-3 text-[var(--text-secondary)]">
                        <DollarSign className="h-5 w-5 text-emerald-400" />
                        <span className="text-sm">Pago Mensual</span>
                    </div>
                    <span className="font-bold text-[var(--text-primary)]">
                        ${Math.round(monthlyBillAmount || 0).toLocaleString('es-CO')}
                    </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-500/5 border border-[var(--border-ui)]/50">
                    <div className="flex items-center gap-3 text-[var(--text-secondary)]">
                        <div className="text-xs font-bold">$/kWh</div>
                        <span className="text-sm">Tarifa</span>
                    </div>
                    <span className="font-bold text-[var(--text-primary)]">
                        {energyTariff ? `$${Math.round(Number(energyTariff))}` : '-'}
                    </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-500/5 border border-[var(--border-ui)]/50">
                    <div className="flex items-center gap-3 text-[var(--text-secondary)]">
                        <Maximize2 className="h-5 w-5 text-blue-400" />
                        <span className="text-sm">Área Disponible</span>
                    </div>
                    <span className="font-bold text-[var(--text-primary)]">
                        {availableAreaM2 || 0} m²
                    </span>
                </div>
            </div>

            {/* Punto de Conexión - Accordion */}
            {connectionPoint && (
                <div className="mt-4">
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-500/5 border border-[var(--border-ui)]/50 hover:border-[var(--solar-gold)]/30 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <Plug className="h-5 w-5 text-[var(--solar-gold)]" />
                            <span className="text-sm font-bold text-[var(--text-primary)]">Punto de Conexión</span>
                        </div>
                        <ChevronDown className={`h-5 w-5 text-[var(--text-secondary)] transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>

                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-96 mt-3' : 'max-h-0'}`}>
                        <div className="space-y-2 pl-2">
                            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-500/5">
                                <div className="flex items-center gap-2 text-[var(--text-secondary)] text-xs">
                                    <Plug className="h-4 w-4 text-[var(--solar-gold)]" />
                                    <span>Operador</span>
                                </div>
                                <span className="font-bold text-[var(--text-primary)] text-sm uppercase">
                                    {connectionPoint.operador}
                                </span>
                            </div>

                            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-500/5">
                                <div className="flex items-center gap-2 text-[var(--text-secondary)] text-xs">
                                    <MapPin className="h-4 w-4 text-emerald-400" />
                                    <span>Código</span>
                                </div>
                                <span className="font-bold text-[var(--text-primary)] text-sm">
                                    {connectionPoint.codigo}
                                </span>
                            </div>

                            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-500/5">
                                <div className="flex items-center gap-2 text-[var(--text-secondary)] text-xs">
                                    <MapPin className="h-4 w-4 text-blue-400" />
                                    <span>Matrícula</span>
                                </div>
                                <span className="font-bold text-[var(--text-primary)] text-sm">
                                    {connectionPoint.matricula}
                                </span>
                            </div>

                            <div className="p-2 rounded-lg bg-slate-500/5">
                                <div className="flex items-center gap-2 text-[var(--text-secondary)] text-xs mb-1">
                                    <MapPin className="h-4 w-4 text-red-400" />
                                    <span>Localización</span>
                                </div>
                                <div className="text-sm font-bold text-[var(--text-primary)]">
                                    {connectionPoint.localizacion}
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-500/5">
                                <div className="flex items-center gap-2 text-[var(--text-secondary)] text-xs">
                                    <Zap className="h-4 w-4 text-amber-400" />
                                    <span>Potencia</span>
                                </div>
                                <span className="font-bold text-[var(--text-primary)] text-sm">
                                    {connectionPoint.potencia_nominal} kW
                                </span>
                            </div>

                            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-500/5">
                                <div className="flex items-center gap-2 text-[var(--text-secondary)] text-xs">
                                    <Zap className="h-4 w-4 text-purple-400" />
                                    <span>Tensión</span>
                                </div>
                                <span className="font-bold text-[var(--text-primary)] text-sm">
                                    {connectionPoint.tens_pri} kV / {connectionPoint.tens_sec}
                                </span>
                            </div>

                            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-500/5">
                                <div className="flex items-center gap-2 text-[var(--text-secondary)] text-xs">
                                    <Plug className="h-4 w-4 text-cyan-400" />
                                    <span>Capacidad disponible</span>
                                </div>
                                <span className="font-bold text-[var(--text-primary)] text-sm">
                                    {connectionPoint.capacidad_disp} kW
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
