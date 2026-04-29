import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { showToast } from '@/Components/Toast';
import { useState, useMemo, useRef, useEffect } from 'react';
import { FileText, Download, ArrowLeft, Sun, Cpu, Battery, Wrench, CheckCircle, Calculator, User, MapPin, Save, RotateCcw, AlertCircle, ChevronDown, Pencil, Clock, Lock, Zap, Activity, TrendingUp, TrendingDown, Info, Box, Wallet, X, RefreshCw } from 'lucide-react';

const STATUSES = ['Borrador','Enviada','Aprobada','Rechazada','Vencida'] as const;

function fmt(v: number) {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(v || 0);
}

export default function Show({ quotation, allowedStatuses, isStatusLocked, catalogPanels, catalogInverters, catalogBatteries }: any) {
    const [localData, setLocalData] = useState({
        ...quotation,
        products: [...(quotation.products || [])],
        items: [...(quotation.items || [])]
    });

    // Modal para cambiar productos
    const [productModal, setProductModal] = useState<{
        open: boolean;
        productType: 'panel' | 'inverter' | 'battery' | null;
        productId: number | null;
        isNew?: boolean;
    }>({ open: false, productType: null, productId: null });

    const [editingCell, setEditingCell] = useState<{ section: string, id: number | string, field: string } | null>(null);
    const [hasChanges, setHasChanges] = useState(false);
    const [editingInfo, setEditingInfo] = useState(false);
    const [statusMenuOpen, setStatusMenuOpen] = useState(false);
    const [statusNotes, setStatusNotes] = useState('');
    const [processing, setProcessing] = useState(false);
    const statusRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const h = (e: MouseEvent) => {
            if (statusRef.current && !statusRef.current.contains(e.target as Node)) setStatusMenuOpen(false);
        };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Aprobada': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
            case 'Enviada': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            case 'Borrador': return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
            case 'Rechazada': return 'bg-red-500/20 text-red-400 border-red-500/30';
            case 'Vencida': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
            default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
        }
    };

    const totals = useMemo(() => {
        let subtotal = 0;
        localData.products.forEach((p: any) => {
            subtotal += (p.quantity * p.unit_price_cop) * (1 + p.profit_percentage);
        });
        localData.items.forEach((i: any) => {
            subtotal += (i.quantity * i.unit_price_cop) * (1 + i.profit_percentage);
        });

        const commercial_management = subtotal * localData.commercial_management_percentage;
        const subtotal2 = subtotal + commercial_management;

        const administration = subtotal2 * localData.administration_percentage;
        const contingency = subtotal2 * localData.contingency_percentage;
        const profit = subtotal2 * localData.profit_percentage;
        const profit_iva = profit * localData.iva_profit_percentage;

        const subtotal3 = subtotal2 + administration + contingency + profit + profit_iva;
        const withholdings = subtotal3 * localData.withholding_percentage;
        const total_value = subtotal3 + withholdings;

        return {
            subtotal,
            commercial_management,
            subtotal2,
            administration,
            contingency,
            profit,
            profit_iva,
            subtotal3,
            withholdings,
            total_value
        };
    }, [localData]);

    const handleEdit = (section: string, id: number | string, field: string) => {
        setEditingCell({ section, id, field });
    };

    const handleChange = (section: string, id: number | string, field: string, value: any) => {
        setHasChanges(true);
        if (section === 'products') {
            setLocalData((prev: any) => ({
                ...prev,
                products: prev.products.map((p: any) => p.id === id ? { ...p, [field]: parseFloat(value) || 0 } : p)
            }));
        } else if (section === 'items') {
            setLocalData((prev: any) => ({
                ...prev,
                items: prev.items.map((i: any) => i.id === id ? { ...i, [field]: field === 'description' ? value : (parseFloat(value) || 0) } : i)
            }));
        } else if (section === 'summary') {
            setLocalData((prev: any) => ({
                ...prev,
                [field]: parseFloat(value) || 0
            }));
        } else if (section === 'info') {
            // For 'info', the `id` param carries the field name
            setLocalData((prev: any) => {
                const updated = { ...prev, [id]: value };
                // Recalcular cuando cambia power_kwp
                if (id === 'power_kwp') {
                    const newPower = parseFloat(value) || 0;

                    // 1. Recalcular cantidad de paneles
                    const panel = prev.products?.find((p: any) => p.product_type === 'panel');
                    if (panel && panel.snapshot_specs?.power) {
                        const newQty = Math.round((newPower * 1000) / panel.snapshot_specs.power);
                        updated.products = prev.products.map((p: any) =>
                            p.id === panel.id ? { ...p, quantity: Math.max(1, newQty) } : p
                        );
                    }

                    // 2. Recalcular cantidad de inversores según potencia
                    const inverter = prev.products?.find((p: any) => p.product_type === 'inverter');
                    if (inverter && inverter.snapshot_specs?.power) {
                        const newQty = Math.round(newPower / inverter.snapshot_specs.power);
                        updated.products = updated.products.map((p: any) =>
                            p.id === inverter.id ? { ...p, quantity: Math.max(1, newQty) } : p
                        );
                    }

                    // 3. Actualizar items material_electrico y mano_obra
                    updated.items = prev.items.map((item: any) => {
                        if (item.category === 'material_electrico' || item.category === 'mano_obra') {
                            return { ...item, quantity: newPower };
                        }
                        return item;
                    });
                }

                // Verificar compatibilidad del inversor cuando cambia system_type o network_type
                if (id === 'system_type' || id === 'network_type') {
                    const inverter = prev.products?.find((p: any) => p.product_type === 'inverter');
                    if (inverter) {
                        // Buscar si hay un inversor compatible con el nuevo tipo
                        const compatibleInverter = catalogInverters?.find((inv: any) => {
                            const newSystemType = id === 'system_type' ? value : prev.system_type;
                            const newNetworkType = id === 'network_type' ? value : prev.network_type;
                            const matchSystem = !inv.system_type ||
                                inv.system_type === newSystemType ||
                                inv.system_type === 'Híbrido';
                            const matchGrid = !inv.grid_type || inv.grid_type === newNetworkType;
                            return matchSystem && matchGrid;
                        });

                        if (!compatibleInverter) {
                            // Remover inversor incompatible
                            updated.products = prev.products.filter((p: any) => p.product_type !== 'inverter');
                            showToast('El inversor anterior no es compatible. Por favor seleccione uno nuevo.', 'warning');
                        } else if (inverter.snapshot_brand !== compatibleInverter.brand ||
                                   inverter.snapshot_model !== compatibleInverter.model) {
                            // Actualizar inversor al primero compatible
                            updated.products = prev.products.map((p: any) => {
                                if (p.product_type === 'inverter') {
                                    return {
                                        ...p,
                                        product_id: compatibleInverter.id,
                                        snapshot_brand: compatibleInverter.brand,
                                        snapshot_model: compatibleInverter.model,
                                        snapshot_specs: { power: compatibleInverter.power },
                                        unit_price_cop: compatibleInverter.price
                                    };
                                }
                                return p;
                            });
                        }
                    }
                }
                return updated;
            });
        }
    };

    // Abrir modal para cambiar producto
    const openProductModal = (productType: 'panel' | 'inverter' | 'battery', productId: number) => {
        setProductModal({ open: true, productType, productId });
    };

    // Cambiar producto seleccionado o agregar nuevo
    const handleProductChange = (newProductId: number) => {
        if (!productModal.productType) return;

        const catalogs: any = {
            panel: catalogPanels,
            inverter: catalogInverters,
            battery: catalogBatteries
        };

        const newProduct = catalogs[productModal.productType]?.find((p: any) => p.id === newProductId);
        if (!newProduct) return;

        // Si es un producto nuevo (agregar)
        if (productModal.isNew) {
            const newId = `temp_${Date.now()}`;
            let quantity = 1;
            if (productModal.productType === 'panel') {
                quantity = Math.max(1, Math.round((localData.power_kwp * 1000) / newProduct.power));
            } else if (productModal.productType === 'inverter') {
                quantity = Math.max(1, Math.round(localData.power_kwp / newProduct.power));
            }

            const newProductEntry = {
                id: newId,
                product_id: newProduct.id,
                product_type: productModal.productType,
                snapshot_brand: newProduct.brand,
                snapshot_model: newProduct.model,
                snapshot_specs: { power: newProduct.power || newProduct.capacity },
                quantity,
                unit_price_cop: newProduct.price,
                profit_percentage: 0.15
            };

            setLocalData((prev: any) => ({
                ...prev,
                products: [...prev.products, newProductEntry]
            }));
            setHasChanges(true);
            setProductModal({ open: false, productType: null, productId: null, isNew: undefined });
            showToast('Producto agregado.', 'success');
            return;
        }

        // Editar producto existente
        setLocalData((prev: any) => ({
            ...prev,
            products: prev.products.map((p: any) => {
                if (p.id === productModal.productId) {
                    let newQty = p.quantity;
                    if (productModal.productType === 'panel') {
                        newQty = Math.round((prev.power_kwp * 1000) / newProduct.power);
                    } else if (productModal.productType === 'inverter') {
                        newQty = Math.round(prev.power_kwp / newProduct.power);
                    }
                    return {
                        ...p,
                        product_id: newProduct.id,
                        snapshot_brand: newProduct.brand,
                        snapshot_model: newProduct.model,
                        snapshot_specs: { power: newProduct.power },
                        unit_price_cop: newProduct.price,
                        quantity: Math.max(1, newQty)
                    };
                }
                return p;
            })
        }));

        setHasChanges(true);
        setProductModal({ open: false, productType: null, productId: null, isNew: undefined });
        showToast('Producto actualizado.', 'success');
    };

    // Abrir modal para agregar nuevo producto
    const openAddProductModal = (productType: 'panel' | 'inverter' | 'battery') => {
        setProductModal({ open: true, productType, productId: null, isNew: true });
    };

    const handleStatusChange = (newStatus: string) => {
        const prev = localData.status;
        setStatusMenuOpen(false);
        setLocalData((d: any) => ({ ...d, status: newStatus }));
        router.patch(route('quotations.updateStatus', quotation.id), { status: newStatus, notes: statusNotes || null }, {
            onSuccess: () => {
                setStatusNotes('');
                showToast('Estado actualizado.', 'success');
            },
            onError: (errors: any) => {
                setLocalData((d: any) => ({ ...d, status: prev }));
                showToast(errors?.status || 'Error al actualizar estado.', 'error');
            },
        });
    };

    const handleSave = () => {
        setProcessing(true);
        router.put(route('quotations.update', quotation.id), { ...localData, ...totals } as any, {
            onSuccess: () => {
                setHasChanges(false);
                setEditingCell(null);
                setEditingInfo(false);
                setProcessing(false);
                showToast('Cotización actualizada.', 'success');
            },
            onError: (errors: any) => {
                setProcessing(false);
                showToast(errors?.message || 'Error al actualizar.', 'error');
            },
        });
    };

    const handleDiscard = () => {
        setLocalData({ ...quotation, products: [...(quotation.products || [])], items: [...(quotation.items || [])] });
        setHasChanges(false);
        setEditingCell(null);
        setEditingInfo(false);
    };

    const EditableCell = ({ value, section, id, field, type = "number", suffix = "", prefix = "", fmtFn = (v: any) => v }: any) => {
        const isEditing = editingCell?.section === section && editingCell?.id === id && editingCell?.field === field;

        if (isEditing) {
            return (
                <input
                    autoFocus
                    type={type}
                    step="any"
                    className="w-full bg-[var(--bg-content)] border-[var(--solar-gold)] rounded px-2 py-1 text-right focus:ring-1 focus:ring-[var(--solar-gold)] outline-none"
                    value={value}
                    onChange={(e) => handleChange(section, id, field, e.target.value)}
                    onBlur={() => setEditingCell(null)}
                    onKeyDown={(e) => e.key === 'Enter' && setEditingCell(null)}
                />
            );
        }

        return (
            <div
                onDoubleClick={() => handleEdit(section, id, field)}
                className="cursor-pointer hover:bg-[var(--solar-gold)]/5 rounded px-2 py-1 transition-colors"
            >
                {prefix}{fmtFn(value)}{suffix}
            </div>
        );
    };

    const overdimensioning = useMemo(() => {
        let panelPower = 0;
        let inverterPower = 0;

        localData.products.forEach((p: any) => {
            const power = p.snapshot_specs?.power || 0;
            if (p.product_type === 'panel') {
                panelPower += (p.quantity * power) / 1000; // W to kW
            } else if (p.product_type === 'inverter') {
                inverterPower += (p.quantity * power); // Inverters are already in kW
            }
        });

        const ratio = inverterPower > 0 ? panelPower / inverterPower : 0;
        const maxSafePower = inverterPower * 1.3; // Potencia máxima sin sobredimensionar

        return {
            panelPower,
            inverterPower,
            ratio,
            isWarning: ratio > 1.3,
            isLow: ratio < 1.0 && ratio > 0,
            maxSafePower
        };
    }, [localData.products]);

    // Especificaciones técnicas calculadas
    // Factores para Colombia (Caribe colombiano)
    // HSP: Horas Solar Pico = 4.5 h/día promedio
    // PR: Performance Ratio = 0.80 (considerando pérdidas por temp, cables, polvo, etc.)
    const COLOMBIA_HSP = 4.5; // h/día promedio
    const COLOMBIA_PR = 0.80; // Performance Ratio típico
    const DAYS_PER_MONTH = 30.4; // Promedio días por mes
    const DEFAULT_TARIFF = 1000; // Tarifa por defecto COP/kWh si no hay datos del cliente

    const specs = useMemo(() => {
        const panelCount = localData.products
            .filter((p: any) => p.product_type === 'panel')
            .reduce((sum: number, p: any) => sum + p.quantity, 0);

        const avgPanelPower = localData.products
            .filter((p: any) => p.product_type === 'panel')[0]?.snapshot_specs?.power || 500;

        // Cálculos de generación solar
        // E_día = P_pico × HSP × PR (kWh/día)
        const dailyProduction = localData.power_kwp * COLOMBIA_HSP * COLOMBIA_PR;
        // E_mes = P_pico × HSP × PR × d_m (kWh/mes)
        const monthlyProduction = dailyProduction * DAYS_PER_MONTH;
        // E_año = P_pico × HSP × PR × 365 (kWh/año)
        const yearlyProduction = dailyProduction * 365;
        // Área estimada: cada panel ocupa aproximadamente 2 m²
        const areaM2 = panelCount * 2;

        // Tarifa de energía del cliente (COP/kWh)
        const energyTariff = quotation.client?.energy_tariff || DEFAULT_TARIFF;

        // Ahorro calculado
        const monthlySavings = monthlyProduction * energyTariff;
        const yearlySavings = yearlyProduction * energyTariff;

        return {
            panelCount,
            avgPanelPower,
            dailyProduction,
            monthlyProduction,
            yearlyProduction,
            areaM2,
            colHsp: COLOMBIA_HSP,
            colPr: COLOMBIA_PR,
            energyTariff,
            monthlySavings,
            yearlySavings
        };
    }, [localData.power_kwp, localData.products, quotation.client?.energy_tariff]);

    const sectionCls = "glass rounded-2xl p-6 md:p-8 space-y-6";

    return (
        <AuthenticatedLayout header={`Cotización ${quotation.code}`}>
            <Head title={`Cotización ${quotation.code}`} />
            {/* Header Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-3">
                    <Link href={route('quotations.index')} className="p-2 rounded-xl bg-[var(--surface)] text-[var(--text-secondary)] hover:text-[var(--solar-gold)] hover:bg-[var(--solar-gold)]/10 transition-all">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-3">
                            {quotation.code}
                            {/* Status dropdown */}
                            <div className="relative" ref={statusRef}>
                                <button
                                    onClick={() => !isStatusLocked && setStatusMenuOpen(o => !o)}
                                    disabled={isStatusLocked}
                                    title={isStatusLocked ? `Estado '${localData.status}' bloqueado — no se permiten cambios` : 'Cambiar estado'}
                                    className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border transition-all ${
                                        isStatusLocked
                                            ? `${getStatusColor(localData.status)} opacity-80 cursor-not-allowed`
                                            : `${getStatusColor(localData.status)} hover:brightness-110 cursor-pointer`
                                    }`}
                                >
                                    {localData.status}
                                    {isStatusLocked ? <Lock className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                </button>
                                {statusMenuOpen && (
                                    <div className="absolute top-full left-0 mt-1 z-50 glass rounded-xl border border-[var(--border-ui)] shadow-xl overflow-hidden min-w-[200px]">
                                        {/* Notes input */}
                                        <div className="p-3 border-b border-[var(--border-ui)]">
                                            <p className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider mb-1">Nota del cambio (opcional)</p>
                                            <input
                                                className="w-full px-2 py-1 text-xs bg-[var(--surface)] border border-[var(--border-ui)] rounded-lg text-[var(--text-primary)] focus:border-[var(--solar-gold)] outline-none"
                                                placeholder="Ej: Cliente confirmó por email…"
                                                value={statusNotes}
                                                onChange={e => setStatusNotes(e.target.value)}
                                            />
                                        </div>
                                        {/* Allowed transitions */}
                                        {allowedStatuses.length > 0 ? allowedStatuses.map((s: string) => (
                                            <button
                                                key={s}
                                                onClick={() => handleStatusChange(s)}
                                                className="w-full text-left px-4 py-2.5 text-xs font-semibold transition-colors hover:bg-[var(--solar-gold)]/10 text-[var(--text-primary)] flex items-center gap-2"
                                            >
                                                <span className={`w-2 h-2 rounded-full ${
                                                    s === 'Aprobada' ? 'bg-emerald-400' :
                                                    s === 'Enviada'  ? 'bg-blue-400' :
                                                    s === 'Rechazada'? 'bg-red-400' :
                                                    s === 'Vencida'  ? 'bg-amber-400' : 'bg-slate-400'
                                                }`} />
                                                {s}
                                            </button>
                                        )) : (
                                            <p className="px-4 py-3 text-xs text-[var(--text-secondary)]">No hay transiciones disponibles.</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </h1>
                        <p className="text-sm text-[var(--text-secondary)]">{localData.project_name}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {hasChanges ? (
                        <>
                            <button onClick={handleDiscard} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-500/10 text-slate-400 border border-slate-500/20 hover:bg-slate-500/20 transition-all text-sm font-semibold">
                                <RotateCcw className="w-4 h-4" /> Descartar
                            </button>
                            <button onClick={handleSave} disabled={processing} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 text-white font-semibold hover:brightness-110 transition-all text-sm shadow-lg shadow-emerald-500/20">
                                <Save className="w-4 h-4" /> {processing ? 'Guardando...' : 'Guardar Cambios'}
                            </button>
                        </>
                    ) : (
                        <a
                            href={`${route('quotations.pdf', quotation.id)}?t=${new Date().getTime()}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--surface)] border border-[var(--border-ui)] text-[var(--text-primary)] hover:border-[var(--solar-gold)]/40 transition-all text-sm font-semibold"
                        >
                            <Download className="w-4 h-4" /> Propuesta PDF
                        </a>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Column: Details */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Alerts Section */}
                    {(overdimensioning.isWarning || overdimensioning.isLow) && (
                        <div className={`rounded-2xl p-4 flex items-start gap-3 ${
                            overdimensioning.isWarning
                                ? 'bg-red-500/10 border border-red-500/20 animate-pulse'
                                : 'bg-blue-500/10 border border-blue-500/20'
                        }`}>
                            {overdimensioning.isWarning ? (
                                <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                            ) : (
                                <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                            )}
                            <div>
                                <h4 className={`font-bold text-sm ${
                                    overdimensioning.isWarning ? 'text-red-400' : 'text-blue-400'
                                }`}>
                                    {overdimensioning.isWarning ? '⚠️ Sobredimensionamiento Detectado' : 'ℹ️ Subdimensionamiento'}
                                </h4>
                                <p className={`text-xs mt-1 ${
                                    overdimensioning.isWarning ? 'text-red-400/80' : 'text-blue-400/80'
                                }`}>
                                    {overdimensioning.isWarning ? (
                                        <>
                                            Relación <strong>{overdimensioning.ratio.toFixed(2)}x</strong> —
                                            La potencia de paneles ({overdimensioning.panelPower.toFixed(2)} kWp)
                                            excede la capacidad del inversor ({overdimensioning.inverterPower.toFixed(1)} kW).
                                        </>
                                    ) : (
                                        <>
                                            Relación <strong>{overdimensioning.ratio.toFixed(2)}x</strong> —
                                            El sistema tiene capacidad de inversor disponible.
                                        </>
                                    )}
                                </p>
                                <div className={`mt-2 p-2 rounded-lg text-xs ${
                                    overdimensioning.isWarning
                                        ? 'bg-red-500/10 text-red-400/90'
                                        : 'bg-blue-500/10 text-blue-400/90'
                                }`}>
                                    💡 {overdimensioning.isWarning ? (
                                        <>Considere aumentar la capacidad de inversores o reducir la cantidad de paneles.</>
                                    ) : (
                                        <>Puede aumentar la potencia hasta <strong>{overdimensioning.maxSafePower.toFixed(1)} kWp</strong> sin sobredimensionar.</>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Sin productos para ratio */}
                    {overdimensioning.ratio === 0 && localData.products.length > 0 && (
                        <div className="bg-slate-500/10 border border-slate-500/20 rounded-2xl p-4 flex items-center gap-3">
                            <Info className="w-5 h-5 text-slate-400 flex-shrink-0" />
                            <div>
                                <p className="text-sm text-slate-400">No hay paneles o inversores para calcular el ratio de dimensionamiento.</p>
                            </div>
                        </div>
                    )}

                    {/* General Info */}
                    <div className={sectionCls}>
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2 text-lg font-bold text-[var(--text-primary)]">
                                <FileText className="w-5 h-5 text-[var(--solar-gold)]" /> Información General
                            </div>
                            <button
                                onClick={() => { setEditingInfo(e => !e); if (!editingInfo) setHasChanges(true); }}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                                    editingInfo
                                        ? 'bg-[var(--solar-gold)]/10 border-[var(--solar-gold)]/40 text-[var(--solar-gold)]'
                                        : 'bg-[var(--surface)] border-[var(--border-ui)] text-[var(--text-secondary)] hover:border-[var(--solar-gold)]/40'
                                }`}
                            >
                                <Pencil className="w-3 h-3" /> {editingInfo ? 'Editando…' : 'Editar'}
                            </button>
                        </div>

                        {editingInfo ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wider mb-1">Nombre del Proyecto</p>
                                    <input
                                        className="w-full px-3 py-2 bg-[var(--surface)] border border-[var(--border-ui)] rounded-xl text-[var(--text-primary)] focus:border-[var(--solar-gold)] focus:ring focus:ring-[var(--solar-gold)]/20 transition-all text-sm"
                                        value={localData.project_name}
                                        onChange={e => handleChange('info','project_name','project_name', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wider mb-1">Tipo de Sistema</p>
                                    <select
                                        className="w-full px-3 py-2 bg-[var(--surface)] border border-[var(--border-ui)] rounded-xl text-[var(--text-primary)] focus:border-[var(--solar-gold)] focus:ring focus:ring-[var(--solar-gold)]/20 transition-all text-sm [&>option]:bg-[var(--bg-content)]"
                                        value={localData.system_type}
                                        onChange={e => handleChange('info','system_type','system_type', e.target.value)}
                                    >
                                        {['On-grid','Off-grid','Híbrido'].map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wider mb-1">Tipo de Red</p>
                                    <select
                                        className="w-full px-3 py-2 bg-[var(--surface)] border border-[var(--border-ui)] rounded-xl text-[var(--text-primary)] focus:border-[var(--solar-gold)] focus:ring focus:ring-[var(--solar-gold)]/20 transition-all text-sm [&>option]:bg-[var(--bg-content)]"
                                        value={localData.network_type}
                                        onChange={e => handleChange('info','network_type','network_type', e.target.value)}
                                    >
                                        {['monofasico','bifasico 220','trifasico 220','trifasico 440'].map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wider mb-1">Potencia (kWp)</p>
                                    <input
                                        type="number" step="0.1" min="0.1"
                                        className="w-full px-3 py-2 bg-[var(--surface)] border border-[var(--border-ui)] rounded-xl text-[var(--text-primary)] focus:border-[var(--solar-gold)] focus:ring focus:ring-[var(--solar-gold)]/20 transition-all text-sm"
                                        value={localData.power_kwp}
                                        onChange={e => handleChange('info','power_kwp','power_kwp', e.target.value)}
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <input type="checkbox" id="fin-edit" className="w-4 h-4 accent-[var(--solar-gold)]"
                                        checked={!!localData.requires_financing}
                                        onChange={e => handleChange('info','requires_financing','requires_financing', e.target.checked)}
                                    />
                                    <label htmlFor="fin-edit" className="text-sm text-[var(--text-primary)]">Requiere financiamiento</label>
                                </div>
                                <div className="md:col-span-2 flex items-center gap-2 text-sm text-[var(--text-secondary)] pt-2 border-t border-[var(--border-ui)]">
                                    <User className="w-4 h-4 text-[var(--solar-gold)]" />
                                    <span className="font-semibold text-[var(--text-primary)]">{quotation.client?.name}</span>
                                    <span className="ml-2">{quotation.client?.email}</span>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wider mb-1">Cliente</p>
                                        <div className="flex items-center gap-2 text-[var(--text-primary)] font-semibold">
                                            <User className="w-4 h-4 text-[var(--solar-gold)]" />
                                            {quotation.client?.name}
                                        </div>
                                        {quotation.client?.document && <p className="text-sm text-[var(--text-secondary)] mt-1">Doc: {quotation.client.document}</p>}
                                        {quotation.client?.type && <p className="text-sm text-[var(--text-secondary)] mt-1">Tipo: {quotation.client.type}</p>}
                                        <p className="text-sm text-[var(--text-secondary)] mt-1">{quotation.client?.email}</p>
                                        {quotation.client?.phone && <p className="text-sm text-[var(--text-secondary)] mt-1">{quotation.client.phone}</p>}
                                        {quotation.client?.address && <p className="text-sm text-[var(--text-secondary)] mt-1 flex items-start gap-1"><MapPin className="w-4 h-4 mt-0.5" />{quotation.client.address}</p>}
                                    </div>
                                    <div>
                                        <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wider mb-1">Responsable</p>
                                        <p className="text-[var(--text-primary)]">{quotation.user?.name}</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wider mb-1">Especificaciones del Sistema</p>
                                        <div className="bg-[var(--surface)] border border-[var(--border-ui)] rounded-xl p-4 space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-[var(--text-secondary)]">Tipo:</span>
                                                <span className="text-[var(--text-primary)] font-semibold">{localData.system_type}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-[var(--text-secondary)]">Red:</span>
                                                <span className="text-[var(--text-primary)] font-semibold capitalize">{localData.network_type}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-[var(--text-secondary)]">Potencia:</span>
                                                <span className="text-[var(--solar-gold)] font-bold">{localData.power_kwp} kWp</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        {localData.requires_financing && !editingInfo && (
                            <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center gap-2 text-sm text-blue-400 font-semibold">
                                <CheckCircle className="w-4 h-4" /> Proyecto con requerimiento de financiamiento
                            </div>
                        )}
                    </div>

                    {/* Products */}
                    <div className={sectionCls}>
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2 text-lg font-bold text-[var(--text-primary)]">
                                <Sun className="w-5 h-5 text-[var(--solar-gold)]" /> Suministros (Productos)
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => openAddProductModal('panel')}
                                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-xl bg-[var(--surface)] border border-[var(--border-ui)] text-[var(--text-secondary)] hover:border-[var(--solar-gold)]/40 hover:text-[var(--solar-gold)] transition-all"
                                    title="Agregar panel"
                                >
                                    <Sun className="w-3 h-3 text-amber-400" /> +
                                </button>
                                <button
                                    onClick={() => openAddProductModal('inverter')}
                                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-xl bg-[var(--surface)] border border-[var(--border-ui)] text-[var(--text-secondary)] hover:border-[var(--solar-gold)]/40 hover:text-[var(--solar-gold)] transition-all"
                                    title="Agregar inversor"
                                >
                                    <Cpu className="w-3 h-3 text-blue-400" /> +
                                </button>
                                <button
                                    onClick={() => openAddProductModal('battery')}
                                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-xl bg-[var(--surface)] border border-[var(--border-ui)] text-[var(--text-secondary)] hover:border-[var(--solar-gold)]/40 hover:text-[var(--solar-gold)] transition-all"
                                    title="Agregar batería"
                                >
                                    <Battery className="w-3 h-3 text-emerald-400" /> +
                                </button>
                            </div>
                        </div>
                        {quotation.products?.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm whitespace-nowrap">
                                    <thead>
                                        <tr className="border-b border-[var(--border-ui)] text-[var(--text-secondary)]">
                                            <th className="pb-3 font-semibold">Tipo</th>
                                            <th className="pb-3 font-semibold">Descripción</th>
                                            <th className="pb-3 font-semibold text-center">Cant.</th>
                                            <th className="pb-3 font-semibold text-right">V. Unitario</th>
                                            <th className="pb-3 font-semibold text-right">% Util.</th>
                                            <th className="pb-3 font-semibold text-right">V. Parcial</th>
                                            <th className="pb-3 font-semibold text-right">Utilidad</th>
                                            <th className="pb-3 font-semibold text-right">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[var(--border-ui)]">
                                        {localData.products.map((p: any) => {
                                            const vParcial = p.quantity * p.unit_price_cop;
                                            const util = vParcial * p.profit_percentage;
                                            const total = vParcial + util;
                                            return (
                                                <tr key={p.id} className="text-[var(--text-primary)] hover:bg-[var(--surface)] transition-colors">
                                                    <td className="py-3 capitalize">
                                                        <div className="flex items-center gap-2">
                                                            {p.product_type === 'panel' && <Sun className="w-4 h-4 text-amber-400" />}
                                                            {p.product_type === 'inverter' && <Cpu className="w-4 h-4 text-blue-400" />}
                                                            {p.product_type === 'battery' && <Battery className="w-4 h-4 text-emerald-400" />}
                                                            {p.product_type}
                                                        </div>
                                                    </td>
                                                    <td className="py-3">
                                                        <div className="flex items-center gap-2">
                                                            <div>
                                                                <div className="font-semibold">{p.snapshot_brand}</div>
                                                                <div className="text-xs text-[var(--text-secondary)]">{p.snapshot_model}</div>
                                                            </div>
                                                            <button
                                                                onClick={() => openProductModal(p.product_type, p.id)}
                                                                className="p-1 hover:bg-[var(--solar-gold)]/10 rounded transition-colors"
                                                                title="Cambiar producto"
                                                            >
                                                                <RefreshCw className="w-3 h-3 text-[var(--solar-gold)]" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 text-center">
                                                        <EditableCell section="products" id={p.id} field="quantity" value={p.quantity} />
                                                    </td>
                                                    <td className="py-3 text-right">
                                                        <EditableCell section="products" id={p.id} field="unit_price_cop" value={p.unit_price_cop} fmtFn={fmt} />
                                                    </td>
                                                    <td className="py-3 text-right">
                                                        <EditableCell section="products" id={p.id} field="profit_percentage" value={p.profit_percentage} suffix="%" fmtFn={(v: any) => (v * 100).toFixed(0)} />
                                                    </td>
                                                    <td className="py-3 text-right text-[var(--text-secondary)]">{fmt(vParcial)}</td>
                                                    <td className="py-3 text-right text-[var(--text-secondary)]">{fmt(util)}</td>
                                                    <td className="py-3 text-right font-medium text-[var(--solar-gold)]">{fmt(total)}</td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-sm text-[var(--text-secondary)]">No hay suministros registrados.</p>
                        )}
                    </div>

                    {/* Complementary Items */}
                    <div className={sectionCls}>
                        <div className="flex items-center gap-2 text-lg font-bold text-[var(--text-primary)] mb-2">
                            <Wrench className="w-5 h-5 text-[var(--solar-gold)]" /> Ítems Complementarios
                        </div>
                        {quotation.items?.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm whitespace-nowrap">
                                    <thead>
                                        <tr className="border-b border-[var(--border-ui)] text-[var(--text-secondary)]">
                                            <th className="pb-3 font-semibold">Descripción</th>
                                            <th className="pb-3 font-semibold text-center">Cant.</th>
                                            <th className="pb-3 font-semibold">Unidad</th>
                                            <th className="pb-3 font-semibold text-right">V. Unitario</th>
                                            <th className="pb-3 font-semibold text-right">% Util.</th>
                                            <th className="pb-3 font-semibold text-right">V. Parcial</th>
                                            <th className="pb-3 font-semibold text-right">Utilidad</th>
                                            <th className="pb-3 font-semibold text-right">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[var(--border-ui)]">
                                        {localData.items.map((i: any) => {
                                            const vParcial = i.quantity * i.unit_price_cop;
                                            const util = vParcial * i.profit_percentage;
                                            const total = vParcial + util;
                                            return (
                                                <tr key={i.id} className="text-[var(--text-primary)] hover:bg-[var(--surface)] transition-colors">
                                                    <td className="py-3">
                                                        <EditableCell section="items" id={i.id} field="description" value={i.description} type="text" />
                                                        <div className="text-xs capitalize text-[var(--text-secondary)]">{i.category.replace('_', ' ')}</div>
                                                    </td>
                                                    <td className="py-3 text-center">
                                                        <EditableCell section="items" id={i.id} field="quantity" value={i.quantity} />
                                                    </td>
                                                    <td className="py-3 text-center">
                                                        <EditableCell section="items" id={i.id} field="unit_measure" value={i.unit_measure} type="text" />
                                                    </td>
                                                    <td className="py-3 text-right">
                                                        <EditableCell section="items" id={i.id} field="unit_price_cop" value={i.unit_price_cop} fmtFn={fmt} />
                                                    </td>
                                                    <td className="py-3 text-right">
                                                        <EditableCell section="items" id={i.id} field="profit_percentage" value={i.profit_percentage} suffix="%" fmtFn={(v: any) => (v * 100).toFixed(0)} />
                                                    </td>
                                                    <td className="py-3 text-right text-[var(--text-secondary)]">{fmt(vParcial)}</td>
                                                    <td className="py-3 text-right text-[var(--text-secondary)]">{fmt(util)}</td>
                                                    <td className="py-3 text-right font-medium text-[var(--solar-gold)]">{fmt(total)}</td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-sm text-[var(--text-secondary)]">No hay ítems complementarios.</p>
                        )}
                    </div>

                    {/* Especificaciones Técnicas */}
                    <div className="glass rounded-2xl p-6 space-y-4">
                        <h3 className="font-bold flex items-center gap-2 text-[var(--text-primary)]">
                            <Zap className="w-5 h-5 text-[var(--solar-gold)]" /> Especificaciones Técnicas
                            {localData.system_type === 'On-grid' && (
                                <span className="ml-2 px-2 py-0.5 text-xs font-bold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">On-grid</span>
                            )}
                            {localData.system_type === 'Off-grid' && (
                                <span className="ml-2 px-2 py-0.5 text-xs font-bold rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">Off-grid</span>
                            )}
                            {localData.system_type === 'Híbrido' && (
                                <span className="ml-2 px-2 py-0.5 text-xs font-bold rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">Híbrido</span>
                            )}
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-[var(--surface)] rounded-xl p-4 border border-[var(--border-ui)]">
                                <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] uppercase tracking-wider mb-1">
                                    <Zap className="w-4 h-4" /> Potencia
                                </div>
                                <p className="text-2xl font-bold text-[var(--solar-gold)]">{localData.power_kwp}</p>
                                <p className="text-xs text-[var(--text-secondary)]">kWp instalada</p>
                            </div>
                            <div className="bg-[var(--surface)] rounded-xl p-4 border border-[var(--border-ui)]">
                                <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] uppercase tracking-wider mb-1">
                                    <Sun className="w-4 h-4 text-amber-400" /> Paneles
                                </div>
                                <p className="text-2xl font-bold text-[var(--text-primary)]">{specs.panelCount}</p>
                                <p className="text-xs text-[var(--text-secondary)]">{specs.avgPanelPower}W c/u</p>
                            </div>
                            <div className="bg-[var(--surface)] rounded-xl p-4 border border-[var(--border-ui)]">
                                <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] uppercase tracking-wider mb-1">
                                    <Cpu className="w-4 h-4 text-blue-400" /> Inversores
                                </div>
                                <p className="text-2xl font-bold text-[var(--text-primary)]">{overdimensioning.inverterPower.toFixed(1)}</p>
                                <p className="text-xs text-[var(--text-secondary)]">kW total</p>
                            </div>
                            <div className="bg-[var(--surface)] rounded-xl p-4 border border-[var(--border-ui)]">
                                <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] uppercase tracking-wider mb-1">
                                    <Activity className="w-4 h-4" /> Ratio
                                </div>
                                <p className={`text-2xl font-bold ${
                                    overdimensioning.isWarning ? 'text-red-400' :
                                    overdimensioning.isLow ? 'text-blue-400' : 'text-emerald-400'
                                }`}>{overdimensioning.ratio.toFixed(2)}x</p>
                                <p className="text-xs text-[var(--text-secondary)]">
                                    {overdimensioning.ratio === 0 ? 'Sin datos' :
                                    overdimensioning.isWarning ? 'Sobredimensionado' :
                                    overdimensioning.isLow ? 'Subdimensionado' : 'Óptimo'}
                                </p>
                            </div>
                        </div>

                        {/* Barra visual del ratio */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs text-[var(--text-secondary)]">
                                <span>Ratio de dimensionamiento</span>
                                <span className="font-semibold">{overdimensioning.ratio.toFixed(2)}x</span>
                            </div>
                            <div className="h-3 bg-[var(--surface)] rounded-full overflow-hidden flex">
                                <div
                                    className={`h-full transition-all ${
                                        overdimensioning.ratio === 0 ? 'bg-slate-500 w-0' :
                                        overdimensioning.ratio > 1.3 ? 'bg-red-500' :
                                        overdimensioning.ratio > 1.0 ? 'bg-amber-500' :
                                        'bg-emerald-500'
                                    }`}
                                    style={{ width: `${Math.min(overdimensioning.ratio * 50, 100)}%` }}
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
                                    <p className="text-sm font-bold text-[var(--text-primary)] truncate">{specs.dailyProduction.toFixed(1)} kWh</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 p-2 bg-[var(--surface)] rounded-xl border border-[var(--border-ui)]">
                                <TrendingUp className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                                <div className="min-w-0">
                                    <p className="text-[10px] text-[var(--text-secondary)] truncate">Producción mensual</p>
                                    <p className="text-sm font-bold text-[var(--text-primary)] truncate">{specs.monthlyProduction.toFixed(0)} kWh</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 p-2 bg-[var(--surface)] rounded-xl border border-[var(--border-ui)]">
                                <TrendingUp className="w-4 h-4 text-blue-400 flex-shrink-0" />
                                <div className="min-w-0">
                                    <p className="text-[10px] text-[var(--text-secondary)] truncate">Producción anual</p>
                                    <p className="text-sm font-bold text-[var(--text-primary)] truncate">{specs.yearlyProduction.toLocaleString('es-CO')} kWh</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 p-2 bg-[var(--surface)] rounded-xl border border-[var(--border-ui)]">
                                <Box className="w-4 h-4 text-purple-400 flex-shrink-0" />
                                <div className="min-w-0">
                                    <p className="text-[10px] text-[var(--text-secondary)] truncate">Área</p>
                                    <p className="text-sm font-bold text-[var(--text-primary)] truncate">{specs.areaM2} m²</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 p-2 bg-[var(--surface)] rounded-xl border border-[var(--solar-gold)]/30">
                                <Wallet className="w-4 h-4 text-[var(--solar-gold)] flex-shrink-0" />
                                <div className="min-w-0">
                                    <p className="text-[10px] text-[var(--text-secondary)] truncate">Ahorro mensual</p>
                                    <p className="text-sm font-bold text-[var(--solar-gold)] truncate">{fmt(specs.monthlySavings)}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 p-2 bg-[var(--surface)] rounded-xl border border-[var(--solar-gold)]/30">
                                <Wallet className="w-4 h-4 text-[var(--solar-gold)] flex-shrink-0" />
                                <div className="min-w-0">
                                    <p className="text-[10px] text-[var(--text-secondary)] truncate">Ahorro anual</p>
                                    <p className="text-sm font-bold text-[var(--solar-gold)] truncate">{fmt(specs.yearlySavings)}</p>
                                </div>
                            </div>
                        </div>
                        {/* Factores usados */}
                        <div className="text-xs text-[var(--text-secondary)] flex flex-wrap gap-3 pt-2 border-t border-[var(--border-ui)]">
                            <span>HSP: <strong className="text-[var(--text-primary)]">{specs.colHsp} h/día</strong></span>
                            <span>PR: <strong className="text-[var(--text-primary)]">{(specs.colPr * 100).toFixed(0)}%</strong></span>
                            <span>Tarifa: <strong className="text-[var(--text-primary)]">{fmt(specs.energyTariff)}/kWh</strong></span>
                            <span>CF: <strong className="text-[var(--text-primary)]">{((specs.yearlyProduction / (localData.power_kwp * 8760)) * 100).toFixed(1)}%</strong></span>
                        </div>
                    </div>

                </div>

                {/* Right Column: Financial Summary */}
                <div className="space-y-6">
                    <div className="glass rounded-2xl border border-[var(--solar-gold)]/20 overflow-hidden sticky top-6">
                        <div className="bg-[var(--solar-gold)]/10 p-6 border-b border-[var(--solar-gold)]/20">
                            <h2 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2 mb-1">
                                <Calculator className="w-5 h-5 text-[var(--solar-gold)]" /> Resumen Financiero
                            </h2>
                            <p className="text-sm text-[var(--text-secondary)]">Cálculos AUI</p>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between text-[var(--text-secondary)]">
                                    <span>Subtotal (Costos directos)</span>
                                    <span>{fmt(totals.subtotal)}</span>
                                </div>
                                <div className="flex justify-between text-[var(--text-secondary)]">
                                    <div className="flex items-center gap-1">
                                        <span>Gestión Comercial</span>
                                        <EditableCell section="summary" id="global" field="commercial_management_percentage" value={localData.commercial_management_percentage} suffix="%" fmtFn={(v: any) => (v * 100).toFixed(1)} />
                                    </div>
                                    <span>{fmt(totals.commercial_management)}</span>
                                </div>
                                <div className="flex justify-between font-semibold text-[var(--text-primary)] py-2 border-y border-[var(--border-ui)]">
                                    <span>Subtotal 2</span>
                                    <span>{fmt(totals.subtotal2)}</span>
                                </div>
                                <div className="flex justify-between text-[var(--text-secondary)]">
                                    <div className="flex items-center gap-1">
                                        <span>Administración</span>
                                        <EditableCell section="summary" id="global" field="administration_percentage" value={localData.administration_percentage} suffix="%" fmtFn={(v: any) => (v * 100).toFixed(1)} />
                                    </div>
                                    <span>{fmt(totals.administration)}</span>
                                </div>
                                <div className="flex justify-between text-[var(--text-secondary)]">
                                    <div className="flex items-center gap-1">
                                        <span>Imprevistos</span>
                                        <EditableCell section="summary" id="global" field="contingency_percentage" value={localData.contingency_percentage} suffix="%" fmtFn={(v: any) => (v * 100).toFixed(1)} />
                                    </div>
                                    <span>{fmt(totals.contingency)}</span>
                                </div>
                                <div className="flex justify-between text-[var(--text-secondary)]">
                                    <div className="flex items-center gap-1">
                                        <span>Utilidad</span>
                                        <EditableCell section="summary" id="global" field="profit_percentage" value={localData.profit_percentage} suffix="%" fmtFn={(v: any) => (v * 100).toFixed(1)} />
                                    </div>
                                    <span>{fmt(totals.profit)}</span>
                                </div>
                                <div className="flex justify-between text-[var(--text-secondary)]">
                                    <span>IVA s/ Utilidad ({(localData.iva_profit_percentage * 100).toFixed(1)}%)</span>
                                    <span>{fmt(totals.profit_iva)}</span>
                                </div>
                                <div className="flex justify-between font-semibold text-[var(--text-primary)] py-2 border-y border-[var(--border-ui)]">
                                    <span>Subtotal 3</span>
                                    <span>{fmt(totals.subtotal3)}</span>
                                </div>
                                <div className="flex justify-between text-[var(--text-secondary)]">
                                    <div className="flex items-center gap-1">
                                        <span>Retenciones</span>
                                        <EditableCell section="summary" id="global" field="withholding_percentage" value={localData.withholding_percentage} suffix="%" fmtFn={(v: any) => (v * 100).toFixed(1)} />
                                    </div>
                                    <span>{fmt(totals.withholdings)}</span>
                                </div>
                            </div>

                            <div className="mt-6 p-4 bg-[var(--surface)] border border-[var(--solar-gold)]/30 rounded-xl text-center">
                                <p className="text-sm text-[var(--text-secondary)] mb-1 uppercase tracking-widest font-semibold">Valor Total del Proyecto</p>
                                <p className="text-3xl font-black text-[var(--solar-gold)]">{fmt(totals.total_value)}</p>
                                <p className="text-xs text-[var(--text-secondary)] mt-2">Valor por Vatio: <strong className="text-[var(--text-primary)]">{fmt(totals.total_value / (localData.power_kwp * 1000))}</strong> / Wp</p>
                            </div>

                            <div className="pt-4 flex flex-col gap-2">
                                <div className="flex justify-between text-xs text-[var(--text-secondary)]">
                                    <span>Fecha de emisión:</span>
                                    <span>{quotation.issue_date}</span>
                                </div>
                                <div className="flex justify-between text-xs text-[var(--text-secondary)]">
                                    <span>Válido hasta:</span>
                                    <span>{quotation.expiration_date}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Status History Timeline */}
                    {quotation.status_history?.length > 0 && (
                        <div className="glass rounded-2xl border border-[var(--border-ui)] overflow-hidden">
                            <div className="px-6 py-4 border-b border-[var(--border-ui)] flex items-center gap-2">
                                <Clock className="w-4 h-4 text-[var(--solar-gold)]" />
                                <h3 className="font-bold text-[var(--text-primary)] text-sm">Historial de Estados</h3>
                            </div>
                            <div className="p-4 space-y-3">
                                {quotation.status_history.map((h: any, idx: number) => (
                                    <div key={h.id} className="flex gap-3 items-start">
                                        <div className="flex flex-col items-center">
                                            <div className={`w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0 ${
                                                h.to_status === 'Aprobada'  ? 'bg-emerald-400' :
                                                h.to_status === 'Enviada'   ? 'bg-blue-400' :
                                                h.to_status === 'Rechazada' ? 'bg-red-400' :
                                                h.to_status === 'Vencida'   ? 'bg-amber-400' : 'bg-slate-400'
                                            }`} />
                                            {idx < quotation.status_history.length - 1 && (
                                                <div className="w-px flex-1 bg-[var(--border-ui)] mt-1" style={{minHeight:'16px'}} />
                                            )}
                                        </div>
                                        <div className="flex-1 pb-2">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                {h.from_status && (
                                                    <span className="text-xs text-[var(--text-secondary)] line-through">{h.from_status}</span>
                                                )}
                                                {h.from_status && <span className="text-xs text-[var(--text-secondary)]">→</span>}
                                                <span className="text-xs font-bold text-[var(--text-primary)]">{h.to_status}</span>
                                            </div>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-[10px] text-[var(--text-secondary)]">{h.user?.name}</span>
                                                <span className="text-[10px] text-[var(--text-secondary)] opacity-60">{new Date(h.created_at).toLocaleDateString('es-CO', {day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'})}</span>
                                            </div>
                                            {h.notes && (
                                                <p className="text-[11px] text-[var(--text-secondary)] mt-1 italic border-l-2 border-[var(--solar-gold)]/40 pl-2">{h.notes}</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

            </div>

            {/* Modal para cambiar producto */}
            {productModal.open && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="glass rounded-2xl p-6 max-w-lg w-full max-h-[80vh] overflow-hidden flex flex-col border border-[var(--border-ui)]">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
                                {productModal.isNew ? <Sun className="w-5 h-5 text-[var(--solar-gold)]" /> : <RefreshCw className="w-5 h-5 text-[var(--solar-gold)]" />}
                                {productModal.isNew ? 'Agregar' : 'Cambiar'} {productModal.productType === 'panel' ? 'Panel' : productModal.productType === 'inverter' ? 'Inversor' : 'Batería'}
                            </h3>
                            <button onClick={() => setProductModal({ open: false, productType: null, productId: null })}
                                className="p-1 hover:bg-[var(--surface)] rounded-lg transition-colors">
                                <X className="w-5 h-5 text-[var(--text-secondary)]" />
                            </button>
                        </div>

                        {productModal.productType === 'inverter' && (
                            <p className="text-xs text-[var(--text-secondary)] mb-3 pb-2 border-b border-[var(--border-ui)]">
                                Mostrando inversores compatibles con: <strong className="text-[var(--text-primary)]">{localData.system_type}</strong> / <strong className="text-[var(--text-primary)]">{localData.network_type}</strong>
                            </p>
                        )}

                        <div className="flex-1 overflow-y-auto space-y-2">
                            {(() => {
                                let catalog;
                                if (productModal.productType === 'panel') {
                                    catalog = catalogPanels;
                                } else if (productModal.productType === 'inverter') {
                                    // Filtrar inversores por system_type y grid_type
                                    catalog = catalogInverters?.filter((inv: any) => {
                                        const matchSystem = !inv.system_type ||
                                            inv.system_type === localData.system_type ||
                                            inv.system_type === 'Híbrido';
                                        const matchGrid = !inv.grid_type ||
                                            inv.grid_type === localData.network_type;
                                        return matchSystem && matchGrid;
                                    });
                                } else {
                                    catalog = catalogBatteries;
                                }

                                if (!catalog || catalog.length === 0) {
                                    return <p className="text-sm text-[var(--text-secondary)] text-center py-8">No hay productos disponibles en el catálogo.</p>;
                                }
                                return catalog.map((p: any) => (
                                    <button
                                        key={p.id}
                                        onClick={() => handleProductChange(p.id)}
                                        className="w-full p-3 rounded-xl border border-[var(--border-ui)] hover:border-[var(--solar-gold)]/50 hover:bg-[var(--solar-gold)]/5 transition-all text-left"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-semibold text-[var(--text-primary)]">{p.brand}</p>
                                                <p className="text-sm text-[var(--text-secondary)]">{p.model}</p>
                                                {p.grid_type && (
                                                    <p className="text-[10px] text-[var(--text-secondary)] mt-1">{p.grid_type} / {p.system_type}</p>
                                                )}
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-[var(--solar-gold)]">{p.power || p.capacity} {p.power ? 'W' : 'Ah'}</p>
                                                <p className="text-xs text-[var(--text-secondary)]">{fmt(p.price)}</p>
                                            </div>
                                        </div>
                                    </button>
                                ));
                            })()}
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}