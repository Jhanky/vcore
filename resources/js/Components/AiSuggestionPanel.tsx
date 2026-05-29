import { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, Loader2 } from 'lucide-react';
import { router } from '@inertiajs/react';

interface AiSuggestionPanelProps {
    systemType: string;
    powerKwp: string;
    panels: any[];
    panelQty: any;
    panelId: string;
    inverters: any[];
    inverterQty: any;
    inverterId: string;
    batteries: any[];
    batteryQty: any;
    batteryId: string;
    clientConsumption?: number;
    clientLocation?: string;
    monthlyBill?: number;
}

export default function AiSuggestionPanel({
    systemType, powerKwp, panels, panelQty, panelId,
    inverters, inverterQty, inverterId,
    batteries, batteryQty, batteryId,
    clientConsumption = 0, clientLocation = 'Colombia', monthlyBill = 0
}: AiSuggestionPanelProps) {
    const [analysis, setAnalysis] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isOffline, setIsOffline] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadAnalysis = () => {
        if (!systemType || !powerKwp || !panelId || !inverterId) return;

        setIsLoading(true);
        setError(null);

        const panelsData = panels
            .filter((p: any) => String(p.id) === String(panelId))
            .map((p: any) => ({
                qty: panelQty,
                power: p.power,
                brand: p.brand,
                model: p.model,
            }));

        const invertersData = inverters
            .filter((i: any) => String(i.id) === String(inverterId))
            .map((i: any) => ({
                qty: inverterQty,
                power: i.power,
                brand: i.brand,
                model: i.model,
            }));

        const batteriesData = batteries.length > 0 && batteryId
            ? batteries
                .filter((b: any) => String(b.id) === String(batteryId))
                .map((b: any) => ({
                    qty: batteryQty,
                    capacity: b.capacity,
                    voltage: b.voltage,
                }))
            : [];

        router.post(route('quotations.analyze'), {
                system_type: systemType,
                power_kwp: powerKwp,
                panels: panelsData,
                inverters: invertersData,
                batteries: batteriesData,
                client_consumption: clientConsumption,
                client_location: clientLocation,
                monthly_bill: monthlyBill,
            }, {
            preserveScroll: true,
            onSuccess: (res: any) => {
                const response = res.props.response;
                if (response?.offline) {
                    setIsOffline(true);
                }
                setAnalysis(response?.analysis || 'Sin análisis disponible.');
                setIsLoading(false);
            },
            onError: (err: any) => {
                setError('Error al cargar análisis');
                setIsLoading(false);
            },
        });
    };

    useEffect(() => {
        if (systemType && powerKwp && panelId && inverterId) {
            loadAnalysis();
        }
    }, [systemType, powerKwp, panelId, inverterId, panelQty, inverterQty, batteryId, batteryQty]);

    if (!systemType || !powerKwp || !panelId || !inverterId) {
        return null;
    }

    return (
        <div className="glass border border-purple-500/20 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-400" />
                    <h3 className="font-bold text-[var(--text-primary)]">Análisis con IA</h3>
                    {isOffline && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                            Offline
                        </span>
                    )}
                </div>
                <button
                    onClick={loadAnalysis}
                    disabled={isLoading}
                    className="p-2 rounded-lg hover:bg-[var(--surface)] text-[var(--text-secondary)] hover:text-purple-400 transition-colors"
                    title="Actualizar análisis"
                >
                    <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {isLoading && (
                <div className="flex items-center justify-center py-8 text-[var(--text-secondary)]">
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    <span className="text-sm">Analizando sistema...</span>
                </div>
            )}

            {error && (
                <div className="text-sm text-red-400 py-2">{error}</div>
            )}

            {analysis && !isLoading && (
                <div className="prose prose-sm prose-invert max-w-none">
                    <div className="text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">
                        {analysis}
                    </div>
                </div>
            )}

            {!analysis && !isLoading && !error && (
                <div className="text-sm text-[var(--text-secondary)] italic py-4 text-center">
                    Completa la selección de productos para ver el análisis de IA
                </div>
            )}
        </div>
    );
}
