import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { showToast } from '@/Components/Toast';
import { useState, useMemo, useRef, useEffect } from 'react';
import FinancialTab from '@/features/quotations/components/FinancialTab';
import TechnicalTab from '@/features/quotations/components/TechnicalTab';
import StatesTab from '@/features/quotations/components/StatesTab';
import { Calculator, Cpu, Clock, ArrowLeft, Download, Save, RotateCcw, ChevronDown, Lock, Sun, RefreshCw, X, AlertCircle, Pencil } from 'lucide-react';
import ConfirmModal from '@/Components/ConfirmModal';
import Modal from '@/Components/Modal';
import { formatCurrencySimple } from '@/utils/format';

const STATUSES = ['Borrador','Enviada','Aprobada','Rechazada','Vencida'] as const;

function fmt(v: number) {
    return formatCurrencySimple(v);
}

export default function Show({ quotation, allowedStatuses, isStatusLocked, catalogPanels, catalogInverters, catalogBatteries }: any) {
    const { auth } = usePage().props as any;
    const isAdminOrGerente = auth?.user?.roles?.some((r: string) => r === 'admin' || r === 'gerente');
    const visibleStatuses = allowedStatuses.filter((s: string) => isAdminOrGerente || s !== 'Aprobada');
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
    const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
    const [showDesignModal, setShowDesignModal] = useState(false);
    const [designFile, setDesignFile] = useState<File | null>(null);
    const [uploadingDesign, setUploadingDesign] = useState(false);
    const [hasDesignImage, setHasDesignImage] = useState(!!quotation.design_image);
    const statusRef = useRef<HTMLDivElement>(null);

    const [activeTab, setActiveTab] = useState<'financial' | 'technical' | 'states'>('financial');

    const tabs = [
        { id: 'financial' as const, label: 'Financiera', icon: Calculator },
        { id: 'technical' as const, label: 'Técnica', icon: Cpu },
        { id: 'states' as const, label: 'Estados', icon: Clock },
    ];

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
        if (isStatusLocked) return;
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
                                (newSystemType === 'Híbrido' && inv.system_type === 'Híbrido');
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
        if (!productModal.productType || isStatusLocked) return;

        const catalogs: any = {
            panel: catalogPanels,
            inverter: catalogInverters,
            battery: catalogBatteries
        };

        const newProduct = catalogs[productModal.productType]?.find((p: any) => p.id === newProductId);
        if (!newProduct) return;

        // Si es un producto nuevo (agregar)
        if (productModal.isNew) {
            // Validar límite de inversores
            if (productModal.productType === 'inverter') {
                const uniqueInverters = new Set(
                    localData.products
                        .filter((p: any) => p.product_type === 'inverter')
                        .map((p: any) => p.product_id)
                );

                if (uniqueInverters.size >= 2 && !uniqueInverters.has(newProductId)) {
                    showToast('Se recomienda no usar más de 2 inversores diferentes en un mismo sistema.', 'warning');
                }
            }

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

    const confirmDiscard = () => {
        setShowDiscardConfirm(false);
        setLocalData({ ...quotation, products: [...(quotation.products || [])], items: [...(quotation.items || [])] });
        setHasChanges(false);
        setEditingCell(null);
        setEditingInfo(false);
        showToast('Cambios descartados.', 'info');
    };

    const handleDownloadPdf = () => {
        if (hasDesignImage) {
            window.open(`${route('quotations.pdf', quotation.id)}?t=${new Date().getTime()}`, '_blank');
        } else {
            setShowDesignModal(true);
        }
    };

    const handleDownloadWithoutDesign = () => {
        setShowDesignModal(false);
        setDesignFile(null);
        window.open(`${route('quotations.pdf', quotation.id)}?t=${new Date().getTime()}`, '_blank');
    };

    const handleUploadAndDownload = async () => {
        if (!designFile) return;

        setUploadingDesign(true);
        const formData = new FormData();
        formData.append('design_image', designFile);

        try {
            const response = await fetch(route('quotations.design-image', quotation.id), {
                method: 'POST',
                headers: { 'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content },
                body: formData,
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.message || 'Error al subir la imagen');
            }

            setHasDesignImage(true);
            setShowDesignModal(false);
            setDesignFile(null);
            window.open(`${route('quotations.pdf', quotation.id)}?t=${new Date().getTime()}`, '_blank');
        } catch (e: any) {
            showToast(e.message || 'Error al subir la imagen', 'error');
        } finally {
            setUploadingDesign(false);
        }
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
                                        {visibleStatuses.length > 0 ? (
                                            visibleStatuses.map((s: string) => (
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
                    <button
                        onClick={handleDownloadPdf}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                            hasChanges
                                ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20'
                                : 'bg-[var(--surface)] border border-[var(--border-ui)] text-[var(--text-primary)] hover:border-[var(--solar-gold)]/40'
                        }`}
                        title={hasChanges ? 'Guarda los cambios antes de generar el PDF' : 'Descargar propuesta en PDF'}
                    >
                        <Download className="w-4 h-4" /> Propuesta PDF
                    </button>
                    {hasChanges && !isStatusLocked && (
                        <>
                            <button onClick={() => setShowDiscardConfirm(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-500/10 text-slate-400 border border-slate-500/20 hover:bg-slate-500/20 transition-all text-sm font-semibold">
                                <RotateCcw className="w-4 h-4" /> Descartar
                            </button>
                            <button onClick={handleSave} disabled={processing} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 text-white font-semibold hover:brightness-110 transition-all text-sm shadow-lg shadow-emerald-500/20">
                                <Save className="w-4 h-4" /> {processing ? 'Guardando...' : 'Guardar Cambios'}
                            </button>
                        </>
                    )}
                    {isStatusLocked && (
                        <span className="text-xs text-[var(--text-secondary)] italic">Cotización bloqueada — no se puede editar</span>
                    )}
                </div>
            </div>

            {/* Navegación de tabs */}
            <div className="glass rounded-2xl p-1.5 mb-6 overflow-x-auto hide-scrollbar">
                <div className="flex gap-1">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl transition-all ${
                                activeTab === tab.id
                                    ? 'bg-[var(--solar-gold)] text-slate-900 shadow-lg shadow-[var(--solar-gold)]/20'
                                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface)]'
                            }`}
                        >
                            <Icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    );
                })}
                </div>
            </div>

            {/* Contenido según tab */}
            <div className="min-h-[400px]">
                {activeTab === 'financial' && (
                    <FinancialTab
                        localData={localData}
                        setLocalData={setLocalData}
                        editingInfo={editingInfo}
                        setEditingInfo={setEditingInfo}
                        editingCell={editingCell}
                        setEditingCell={setEditingCell}
                        handleChange={handleChange}
                        openProductModal={openProductModal}
                        openAddProductModal={openAddProductModal}
                        catalogPanels={catalogPanels}
                        catalogInverters={catalogInverters}
                        catalogBatteries={catalogBatteries}
                        quotation={quotation}
                        overdimensioning={overdimensioning}
                        totals={totals}
                        isStatusLocked={isStatusLocked}
                    />
                )}
                {activeTab === 'technical' && (
                    <TechnicalTab
                        localData={localData}
                        overdimensioning={overdimensioning}
                        specs={specs}
                        catalogPanels={catalogPanels}
                        catalogInverters={catalogInverters}
                        catalogBatteries={catalogBatteries}
                    />
                )}
                {activeTab === 'states' && (
                    <StatesTab
                        status_history={quotation.status_history || []}
                        currentStatus={localData.status}
                    />
                )}
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
                            !localData.system_type || !localData.network_type ? (
                                <div className="flex items-center gap-2 text-amber-400 text-sm mb-3 pb-3 border-b border-[var(--border-ui)]">
                                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                    <span>Define primero <strong>Tipo de Sistema</strong> y <strong>Tipo de Red</strong> en Información General para ver inversores compatibles.</span>
                                </div>
                            ) : (
                                <p className="text-xs text-[var(--text-secondary)] mb-3 pb-2 border-b border-[var(--border-ui)]">
                                    Mostrando inversores compatibles con: <strong className="text-[var(--text-primary)]">{localData.system_type}</strong> / <strong className="text-[var(--text-primary)]">{localData.network_type}</strong>
                                </p>
                            )
                        )}

                        <div className="flex-1 overflow-y-auto space-y-2">
                            {(() => {
                                if (productModal.productType === 'inverter' && (!localData.system_type || !localData.network_type)) {
                                    return (
                                        <div className="flex flex-col items-center justify-center py-12 text-center">
                                            <Cpu className="w-12 h-12 text-[var(--text-secondary)]/30 mb-3" />
                                            <p className="text-sm text-[var(--text-secondary)]">Selecciona Tipo de Sistema y Tipo de Red</p>
                                            <p className="text-xs text-[var(--text-secondary)]/60 mt-1">para ver los inversores disponibles</p>
                                        </div>
                                    );
                                }

                                let catalog;
                                if (productModal.productType === 'panel') {
                                    catalog = catalogPanels;
                                } else if (productModal.productType === 'inverter') {
                                    catalog = catalogInverters?.filter((inv: any) => {
                                        const matchSystem = !inv.system_type ||
                                            inv.system_type === localData.system_type ||
                                            (localData.system_type === 'Híbrido' && inv.system_type === 'Híbrido');
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
            {/* Modal para subir diseño fotovoltaico */}
            <Modal show={showDesignModal} onClose={() => { setShowDesignModal(false); setDesignFile(null); }} maxWidth="sm">
                <div className="p-4 sm:p-6 bg-[var(--surface)] text-[var(--text-primary)]">
                    <h2 className="text-lg font-bold mb-2">Diseño fotovoltaico</h2>
                    <p className="text-sm text-[var(--text-secondary)] mb-4">
                        Sube una imagen del diseño preliminar para incluirla en la propuesta.
                    </p>

                    <label className="block mb-4 relative cursor-pointer">
                        <div className="flex items-center justify-center border-2 border-dashed border-[var(--border-ui)] rounded-xl p-6 hover:border-[var(--solar-gold)]/50 transition-colors pointer-events-none">
                            {designFile ? (
                                <div className="text-center">
                                    <p className="text-sm font-medium text-[var(--solar-gold)]">{designFile.name}</p>
                                    <p className="text-xs text-[var(--text-secondary)] mt-1">{(designFile.size / 1024).toFixed(0)} KB</p>
                                </div>
                            ) : (
                                <div className="text-center">
                                    <p className="text-sm font-medium">Seleccionar imagen</p>
                                    <p className="text-xs text-[var(--text-secondary)] mt-1">PNG, JPG o WEBP · Máx 5 MB</p>
                                </div>
                            )}
                        </div>
                        <input
                            type="file"
                            accept="image/png,image/jpeg,image/webp"
                            onChange={(e) => setDesignFile(e.target.files?.[0] || null)}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                    </label>

                    <div className="flex gap-3">
                        <button
                            onClick={handleDownloadWithoutDesign}
                            className="flex-1 px-4 py-2 rounded-xl text-sm font-semibold border border-[var(--border-ui)] text-[var(--text-secondary)] hover:bg-[var(--border-ui)] transition-all"
                        >
                            Descargar sin diseño
                        </button>
                        <button
                            onClick={handleUploadAndDownload}
                            disabled={!designFile || uploadingDesign}
                            className="flex-1 px-4 py-2 rounded-xl text-sm font-semibold bg-[var(--solar-gold)] text-white hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {uploadingDesign ? 'Subiendo...' : 'Subir y descargar'}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Confirmación para descartar cambios */}
            <ConfirmModal
                show={showDiscardConfirm}
                onClose={() => setShowDiscardConfirm(false)}
                onConfirm={confirmDiscard}
                title="Descartar cambios"
                message="Se perderán todos los cambios no guardados en esta cotización."
                confirmLabel="Descartar"
                cancelLabel="Cancelar"
                variant="warning"
            />
        </AuthenticatedLayout>
    );
}