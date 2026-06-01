import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import SystemAnalysisPanel from '@/features/quotations/components/SystemAnalysisPanel';
import SavingsEstimator from '@/features/quotations/components/SavingsEstimator';
import { Head, useForm, router } from '@inertiajs/react';
import { showToast } from '@/Components/Toast';
import { formatCurrencySimple } from '@/utils/format';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Plus, Trash2, Save, Sun, Cpu, Battery, Wrench, Calculator, AlertCircle, FileText, Settings, Search, Check, ChevronDown } from 'lucide-react';

interface Product { id: number; brand: string; model: string; power?: number; capacity?: number; voltage?: number; price: number; system_type?: string; grid_type?: string; }
interface QuotationProduct { product_type: 'panel'|'inverter'|'battery'; product_id: string; quantity: number; unit_price_cop: number; profit_percentage: number; }
interface QuotationItem { description: string; category: string; quantity: number; unit_measure: string; unit_price_cop: number; profit_percentage: number; }

const ITEM_CATEGORIES = ['material','mano_obra','servicio'];
const ITEM_CATEGORY_LABELS: Record<string, string> = {
    material: 'Material',
    mano_obra: 'Mano de Obra',
    servicio: 'Servicio'
};
const UNITS = ['und','kW','m','global','panel','trámite'];

function fmt(v: number) {
    return formatCurrencySimple(v);
}
function round2(n: number) { return Math.round((n + Number.EPSILON) * 100) / 100; }

function calcTotals(products: QuotationProduct[], items: QuotationItem[], pcts: any) {
    let sub = 0;
    [...products,...items].forEach(r => {
        const cost = r.quantity * r.unit_price_cop;
        sub += cost * (1 + r.profit_percentage);
    });
    sub = round2(sub);
    const cm  = round2(sub * pcts.commercial_management_percentage);
    const s2  = round2(sub + cm);
    const adm = round2(s2 * pcts.administration_percentage);
    const cnt = round2(s2 * pcts.contingency_percentage);
    const prf = round2(s2 * pcts.profit_percentage);
    const piv = round2(prf * pcts.iva_profit_percentage);
    const s3  = round2(s2 + adm + cnt + prf + piv);
    const wh  = round2(s3 * pcts.withholding_percentage);
    return { sub, cm, s2, adm, cnt, prf, piv, s3, wh, total: round2(s3+wh) };
}

function defaultItems(powerKwp: number, panelCount: number): QuotationItem[] {
    return [
        { description:'Mano de obra instalación', category:'mano_obra', quantity:powerKwp||0, unit_measure:'kW', unit_price_cop:375000, profit_percentage:0.15 },
        { description:'Material eléctrico', category:'material', quantity:powerKwp||0, unit_measure:'kW', unit_price_cop:345000, profit_percentage:0.15 },
        { description:'Estructura de soporte paneles', category:'material', quantity:panelCount||0, unit_measure:'panel', unit_price_cop:130000, profit_percentage:0.15 },
        { description:'Trámites y permisos', category:'servicio', quantity:1, unit_measure:'global', unit_price_cop:7000000, profit_percentage:0.10 },
    ];
}

export default function Form({ clients, panels, inverters, batteries, system_types, preselectedClient = null }: any) {
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [clientSearch, setClientSearch] = useState('');
    const [showClientDropdown, setShowClientDropdown] = useState(false);
    const [itemsUserModified, setItemsUserModified] = useState(false);
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
    const [preselectedHighlight, setPreselectedHighlight] = useState(false);

    const { data, setData, processing, errors } = useForm({
        client_id: '',
        project_name: '',
        system_type: '',
        network_type: '',
        power_kwp: '',
        requires_financing: false,
        profit_percentage: 0.08,
        iva_profit_percentage: 0.19,
        commercial_management_percentage: 0.02,
        administration_percentage: 0.08,
        contingency_percentage: 0.03,
        withholding_percentage: 0.025,
        panel_id: '',
        panel_qty: '' as any,
        inverter_id: '',
        inverter_qty: '' as any,
        battery_id: '',
        battery_qty: '' as any,
        items: [] as QuotationItem[],
    });

    const filteredClients = useMemo(() => {
        if (!clientSearch.trim()) return clients.slice(0, 10);
        const search = clientSearch.toLowerCase();
        return clients.filter((c: any) =>
            c.name?.toLowerCase().includes(search) ||
            c.email?.toLowerCase().includes(search) ||
            c.document_number?.toLowerCase().includes(search)
        ).slice(0, 10);
    }, [clientSearch, clients]);

    const selectedClient = useMemo(() =>
        clients.find((c: any) => String(c.id) === String(data.client_id))
    , [data.client_id, clients]);

    const needsBattery = data.system_type === 'Off-grid' || data.system_type === 'Híbrido';

    const buildProducts = useCallback((): QuotationProduct[] => {
        const ps: QuotationProduct[] = [];
        if (data.panel_id) {
            const panel = panels.find((p:any) => String(p.id) === String(data.panel_id));
            ps.push({ product_type:'panel', product_id: data.panel_id, quantity: data.panel_qty, unit_price_cop: panel?.price ?? 0, profit_percentage: 0.15 });
        }
        if (data.inverter_id) {
            const inverter = inverters.find((i:any) => String(i.id) === String(data.inverter_id));
            ps.push({ product_type:'inverter', product_id: data.inverter_id, quantity: data.inverter_qty, unit_price_cop: inverter?.price ?? 0, profit_percentage: 0.15 });
        }
        if (needsBattery && data.battery_id) {
            const battery = batteries.find((b:any) => String(b.id) === String(data.battery_id));
            ps.push({ product_type:'battery', product_id: data.battery_id, quantity: data.battery_qty, unit_price_cop: battery?.price ?? 0, profit_percentage: 0.15 });
        }
        return ps;
    }, [data.panel_id, data.panel_qty, data.inverter_id, data.inverter_qty, data.battery_id, data.battery_qty, needsBattery, panels, inverters, batteries]);

    const totals = useMemo(() => calcTotals(buildProducts(), data.items, data), [buildProducts, data.items, data]);

    const overdimensioning = useMemo(() => {
        const p = panels.find((x:any) => String(x.id) === String(data.panel_id));
        const i = inverters.find((x:any) => String(x.id) === String(data.inverter_id));

        const panelPower = p && data.panel_qty ? (p.power * data.panel_qty) / 1000 : 0;
        const inverterPower = i && data.inverter_qty ? (i.power * data.inverter_qty) : 0;

        const ratio = inverterPower > 0 ? panelPower / inverterPower : 0;
        return { panelPower, inverterPower, ratio, isWarning: ratio > 1.3 };
    }, [data.panel_id, data.panel_qty, data.inverter_id, data.inverter_qty, panels, inverters]);

    const onSelectSupply = useCallback((type: 'panel'|'inverter'|'battery', id: string) => {
        const catalog = type==='panel' ? panels : type==='inverter' ? inverters : batteries;
        const found: any = catalog.find((c:any) => String(c.id) === id);
        const power = parseFloat(String(data.power_kwp)) || 0;
        if (type === 'panel') {
            const autoQty = found && power ? Math.ceil((power * 1000) / found.power) : 1;
            setData((d:any) => ({...d, panel_id: id, panel_qty: autoQty}));
        } else if (type === 'inverter') {
            const invPower = parseFloat(found?.power);
            const qty = found && power && !isNaN(invPower) ? Math.ceil(power / (invPower * 1.3)) : 1;
            setData((d:any) => ({...d, inverter_id: id, inverter_qty: Math.max(1, qty)}));
        } else {
            setData((d:any) => ({...d, battery_id: id}));
        }
    }, [data.power_kwp, panels, inverters, batteries]);

    const onPowerChange = useCallback((value: string) => {
        setData('power_kwp', value);
        const power = parseFloat(value) || 0;
        if (data.panel_id) {
            const panel: any = panels.find((c:any) => String(c.id) === String(data.panel_id));
            if (panel) setData('panel_qty', Math.ceil((power * 1000) / panel.power));
        }
        if (data.inverter_id) {
            const inv: any = inverters.find((c:any) => String(c.id) === String(data.inverter_id));
            const invPower = parseFloat(inv?.power);
            if (inv && !isNaN(invPower)) setData('inverter_qty', Math.max(1, Math.ceil(power / (invPower * 1.3))));
        }
    }, [data.panel_id, data.inverter_id, panels, inverters]);

    const onPanelSelect = useCallback((id: string) => {
        const power = parseFloat(String(data.power_kwp)) || 0;
        const panel: any = panels.find((c:any) => String(c.id) === id);
        const autoQty = panel && power ? Math.ceil((power * 1000) / panel.power) : 1;
        setData((d:any) => ({...d, panel_id: id, panel_qty: autoQty}));
    }, [data.power_kwp, panels]);

    const onInverterSelect = useCallback((id: string) => {
        const power = parseFloat(String(data.power_kwp)) || 0;
        const inv: any = inverters.find((c:any) => String(c.id) === id);
        const invPower = parseFloat(inv?.power);
        const qty = inv && power && !isNaN(invPower) ? Math.ceil(power / (invPower * 1.3)) : 1;
        setData((d:any) => ({...d, inverter_id: id, inverter_qty: Math.max(1, qty)}));
    }, [data.power_kwp, inverters]);

    useEffect(() => {
        if (!data.inverter_id) return;
        const inv: any = inverters.find((c:any) => String(c.id) === String(data.inverter_id));
        if (!inv) return;
        const systemOk  = !data.system_type  || !inv.system_type || inv.system_type === data.system_type;
        const networkOk = !data.network_type || !inv.grid_type   || inv.grid_type   === data.network_type;
        if (!systemOk || !networkOk) {
            setData((d: any) => ({ ...d, inverter_id: '', inverter_qty: 1 }));
        }
    }, [data.system_type, data.network_type, data.inverter_id]);

    useEffect(() => {
        if (itemsUserModified) return;
        const power = parseFloat(String(data.power_kwp)) || 0;
        setData('items', defaultItems(power, data.panel_qty) as any);
    }, [data.power_kwp, data.panel_qty, itemsUserModified]);

    useEffect(() => {
        if (preselectedClient) {
            setData('client_id', String(preselectedClient.id));
            setClientSearch(preselectedClient.name);
            setPreselectedHighlight(true);
            setTimeout(() => setPreselectedHighlight(false), 2000);
        }
    }, []);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as Element;
            if (!target.closest('.client-search-dropdown')) {
                setShowClientDropdown(false);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    const addItem = useCallback(() => {
        setData('items', [...data.items, { description:'', category:'material', quantity:1, unit_measure:'und', unit_price_cop:0, profit_percentage:0.15 }]);
        setItemsUserModified(true);
    }, [data.items]);

    const removeItem = useCallback((i: number) => {
        setData('items', data.items.filter((_,j)=>j!==i));
        setItemsUserModified(true);
    }, [data.items]);

    const setItem = useCallback((i: number, field: string, value: any) => {
        const next = [...data.items] as any[];
        next[i] = { ...next[i], [field]: value };
        setData('items', next as QuotationItem[]);
        setItemsUserModified(true);
    }, [data.items]);

    const validateStep1 = useCallback((): boolean => {
        const errors: Record<string, string> = {};
        if (!data.client_id) errors.client_id = 'Debes seleccionar un cliente';
        if (!data.project_name.trim()) errors.project_name = 'El nombre del proyecto es requerido';
        if (!data.system_type) errors.system_type = 'El tipo de sistema es requerido';
        if (!data.network_type) errors.network_type = 'El tipo de red es requerido';
        if (!data.power_kwp || parseFloat(data.power_kwp) <= 0) errors.power_kwp = 'La potencia debe ser mayor a 0';
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    }, [data]);

    const submit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return;
        setIsSubmitting(true);
        const payload = { ...data, products: buildProducts() };
        router.post(route('quotations.store'), payload as any, {
            onSuccess: () => {
                setIsSubmitting(false);
                showToast('Cotización creada exitosamente.', 'success');
            },
            onError: (errors: any) => {
                setIsSubmitting(false);
                showToast(errors?.message || 'Error al crear cotización.', 'error');
            },
        });
    }, [data, buildProducts, isSubmitting]);

    const inputCls = "w-full px-4 py-2.5 bg-[var(--surface)] border border-[var(--border-ui)] rounded-xl text-[var(--text-primary)] focus:border-[var(--solar-gold)] focus:ring focus:ring-[var(--solar-gold)]/20 transition-all text-sm [&>option]:bg-[var(--bg-content)]";
    const searchInputCls = "w-full pl-10 pr-10 py-2.5 bg-[var(--surface)] border border-[var(--border-ui)] rounded-xl text-[var(--text-primary)] focus:border-[var(--solar-gold)] focus:ring focus:ring-[var(--solar-gold)]/20 transition-all text-sm";
    const labelCls = "block text-xs font-semibold text-[var(--text-secondary)] font-outfit uppercase tracking-wider mb-1";

    return (
        <AuthenticatedLayout header="Nueva Cotización">
            <Head title="Nueva Cotización" />

            {/* Botón volver a lista */}
            <div className="mb-6">
                <a
                    href={route('quotations.index')}
                    className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all"
                >
                    ← Volver a Cotizaciones
                </a>
            </div>

            {/* Indicador de pasos */}
            <div className="flex items-center justify-center gap-2 mb-8">
                <button
                    onClick={() => setStep(1)}
                    type="button"
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-semibold transition-all ${
                        step === 1
                            ? 'bg-[var(--solar-gold)] text-slate-900 shadow-lg shadow-[var(--solar-gold)]/20'
                            : 'bg-[var(--surface)] text-[var(--text-secondary)] border border-[var(--border-ui)] hover:border-[var(--solar-gold)]/40'
                    }`}
                >
                    <span className={`w-7 h-7 rounded-full text-xs flex items-center justify-center font-bold ${step === 1 ? 'bg-slate-900/20' : step > 1 ? 'bg-emerald-500 text-white' : 'bg-slate-500/20'}`}>
                        {step > 1 ? '✓' : '1'}
                    </span>
                    <Settings className="w-4 h-4" />
                    <span className="hidden sm:inline">Configuración</span>
                </button>

                <div className={`w-8 h-1 rounded transition-all ${step === 2 ? 'bg-[var(--solar-gold)]' : 'bg-[var(--border-ui)]'}`} />

                <button
                    onClick={() => setStep(2)}
                    type="button"
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-semibold transition-all ${
                        step === 2
                            ? 'bg-[var(--solar-gold)] text-slate-900 shadow-lg shadow-[var(--solar-gold)]/20'
                            : 'bg-[var(--surface)] text-[var(--text-secondary)] border border-[var(--border-ui)] hover:border-[var(--solar-gold)]/40'
                    }`}
                >
                    <span className={`w-7 h-7 rounded-full text-xs flex items-center justify-center font-bold ${step === 2 ? 'bg-slate-900/20' : 'bg-slate-500/20'}`}>2</span>
                    <FileText className="w-4 h-4" />
                    <span className="hidden sm:inline">Cotización</span>
                </button>
            </div>

            <form id="quotation-form" onSubmit={submit} onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }} className="space-y-6">

                {/* PASO 1: CONFIGURACIÓN */}
                {step === 1 && (
                    <div className="space-y-6">
                        {/* Alerta de sobredimensionamiento */}
                        {overdimensioning.isWarning && (
                            <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                                <div>
                                    <h4 className="text-amber-500 font-bold text-sm">Alerta de Sobredimensionamiento</h4>
                                    <p className="text-amber-500/80 text-xs mt-1">
                                        Ratio DC/AC de <strong>{overdimensioning.ratio.toFixed(2)}x</strong>.
                                        Recomendado: máximo 1.30x ({overdimensioning.panelPower.toFixed(2)} kWp / {overdimensioning.inverterPower.toFixed(2)} kW).
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Sección: Cliente y Proyecto */}
                        <div className="glass rounded-2xl p-6 space-y-4">
                            <h2 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
                                <Sun className="w-5 h-5 text-[var(--solar-gold)]" /> Datos del Proyecto
                            </h2>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Buscador de cliente */}
                                <div className="lg:col-span-2 relative">
                                    <label className={labelCls}>Cliente *</label>
                                    <div className="relative">
                                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-secondary)] pointer-events-none" />
                                        <input
                                            type="text"
                                            className={`${searchInputCls} ${preselectedHighlight ? 'border-[var(--solar-gold)] ring-[var(--solar-gold)]/30' : ''}`}
                                            value={clientSearch}
                                            onChange={e => {
                                                setClientSearch(e.target.value);
                                                setShowClientDropdown(true);
                                                if (!e.target.value) setData('client_id', '');
                                            }}
                                            onFocus={() => setShowClientDropdown(true)}
                                            placeholder="Buscar por nombre, email o documento..."
                                        />
                                        {data.client_id && (
                                            <Check className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-400 pointer-events-none" />
                                        )}
                                    </div>
                                    {showClientDropdown && (
                                        <ul className="client-search-dropdown absolute z-50 w-full mt-1 bg-[var(--bg-content)] backdrop-blur-md border border-[var(--border-ui)] rounded-xl shadow-2xl max-h-60 overflow-y-auto custom-scrollbar">
                                            {filteredClients.length === 0 ? (
                                                <li className="px-4 py-3 text-sm text-[var(--text-secondary)]">No se encontraron clientes</li>
                                            ) : (
                                                <>
                                                    {filteredClients.map((c: any) => (
                                                        <li key={c.id}>
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setData('client_id', String(c.id));
                                                                    setClientSearch(c.name);
                                                                    setShowClientDropdown(false);
                                                                }}
                                                                className={`w-full text-left px-4 py-3 text-sm hover:bg-[var(--solar-gold)]/10 transition-all border-b border-[var(--border-ui)] last:border-0 ${data.client_id === String(c.id) ? 'bg-[var(--solar-gold)]/20' : ''}`}
                                                            >
                                                                <span className="font-semibold text-[var(--text-primary)]">{c.name}</span>
                                                                <span className="ml-2 text-xs text-[var(--text-secondary)]">
                                                                    {c.email && <span>{c.email}</span>}
                                                                    {c.document_number && <span> · {c.document_number}</span>}
                                                                    {c.energy_consumption_kwh && <span> · {c.energy_consumption_kwh} kWh/mes</span>}
                                                                </span>
                                                            </button>
                                                        </li>
                                                    ))}
                                                    <li className="px-4 py-2 text-xs text-[var(--text-secondary)]/60 border-t border-[var(--border-ui)] text-center">
                                                        {filteredClients.length} cliente{filteredClients.length !== 1 ? 's' : ''} encontrado{filteredClients.length !== 1 ? 's' : ''}
                                                    </li>
                                                </>
                                            )}
                                        </ul>
                                    )}
                                    {selectedClient && selectedClient.energy_consumption_kwh ? (() => {
                                        const kwh = selectedClient.energy_consumption_kwh;
                                        const suggested = Math.round((kwh / (4.5 * 30)) * 10) / 10;
                                        const coverage = ((suggested * 4.5 * 30) / kwh * 100).toFixed(0);
                                        return (
                                            <div className="mt-2 flex items-center gap-3 bg-[var(--solar-gold)]/8 border border-[var(--solar-gold)]/20 rounded-xl px-3 py-2 animate-slide-up">
                                                <span className="text-xs text-[var(--text-secondary)]">
                                                    Consumo: <strong className="text-[var(--solar-gold)]">{kwh} kWh/mes</strong>
                                                    <span className="mx-2">·</span>
                                                    Sistema sugerido: <strong className="text-[var(--solar-gold)]">{suggested} kWp</strong>
                                                    <span className="text-[var(--text-secondary)]/60 ml-1">(HSP 4.5, {coverage}% cobertura)</span>
                                                </span>
                                                <button type="button"
                                                    onClick={() => onPowerChange(String(suggested))}
                                                    className="ml-auto flex-shrink-0 text-xs font-bold px-3 py-1 rounded-lg bg-[var(--solar-gold)] text-slate-900 hover:brightness-110 transition-all">
                                                    Aplicar
                                                </button>
                                            </div>
                                        );
                                    })() : null}
                                    {validationErrors.client_id && (
                                        <p className="text-red-400 text-xs mt-2">{validationErrors.client_id}</p>
                                    )}
                                </div>

                                {/* Nombre del proyecto */}
                                <div className="lg:col-span-2">
                                    <label className={labelCls}>Nombre del Proyecto *</label>
                                    <input className={inputCls} value={data.project_name} onChange={e => setData('project_name', e.target.value)} placeholder="Ej: Sistema Solar Residencial Bogotá" />
                                    {validationErrors.project_name && (
                                        <p className="text-red-400 text-xs mt-1">{validationErrors.project_name}</p>
                                    )}
                                </div>

                                {/* Tipo de sistema */}
                                <div>
                                    <label className={labelCls}>Tipo de Sistema *</label>
                                    <select className={inputCls} value={data.system_type} onChange={e => setData('system_type', e.target.value)}>
                                        <option value="">Seleccionar…</option>
                                        {(system_types?.length > 0 ? system_types : ['On-grid','Off-grid','Híbrido']).map((s: string) => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                    {validationErrors.system_type && (
                                        <p className="text-red-400 text-xs mt-1">{validationErrors.system_type}</p>
                                    )}
                                </div>

                                {/* Tipo de red */}
                                <div>
                                    <label className={labelCls}>Tipo de Red *</label>
                                    <select className={inputCls} value={data.network_type} onChange={e => setData('network_type', e.target.value)}>
                                        <option value="">Seleccionar…</option>
                                        {[
                                            {value: 'monofasico', label: 'Monofásico'},
                                            {value: 'bifasico 220', label: 'Bifásico 220'},
                                            {value: 'trifasico 220', label: 'Trifásico 220'},
                                            {value: 'trifasico 440', label: 'Trifásico 440'},
                                        ].map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                                    </select>
                                    {validationErrors.network_type && (
                                        <p className="text-red-400 text-xs mt-1">{validationErrors.network_type}</p>
                                    )}
                                </div>

                                {/* Potencia */}
                                <div>
                                    <label className={labelCls}>Potencia (kWp) *</label>
                                    <input type="number" className={inputCls} value={data.power_kwp} onChange={e => onPowerChange(e.target.value)} placeholder="Ej: 5.5" min="0.1" step="0.1" />
                                    {validationErrors.power_kwp && (
                                        <p className="text-red-400 text-xs mt-1">{validationErrors.power_kwp}</p>
                                    )}
                                </div>

                                {/* Checkbox financiamiento */}
                                <div className="flex items-center">
                                    <input type="checkbox" id="financing" checked={data.requires_financing} onChange={e => setData('requires_financing', e.target.checked)} className="w-5 h-5 accent-[var(--solar-gold)] rounded" />
                                    <label htmlFor="financing" className="ml-3 text-sm text-[var(--text-primary)]">Cliente requiere financiamiento</label>
                                </div>
                            </div>
                        </div>

                        {/* Sección: Suministros */}
                        <div className="space-y-4">
                            <h2 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
                                <Cpu className="w-5 h-5 text-blue-400" /> Suministros del Sistema
                            </h2>

                            {/* Panel Solar */}
                            <div className="glass border border-[var(--solar-gold)]/20 rounded-2xl p-5 space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-[var(--solar-gold)]/10 border border-[var(--solar-gold)]/30 flex items-center justify-center">
                                        <Sun className="w-5 h-5 text-[var(--solar-gold)]" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-[var(--text-primary)]">Panel Solar</p>
                                        <p className="text-xs text-[var(--text-secondary)]">Módulo fotovoltaico principal</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className={labelCls}>Modelo</label>
                                        <select className={inputCls} value={data.panel_id} onChange={e => onPanelSelect(e.target.value)}>
                                            <option value="">Seleccionar panel…</option>
                                            {panels.map((c:any) => <option key={c.id} value={c.id}>{c.brand} {c.model} — {c.power}W</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className={labelCls}>Cantidad</label>
                                        <input type="number" className={inputCls} value={data.panel_qty} min="1" onChange={e => setData('panel_qty', e.target.value === '' ? '' : parseInt(e.target.value) || 1)} />
                                    </div>
                                </div>
                                {data.panel_id && (() => {
                                    const sel: any = panels.find((c:any) => String(c.id) === String(data.panel_id));
                                    const kwp = sel ? ((sel.power * data.panel_qty) / 1000).toFixed(2) : null;
                                    return kwp ? (
                                        <div className="flex items-center gap-2 text-xs bg-[var(--solar-gold)]/10 border border-[var(--solar-gold)]/20 rounded-xl px-3 py-2">
                                            <span className="text-[var(--solar-gold)] font-semibold">⚡ {data.panel_qty} × {sel.power}W = {kwp} kWp</span>
                                        </div>
                                    ) : null;
                                })()}
                            </div>

                            {/* Inversor */}
                            <div className="glass border border-blue-500/20 rounded-2xl p-5 space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                                        <Cpu className="w-5 h-5 text-blue-400" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-[var(--text-primary)]">Inversor</p>
                                        <p className="text-xs text-[var(--text-secondary)]">
                                            {data.system_type && <span className="text-blue-400 font-semibold">{data.system_type}</span>}
                                            {data.network_type && <span className="text-blue-400 font-semibold ml-1">· {data.network_type}</span>}
                                        </p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className={labelCls}>Modelo</label>
                                        <select
                                            className={`${inputCls} ${(!data.system_type || !data.network_type) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            value={data.inverter_id}
                                            onChange={e => onInverterSelect(e.target.value)}
                                            disabled={!data.system_type || !data.network_type}
                                        >
                                            <option value="">Seleccionar inversor…</option>
                                            {inverters
                                                .filter((inv: any) =>
                                                    (!data.system_type  || !inv.system_type || inv.system_type === data.system_type) &&
                                                    (!data.network_type || !inv.grid_type   || inv.grid_type   === data.network_type)
                                                )
                                                .map((c: any) => (
                                                    <option key={c.id} value={c.id}>{c.brand} {c.model} — {c.power} kW</option>
                                                ))
                                            }
                                        </select>
                                        {!data.system_type || !data.network_type ? (
                                            <p className="text-amber-400 text-xs mt-1 flex items-center gap-1">
                                                <AlertCircle className="h-3 w-3" />
                                                Selecciona primero Tipo de Sistema y Tipo de Red
                                            </p>
                                        ) : inverters.filter((inv: any) => (!data.system_type || !inv.system_type || inv.system_type === data.system_type) && (!data.network_type || !inv.grid_type || inv.grid_type === data.network_type)).length === 0 && (
                                            <p className="text-amber-400 text-xs mt-1">No hay inversores compatibles con esta configuración</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className={labelCls}>Cantidad</label>
                                        <input type="number" className={inputCls} value={data.inverter_qty} min="1" onChange={e => setData('inverter_qty', e.target.value === '' ? '' : parseInt(e.target.value) || 1)} />
                                    </div>
                                </div>
                                {data.inverter_id && (() => {
                                    const sel: any = inverters.find((c:any) => String(c.id) === String(data.inverter_id));
                                    const qty = Number(data.inverter_qty);
                                    const power = parseFloat(sel?.power);
                                    return sel && !isNaN(qty) && !isNaN(power) ? (
                                        <div className="flex items-center gap-2 text-xs bg-blue-500/10 border border-blue-500/20 rounded-xl px-3 py-2">
                                            <span className="text-blue-400 font-semibold">⚡ {qty} × {sel.power}kW = {(qty * power).toFixed(1)} kW</span>
                                        </div>
                                    ) : null;
                                })()}
                            </div>

                            {/* Batería */}
                            {needsBattery && (
                                <div className="glass border border-emerald-500/20 rounded-2xl p-5 space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                            <Battery className="w-5 h-5 text-emerald-400" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-[var(--text-primary)]">Batería</p>
                                            <p className="text-xs text-emerald-400">Requerida para {data.system_type}</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className={labelCls}>Modelo</label>
                                            <select className={inputCls} value={data.battery_id} onChange={e => setData('battery_id', e.target.value)}>
                                                <option value="">Seleccionar batería…</option>
                                                {batteries.map((c:any) => <option key={c.id} value={c.id}>{c.brand} {c.model} — {c.capacity}Ah</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className={labelCls}>Cantidad</label>
                                            <input type="number" className={inputCls} value={data.battery_qty} min="1" onChange={e => setData('battery_qty', e.target.value === '' ? '' : parseInt(e.target.value) || 1)} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Panel de análisis */}
                            {data.panel_qty > 0 && data.inverter_qty > 0 && data.panel_id && data.inverter_id && (
                                <SystemAnalysisPanel
                                    panelId={data.panel_id}
                                    inverterId={data.inverter_id}
                                    panelQty={data.panel_qty}
                                    inverterQty={data.inverter_qty}
                                    powerKwp={data.power_kwp}
                                    panels={panels}
                                    inverters={inverters}
                                />
                            )}

                            {/* Estimador de Ahorro */}
                            {data.panel_qty > 0 && data.panel_id && (
                                <SavingsEstimator
                                    powerKwp={data.power_kwp}
                                    panelQty={data.panel_qty}
                                    panelPower={panels.find((p: any) => String(p.id) === String(data.panel_id))?.power || 0}
                                    consumptionKwh={selectedClient?.energy_consumption_kwh}
                                    energyTariff={selectedClient?.energy_tariff}
                                />
                            )}
                        </div>
                    </div>
                )}

                {/* PASO 2: COTIZACIÓN */}
                {step === 2 && (
                    <div className="space-y-6">
                        {/* Ítems Complementarios */}
                        <div className="glass rounded-2xl p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
                                    <Wrench className="w-5 h-5 text-[var(--solar-gold)]" /> Ítems Complementarios
                                </h2>
                                <button type="button" onClick={addItem}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--solar-gold)]/10 border border-[var(--solar-gold)]/30 text-[var(--solar-gold)] text-sm font-semibold hover:bg-[var(--solar-gold)]/20 transition-all">
                                    <Plus className="w-4 h-4" /> Agregar ítem
                                </button>
                            </div>

                            <div className="space-y-3">
                                {data.items.map((item, i) => (
                                    <div key={i} className="bg-[var(--surface)] border border-[var(--border-ui)] rounded-2xl p-4 space-y-3">
                                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                                            <div className="sm:col-span-4">
                                                <label className={labelCls}>Descripción</label>
                                                <input className={inputCls} value={item.description} onChange={e => setItem(i,'description',e.target.value)} placeholder="Ej: Mano de obra" />
                                            </div>
                                            <div className="sm:col-span-2">
                                                <label className={labelCls}>Categoría</label>
                                                <select className={inputCls} value={item.category} onChange={e => setItem(i,'category',e.target.value)}>
                                                    {ITEM_CATEGORIES.map(c => <option key={c} value={c}>{ITEM_CATEGORY_LABELS[c] || c}</option>)}
                                                </select>
                                            </div>
                                            <div className="sm:col-span-1">
                                                <label className={labelCls}>Cantidad</label>
                                                <input type="number" className={inputCls} value={item.quantity} min="0" step="0.01" onChange={e => setItem(i,'quantity',parseFloat(e.target.value)||0)} />
                                            </div>
                                            <div className="sm:col-span-1">
                                                <label className={labelCls}>Unidad</label>
                                                <select className={inputCls} value={item.unit_measure} onChange={e => setItem(i,'unit_measure',e.target.value)}>
                                                    {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                                                </select>
                                            </div>
                                            <div className="sm:col-span-2">
                                                <label className={labelCls}>Precio Unit.</label>
                                                <input type="number" className={inputCls} value={item.unit_price_cop} min="0" onChange={e => setItem(i,'unit_price_cop',parseFloat(e.target.value)||0)} />
                                            </div>
                                            <div className="sm:col-span-1">
                                                <label className={labelCls}>% Util.</label>
                                                <input type="number" className={inputCls} value={Math.round(item.profit_percentage*100)} min="0" max="100" onChange={e => setItem(i,'profit_percentage',(parseFloat(e.target.value)||0)/100)} />
                                            </div>
                                            <div className="sm:col-span-1 flex items-end justify-end pb-0.5">
                                                <button type="button" onClick={() => removeItem(i)} className="p-2 rounded-xl text-[var(--text-secondary)] hover:text-red-400 hover:bg-red-500/10 transition-all">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="text-xs text-right text-[var(--text-secondary)]">
                                            Total: <strong className="text-[var(--solar-gold)]">{fmt(item.quantity * item.unit_price_cop * (1+item.profit_percentage))}</strong>
                                        </div>
                                    </div>
                                ))}
                                {data.items.length === 0 && (
                                    <p className="text-center text-[var(--text-secondary)] py-8 text-sm">No hay ítems. Agrega mano de obra, materiales o servicios.</p>
                                )}
                            </div>
                        </div>

                        {/* Porcentajes */}
                        <div className="glass rounded-2xl p-6 space-y-4">
                            <h2 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
                                <Calculator className="w-5 h-5 text-[var(--solar-gold)]" /> Porcentajes de Cálculo
                            </h2>

                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                                {[
                                    { field:'profit_percentage', label:'Utilidad' },
                                    { field:'iva_profit_percentage', label:'IVA Util.' },
                                    { field:'commercial_management_percentage', label:'Gest. Com.' },
                                    { field:'administration_percentage', label:'Admin.' },
                                    { field:'contingency_percentage', label:'Imprev.' },
                                    { field:'withholding_percentage', label:'Retenc.' },
                                ].map(({ field, label }) => (
                                    <div key={field}>
                                        <label className={labelCls}>{label}</label>
                                        <input type="number" className={inputCls}
                                            value={parseFloat(((data as any)[field]*100).toFixed(2))}
                                            min="0" max="100" step="0.1"
                                            onChange={e => setData(field as any, (parseFloat(e.target.value)||0)/100)} />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Resumen Financiero */}
                        <div className="glass rounded-2xl p-6 space-y-4">
                            <h2 className="text-lg font-bold text-[var(--text-primary)]">Resumen Financiero</h2>

                            <div className="space-y-1">
                                {[
                                    { label:'Subtotal equipos + ítems', value: totals.sub },
                                    { label:'Gestión Comercial', value: totals.cm },
                                    { label:'Subtotal', value: totals.s2, bold: true },
                                    { label:'Administración', value: totals.adm },
                                    { label:'Imprevistos', value: totals.cnt },
                                    { label:'Utilidad', value: totals.prf },
                                    { label:'IVA sobre Utilidad', value: totals.piv },
                                    { label:'Total', value: totals.total, bold: true, highlight: true },
                                ].map(({ label, value, bold, highlight }) => (
                                    <div key={label} className={`flex justify-between py-2 px-4 rounded-xl text-sm ${
                                        highlight ? 'bg-[var(--solar-gold)]/10 border border-[var(--solar-gold)]/20' :
                                        bold ? 'bg-[var(--surface)] border border-[var(--border-ui)]' : ''
                                    }`}>
                                        <span className={bold ? 'font-bold text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}>{label}</span>
                                        <span className={`${bold ? 'font-bold text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'} ${highlight ? 'text-[var(--solar-gold)]' : ''}`}>{fmt(value)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </form>

            {/* Botones de navegación */}
            <div className="flex justify-between mt-8">
                <button
                    type="button"
                    onClick={() => setStep(Math.max(1, step - 1))}
                    disabled={step === 1}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                        step === 1
                            ? 'bg-[var(--surface)] text-[var(--text-secondary)] opacity-30 cursor-not-allowed border border-dashed border-[var(--border-ui)]'
                            : 'bg-[var(--surface)] border border-[var(--border-ui)] text-[var(--text-primary)] hover:border-[var(--solar-gold)]/40'
                    }`}
                >
                    ← Volver a Configuración
                </button>

                {step < 2 ? (
                    <button
                        type="button"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (validateStep1()) {
                                setStep(2);
                            }
                        }}
                        className="flex items-center gap-2 px-8 py-3 rounded-xl bg-[var(--solar-gold)] text-slate-900 font-semibold hover:brightness-110 transition-all"
                    >
                        Siguiente: Cotización →
                    </button>
                ) : (
                    <button
                        type="submit"
                        form="quotation-form"
                        disabled={processing || isSubmitting}
                        className={`flex items-center gap-2 px-8 py-3 rounded-xl font-semibold transition-all ${
                            processing || isSubmitting
                                ? 'bg-emerald-500/50 text-white cursor-not-allowed'
                                : 'bg-emerald-500 text-white hover:brightness-110'
                        }`}
                    >
                        <Save className="w-5 h-5" />
                        {processing || isSubmitting ? 'Guardando...' : 'Registrar Cotización'}
                    </button>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
