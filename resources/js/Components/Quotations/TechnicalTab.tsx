import { FileText, Sun, Cpu, Battery, Wrench, Pencil, User, MapPin, CheckCircle, AlertCircle, Info, RefreshCw, Zap, Activity, TrendingUp, Box, Wallet, X } from 'lucide-react';

// Función para formatear valores en COP
function fmt(v: number) {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(v || 0);
}

// Componente EditableCell para edición inline
const EditableCell = ({ value, section, id, field, type = "number", suffix = "", prefix = "", fmtFn = (v: any) => v, handleChange, editingCell, setEditingCell }: any) => {
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
            onDoubleClick={() => {
                if (handleChange) {
                    const newEditingCell = { section, id, field };
                    setEditingCell(newEditingCell);
                }
            }}
            className={`cursor-pointer hover:bg-[var(--solar-gold)]/5 rounded px-2 py-1 transition-colors ${handleChange ? '' : 'pointer-events-none'}`}
        >
            {prefix}{fmtFn(value)}{suffix}
        </div>
    );
};

interface TechnicalTabProps {
    localData: any;
    setLocalData: any;
    editingInfo: boolean;
    setEditingInfo: any;
    editingCell: any;
    setEditingCell: any;
    handleChange: any;
    openProductModal: any;
    openAddProductModal: any;
    catalogPanels: any;
    catalogInverters: any;
    catalogBatteries: any;
    quotation: any;
    overdimensioning: any;
    specs: any;
}

export default function TechnicalTab(props: TechnicalTabProps) {
    const {
        localData,
        setLocalData,
        editingInfo,
        setEditingInfo,
        editingCell,
        setEditingCell,
        handleChange,
        openProductModal,
        openAddProductModal,
        catalogPanels,
        catalogInverters,
        catalogBatteries,
        quotation,
        overdimensioning,
        specs
    } = props;

    const sectionCls = "glass rounded-2xl p-6 md:p-8 space-y-6";

    const handleEdit = (section: string, id: number | string, field: string) => {
        setEditingCell({ section, id, field });
    };

    const handleInfoChange = (field: string, value: any) => {
        if (handleChange) {
            handleChange('info', field, field, value);
        }
    };

    // Wrapper para EditableCell que incluye handleChange y funciones de edicion
    const EditableCellWrapper = (cellProps: any) => (
        <EditableCell
            {...cellProps}
            handleChange={handleEdit}
            editingCell={editingCell}
            setEditingCell={setEditingCell}
        />
    );

    return (
        <div className="space-y-6">
            {/* 1. Alerts Section */}
            {(overdimensioning?.isWarning || overdimensioning?.isLow) && (
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
                            {overdimensioning.isWarning ? 'Sobredimensionamiento Detectado' : 'Subdimensionamiento'}
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
                            {overdimensioning.isWarning ? (
                                <>Consideré aumentar la capacidad de inversores o reducir la cantidad de paneles.</>
                            ) : (
                                <>Puede aumentar la potencia hasta <strong>{overdimensioning.maxSafePower.toFixed(1)} kWp</strong> sin sobredimensionar.</>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Sin productos para ratio */}
            {overdimensioning?.ratio === 0 && localData?.products?.length > 0 && (
                <div className="bg-slate-500/10 border border-slate-500/20 rounded-2xl p-4 flex items-center gap-3">
                    <Info className="w-5 h-5 text-slate-400 flex-shrink-0" />
                    <div>
                        <p className="text-sm text-slate-400">No hay paneles o inversores para calcular el ratio de dimensionamiento.</p>
                    </div>
                </div>
            )}

            {/* 2. Información General */}
            <div className={sectionCls}>
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-lg font-bold text-[var(--text-primary)]">
                        <FileText className="w-5 h-5 text-[var(--solar-gold)]" /> Información General
                    </div>
                    <button
                        onClick={() => setEditingInfo(!editingInfo)}
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
                                value={localData.project_name || ''}
                                onChange={e => handleInfoChange('project_name', e.target.value)}
                            />
                        </div>
                        <div>
                            <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wider mb-1">Tipo de Sistema</p>
                            <select
                                className="w-full px-3 py-2 bg-[var(--surface)] border border-[var(--border-ui)] rounded-xl text-[var(--text-primary)] focus:border-[var(--solar-gold)] focus:ring focus:ring-[var(--solar-gold)]/20 transition-all text-sm [&>option]:bg-[var(--bg-content)]"
                                value={localData.system_type || 'On-grid'}
                                onChange={e => handleInfoChange('system_type', e.target.value)}
                            >
                                {['On-grid', 'Off-grid', 'Híbrido'].map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div>
                            <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wider mb-1">Tipo de Red</p>
                            <select
                                className="w-full px-3 py-2 bg-[var(--surface)] border border-[var(--border-ui)] rounded-xl text-[var(--text-primary)] focus:border-[var(--solar-gold)] focus:ring focus:ring-[var(--solar-gold)]/20 transition-all text-sm [&>option]:bg-[var(--bg-content)]"
                                value={localData.network_type || 'monofasico'}
                                onChange={e => handleInfoChange('network_type', e.target.value)}
                            >
                                {['monofasico', 'bifasico 220', 'trifasico 220', 'trifasico 440'].map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div>
                            <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wider mb-1">Potencia (kWp)</p>
                            <input
                                type="number" step="0.1" min="0.1"
                                className="w-full px-3 py-2 bg-[var(--surface)] border border-[var(--border-ui)] rounded-xl text-[var(--text-primary)] focus:border-[var(--solar-gold)] focus:ring focus:ring-[var(--solar-gold)]/20 transition-all text-sm"
                                value={localData.power_kwp || 0}
                                onChange={e => handleInfoChange('power_kwp', e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <input type="checkbox" id="fin-edit" className="w-4 h-4 accent-[var(--solar-gold)]"
                                checked={!!localData.requires_financing}
                                onChange={e => handleInfoChange('requires_financing', e.target.checked)}
                            />
                            <label htmlFor="fin-edit" className="text-sm text-[var(--text-primary)]">Requiere financiamiento</label>
                        </div>
                        <div className="md:col-span-2 flex items-center gap-2 text-sm text-[var(--text-secondary)] pt-2 border-t border-[var(--border-ui)]">
                            <User className="w-4 h-4 text-[var(--solar-gold)]" />
                            <span className="font-semibold text-[var(--text-primary)]">{quotation?.client?.name}</span>
                            <span className="ml-2">{quotation?.client?.email}</span>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wider mb-1">Cliente</p>
                                <div className="flex items-center gap-2 text-[var(--text-primary)] font-semibold">
                                    <User className="w-4 h-4 text-[var(--solar-gold)]" />
                                    {quotation?.client?.name}
                                </div>
                                {quotation?.client?.document && <p className="text-sm text-[var(--text-secondary)] mt-1">Doc: {quotation.client.document}</p>}
                                {quotation?.client?.type && <p className="text-sm text-[var(--text-secondary)] mt-1">Tipo: {quotation.client.type}</p>}
                                <p className="text-sm text-[var(--text-secondary)] mt-1">{quotation?.client?.email}</p>
                                {quotation?.client?.phone && <p className="text-sm text-[var(--text-secondary)] mt-1">{quotation.client.phone}</p>}
                                {quotation?.client?.address && <p className="text-sm text-[var(--text-secondary)] mt-1 flex items-start gap-1"><MapPin className="w-4 h-4 mt-0.5" />{quotation.client.address}</p>}
                            </div>
                            <div>
                                <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wider mb-1">Responsable</p>
                                <p className="text-[var(--text-primary)]">{quotation?.user?.name}</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wider mb-1">Especificaciones del Sistema</p>
                                <div className="bg-[var(--surface)] border border-[var(--border-ui)] rounded-xl p-4 space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-[var(--text-secondary)]">Tipo:</span>
                                        <span className="text-[var(--text-primary)] font-semibold">{localData?.system_type}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-[var(--text-secondary)]">Red:</span>
                                        <span className="text-[var(--text-primary)] font-semibold capitalize">{localData?.network_type}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-[var(--text-secondary)]">Potencia:</span>
                                        <span className="text-[var(--solar-gold)] font-bold">{localData?.power_kwp} kWp</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {localData?.requires_financing && !editingInfo && (
                    <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center gap-2 text-sm text-blue-400 font-semibold">
                        <CheckCircle className="w-4 h-4" /> Proyecto con requerimiento de financiamiento
                    </div>
                )}
            </div>

            {/* 3. Suministros (Productos) */}
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
                {quotation?.products?.length > 0 ? (
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
                                                <EditableCellWrapper section="products" id={p.id} field="quantity" value={p.quantity} />
                                            </td>
                                            <td className="py-3 text-right">
                                                <EditableCellWrapper section="products" id={p.id} field="unit_price_cop" value={p.unit_price_cop} fmtFn={fmt} />
                                            </td>
                                            <td className="py-3 text-right">
                                                <EditableCellWrapper section="products" id={p.id} field="profit_percentage" value={p.profit_percentage} suffix="%" fmtFn={(v: any) => (v * 100).toFixed(0)} />
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

            {/* 4. Ítems Complementarios */}
            <div className={sectionCls}>
                <div className="flex items-center gap-2 text-lg font-bold text-[var(--text-primary)] mb-2">
                    <Wrench className="w-5 h-5 text-[var(--solar-gold)]" /> Ítems Complementarios
                </div>
                {quotation?.items?.length > 0 ? (
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
                                                <EditableCellWrapper section="items" id={i.id} field="description" value={i.description} type="text" />
                                                <div className="text-xs capitalize text-[var(--text-secondary)]">{i.category?.replace('_', ' ')}</div>
                                            </td>
                                            <td className="py-3 text-center">
                                                <EditableCellWrapper section="items" id={i.id} field="quantity" value={i.quantity} />
                                            </td>
                                            <td className="py-3 text-center">
                                                <EditableCellWrapper section="items" id={i.id} field="unit_measure" value={i.unit_measure} type="text" />
                                            </td>
                                            <td className="py-3 text-right">
                                                <EditableCellWrapper section="items" id={i.id} field="unit_price_cop" value={i.unit_price_cop} fmtFn={fmt} />
                                            </td>
                                            <td className="py-3 text-right">
                                                <EditableCellWrapper section="items" id={i.id} field="profit_percentage" value={i.profit_percentage} suffix="%" fmtFn={(v: any) => (v * 100).toFixed(0)} />
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

            {/* 5. Especificaciones Técnicas */}
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