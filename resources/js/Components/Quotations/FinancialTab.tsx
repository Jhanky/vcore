import { FileText, Sun, Cpu, Battery, Wrench, Pencil, User, MapPin, Calculator, RefreshCw } from 'lucide-react';

function fmt(v: number) {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(v || 0);
}

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
                if (setEditingCell) {
                    setEditingCell({ section, id, field });
                }
            }}
            className={`cursor-pointer hover:bg-[var(--solar-gold)]/5 rounded px-2 py-1 transition-colors ${handleChange ? '' : 'pointer-events-none'}`}
        >
            {prefix}{fmtFn(value)}{suffix}
        </div>
    );
};

interface FinancialTabProps {
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
    totals: any;
}

export default function FinancialTab(props: FinancialTabProps) {
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
        totals,
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
            handleChange={handleChange}
            editingCell={editingCell}
            setEditingCell={setEditingCell}
        />
    );

    // Componente interno para celdas del Resumen AUI (ya existentes en FinancialTab)
    const AUIEditableCell = ({ value, section, id, field, type = "number", suffix = "", prefix = "", fmtFn = (v: any) => v }: any) => {
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

    return (
        <div className="space-y-6">
            {/* 1. Información General */}
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
                        Proyecto con requerimiento de financiamiento
                    </div>
                )}
            </div>

            {/* 2. Tabla Unificada: Suministros, Ítems y Resumen */}
            <div className={sectionCls}>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-lg font-bold text-[var(--text-primary)]">
                        <Calculator className="w-5 h-5 text-[var(--solar-gold)]" /> Costos y Presupuesto
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
                            disabled={localData.system_type === 'On-grid'}
                            className={`flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
                                localData.system_type === 'On-grid'
                                    ? 'bg-[var(--surface)]/50 border-[var(--border-ui)] text-[var(--text-secondary)]/50 cursor-not-allowed'
                                    : 'bg-[var(--surface)] border-[var(--border-ui)] text-[var(--text-secondary)] hover:border-[var(--solar-gold)]/40 hover:text-[var(--solar-gold)]'
                            }`}
                            title={localData.system_type === 'On-grid' ? 'Las baterías solo funcionan en sistemas off-grid e híbridos' : 'Agregar batería'}
                        >
                            <Battery className="w-3 h-3 text-emerald-400" /> +
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead>
                            <tr className="border-b border-[var(--border-ui)] text-[var(--text-secondary)]">
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
                            {/* SECCIÓN SUMINISTROS */}
                            {localData.products && localData.products.length > 0 && (
                                <>
                                    <tr className="bg-[var(--surface)] text-[var(--text-primary)]">
                                        <td colSpan={7} className="py-2 px-3 font-semibold flex items-center gap-2">
                                            <Sun className="w-4 h-4 text-amber-400" /> Suministros (Productos)
                                        </td>
                                    </tr>
                                    {localData.products.map((p: any) => {
                                        const vParcial = p.quantity * p.unit_price_cop;
                                        const util = vParcial * p.profit_percentage;
                                        const total = vParcial + util;
                                        return (
                                            <tr key={p.id} className="text-[var(--text-primary)] hover:bg-[var(--surface)] transition-colors">
                                                <td className="py-3 px-3">
                                                    <div className="flex items-center gap-2">
                                                        {p.product_type === 'panel' && <Sun className="w-4 h-4 text-amber-400" />}
                                                        {p.product_type === 'inverter' && <Cpu className="w-4 h-4 text-blue-400" />}
                                                        {p.product_type === 'battery' && <Battery className="w-4 h-4 text-emerald-400" />}
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
                                                <td className="py-3 text-center px-3">
                                                    <EditableCellWrapper section="products" id={p.id} field="quantity" value={p.quantity} />
                                                </td>
                                                <td className="py-3 text-right px-3">
                                                    <EditableCellWrapper section="products" id={p.id} field="unit_price_cop" value={p.unit_price_cop} fmtFn={fmt} />
                                                </td>
                                                <td className="py-3 text-right px-3">
                                                    <EditableCellWrapper section="products" id={p.id} field="profit_percentage" value={p.profit_percentage} suffix="%" fmtFn={(v: any) => (v * 100).toFixed(0)} />
                                                </td>
                                                <td className="py-3 text-right px-3 text-[var(--text-secondary)]">{fmt(vParcial)}</td>
                                                <td className="py-3 text-right px-3 text-[var(--text-secondary)]">{fmt(util)}</td>
                                                <td className="py-3 text-right px-3 font-medium text-[var(--solar-gold)]">{fmt(total)}</td>
                                            </tr>
                                        )
                                    })}
                                </>
                            )}

                            {/* SECCIÓN ÍTEMS */}
                            {localData.items && localData.items.length > 0 && (
                                <>
                                    <tr className="bg-[var(--surface)] text-[var(--text-primary)]">
                                        <td colSpan={7} className="py-2 px-3 font-semibold flex items-center gap-2">
                                            <Wrench className="w-4 h-4 text-[var(--solar-gold)]" /> Ítems Complementarios
                                        </td>
                                    </tr>
                                    {localData.items.map((i: any) => {
                                        const vParcial = i.quantity * i.unit_price_cop;
                                        const util = vParcial * i.profit_percentage;
                                        const total = vParcial + util;
                                        return (
                                            <tr key={i.id} className="text-[var(--text-primary)] hover:bg-[var(--surface)] transition-colors">
                                                <td className="py-3 px-3">
                                                    <EditableCellWrapper section="items" id={i.id} field="description" value={i.description} type="text" />
                                                    <div className="text-xs capitalize text-[var(--text-secondary)]">{i.category?.replace('_', ' ')}</div>
                                                </td>
                                                <td className="py-3 text-center px-3">
                                                    <EditableCellWrapper section="items" id={i.id} field="quantity" value={i.quantity} />
                                                </td>
                                                <td className="py-3 text-right px-3">
                                                    <EditableCellWrapper section="items" id={i.id} field="unit_price_cop" value={i.unit_price_cop} fmtFn={fmt} />
                                                </td>
                                                <td className="py-3 text-right px-3">
                                                    <EditableCellWrapper section="items" id={i.id} field="profit_percentage" value={i.profit_percentage} suffix="%" fmtFn={(v: any) => (v * 100).toFixed(0)} />
                                                </td>
                                                <td className="py-3 text-right px-3 text-[var(--text-secondary)]">{fmt(vParcial)}</td>
                                                <td className="py-3 text-right px-3 text-[var(--text-secondary)]">{fmt(util)}</td>
                                                <td className="py-3 text-right px-3 font-medium text-[var(--solar-gold)]">{fmt(total)}</td>
                                            </tr>
                                        )
                                    })}
                                </>
                            )}

                            {/* SECCIÓN RESUMEN AUI */}
                            <tr className="bg-[var(--solar-gold)]/5 text-[var(--text-primary)]">
                                <td colSpan={7} className="py-2 px-3 font-semibold flex items-center gap-2">
                                    <Calculator className="w-4 h-4 text-[var(--solar-gold)]" /> Resumen AUI
                                </td>
                            </tr>
                            <tr className="text-[var(--text-secondary)] hover:bg-[var(--surface)] transition-colors">
                                <td className="py-2 px-3">Subtotal (Costos directos)</td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td className="py-2 text-right px-3 font-semibold text-[var(--text-primary)]">{fmt(totals.subtotal)}</td>
                            </tr>
                            <tr className="text-[var(--text-secondary)] hover:bg-[var(--surface)] transition-colors">
                                <td className="py-2 px-3 flex items-center gap-1">
                                    <span>Gestión Comercial</span>
                                    <AUIEditableCell section="summary" id="global" field="commercial_management_percentage" value={localData.commercial_management_percentage} suffix="%" fmtFn={(v: any) => (v * 100).toFixed(1)} />
                                </td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td className="py-2 text-right px-3 font-semibold text-[var(--text-primary)]">{fmt(totals.commercial_management)}</td>
                            </tr>
                            <tr className="font-semibold text-[var(--text-primary)] border-y border-[var(--border-ui)]">
                                <td className="py-2 px-3">Subtotal 2</td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td className="py-2 text-right px-3">{fmt(totals.subtotal2)}</td>
                            </tr>
                            <tr className="text-[var(--text-secondary)] hover:bg-[var(--surface)] transition-colors">
                                <td className="py-2 px-3 flex items-center gap-1">
                                    <span>Administración</span>
                                    <AUIEditableCell section="summary" id="global" field="administration_percentage" value={localData.administration_percentage} suffix="%" fmtFn={(v: any) => (v * 100).toFixed(1)} />
                                </td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td className="py-2 text-right px-3">{fmt(totals.administration)}</td>
                            </tr>
                            <tr className="text-[var(--text-secondary)] hover:bg-[var(--surface)] transition-colors">
                                <td className="py-2 px-3 flex items-center gap-1">
                                    <span>Imprevistos</span>
                                    <AUIEditableCell section="summary" id="global" field="contingency_percentage" value={localData.contingency_percentage} suffix="%" fmtFn={(v: any) => (v * 100).toFixed(1)} />
                                </td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td className="py-2 text-right px-3">{fmt(totals.contingency)}</td>
                            </tr>
                            <tr className="text-[var(--text-secondary)] hover:bg-[var(--surface)] transition-colors">
                                <td className="py-2 px-3 flex items-center gap-1">
                                    <span>Utilidad</span>
                                    <AUIEditableCell section="summary" id="global" field="profit_percentage" value={localData.profit_percentage} suffix="%" fmtFn={(v: any) => (v * 100).toFixed(1)} />
                                </td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td className="py-2 text-right px-3">{fmt(totals.profit)}</td>
                            </tr>
                            <tr className="text-[var(--text-secondary)] hover:bg-[var(--surface)] transition-colors">
                                <td className="py-2 px-3">IVA s/ Utilidad ({(localData.iva_profit_percentage * 100).toFixed(1)}%)</td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td className="py-2 text-right px-3">{fmt(totals.profit_iva)}</td>
                            </tr>
                            <tr className="font-semibold text-[var(--text-primary)] border-y border-[var(--border-ui)]">
                                <td className="py-2 px-3">Subtotal 3</td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td className="py-2 text-right px-3">{fmt(totals.subtotal3)}</td>
                            </tr>
                            <tr className="text-[var(--text-secondary)] hover:bg-[var(--surface)] transition-colors">
                                <td className="py-2 px-3 flex items-center gap-1">
                                    <span>Retenciones</span>
                                    <AUIEditableCell section="summary" id="global" field="withholding_percentage" value={localData.withholding_percentage} suffix="%" fmtFn={(v: any) => (v * 100).toFixed(1)} />
                                </td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td className="py-2 text-right px-3">{fmt(totals.withholdings)}</td>
                            </tr>
                            <tr className="bg-[var(--solar-gold)]/10 font-bold text-[var(--text-primary)] border-t-2 border-[var(--solar-gold)]/50">
                                <td className="py-3 px-3 text-base">Valor Total del Proyecto</td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td className="py-3 text-right px-3 text-xl text-[var(--solar-gold)]">{fmt(totals.total_value)}</td>
                            </tr>
                            <tr className="text-[var(--text-secondary)] text-xs">
                                <td colSpan={6} className="py-2 px-3 text-right">Valor por Vatio:</td>
                                <td className="py-2 px-3 text-right font-semibold text-[var(--text-primary)]">{fmt(totals.total_value / (localData.power_kwp * 1000))} / Wp</td>
                            </tr>
                            <tr className="border-t border-[var(--border-ui)]">
                                <td colSpan={7} className="py-3 px-3">
                                    <div className="flex justify-between text-xs text-[var(--text-secondary)]">
                                        <div>
                                            <span>Fecha de emisión:</span> <strong className="text-[var(--text-primary)]">{quotation.issue_date}</strong>
                                        </div>
                                        <div>
                                            <span>Válido hasta:</span> <strong className="text-[var(--text-primary)]">{quotation.expiration_date}</strong>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
